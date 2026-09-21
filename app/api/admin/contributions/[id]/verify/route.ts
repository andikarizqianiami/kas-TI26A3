import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma/db'

// POST /api/admin/contributions/[id]/verify - Verify contribution
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user || !['ADMIN', 'BENDAHARA'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { action, rejectionReason } = body // action: "approve" or "reject"

    // Get contribution
    const contribution = await prisma.contribution.findUnique({
      where: { id },
      include: {
        fundingTarget: true,
        student: true
      }
    })

    if (!contribution) {
      return NextResponse.json({ error: 'Contribution not found' }, { status: 404 })
    }

    if (contribution.status !== 'PENDING_VERIFICATION') {
      return NextResponse.json({ error: 'Contribution already processed' }, { status: 400 })
    }

    if (action === 'approve') {
      // Update contribution status
      const updated = await prisma.contribution.update({
        where: { id },
        data: {
          status: 'VERIFIED',
          verifiedBy: session.user.id,
          verifiedAt: new Date()
        }
      })

      // Update funding target current amount
      await prisma.fundingTarget.update({
        where: { id: contribution.fundingTargetId },
        data: {
          currentAmount: {
            increment: contribution.amount
          }
        }
      })

      // Check if target is reached
      const target = await prisma.fundingTarget.findUnique({
        where: { id: contribution.fundingTargetId }
      })

      if (target && target.currentAmount + contribution.amount >= target.targetAmount) {
        await prisma.fundingTarget.update({
          where: { id: contribution.fundingTargetId },
          data: { status: 'COMPLETED' }
        })
      }

      // Create notification
      await prisma.notification.create({
        data: {
          studentId: contribution.studentId,
          type: 'PAYMENT_SUCCESS',
          title: 'Kontribusi Diverifikasi',
          message: `Kontribusi Anda sebesar Rp${contribution.amount.toLocaleString('id-ID')} untuk "${contribution.fundingTarget.title}" telah diverifikasi. Terima kasih!`
        }
      })

      // Audit log
      await prisma.auditLog.create({
        data: {
          userId: session.user.id,
          action: 'VERIFY_CONTRIBUTION',
          entity: 'Contribution',
          entityId: id,
          metadata: JSON.stringify({ action: 'approve', amount: contribution.amount })
        }
      })

      return NextResponse.json({ message: 'Contribution verified successfully', contribution: updated })
    } else if (action === 'reject') {
      // Reject contribution
      const updated = await prisma.contribution.update({
        where: { id },
        data: {
          status: 'REJECTED',
          verifiedBy: session.user.id,
          verifiedAt: new Date(),
          rejectionReason: rejectionReason || 'Ditolak oleh admin'
        }
      })

      // Create notification
      await prisma.notification.create({
        data: {
          studentId: contribution.studentId,
          type: 'PAYMENT_REJECTED',
          title: 'Kontribusi Ditolak',
          message: `Kontribusi Anda untuk "${contribution.fundingTarget.title}" ditolak. Alasan: ${rejectionReason || 'Tidak valid'}`
        }
      })

      // Audit log
      await prisma.auditLog.create({
        data: {
          userId: session.user.id,
          action: 'REJECT_CONTRIBUTION',
          entity: 'Contribution',
          entityId: id,
          metadata: JSON.stringify({ action: 'reject', reason: rejectionReason })
        }
      })

      return NextResponse.json({ message: 'Contribution rejected', contribution: updated })
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Verify contribution error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
