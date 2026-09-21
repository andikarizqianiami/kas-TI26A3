import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma/db'

// POST /api/funding-targets/[id]/contribute - Submit contribution
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'MAHASISWA') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { amount, method, proofImageUrl, paymentNotes } = body

    // Validation
    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Valid amount is required' }, { status: 400 })
    }

    if (!proofImageUrl) {
      return NextResponse.json({ error: 'Payment proof is required' }, { status: 400 })
    }

    // Get student
    const student = await prisma.student.findFirst({
      where: { userId: session.user.id }
    })

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 })
    }

    // Get funding target
    const target = await prisma.fundingTarget.findUnique({
      where: { id }
    })

    if (!target) {
      return NextResponse.json({ error: 'Funding target not found' }, { status: 404 })
    }

    // Check if target is active
    if (target.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'Funding target is not active' }, { status: 400 })
    }

    // Check deadline
    if (target.deadline && new Date() > target.deadline) {
      return NextResponse.json({ error: 'Funding target deadline has passed' }, { status: 400 })
    }

    // Create contribution
    const contribution = await prisma.contribution.create({
      data: {
        fundingTargetId: id,
        studentId: student.id,
        amount: parseInt(amount),
        method: method || 'MANUAL_TRANSFER',
        status: 'PENDING_VERIFICATION',
        proofImageUrl,
        paymentDate: new Date(),
        paymentNotes: paymentNotes || null
      }
    })

    // Create notification for admin/bendahara (sent to first admin)
    const adminUser = await prisma.user.findFirst({
      where: {
        role: { in: ['ADMIN', 'BENDAHARA'] },
        isActive: true
      }
    })

    if (adminUser) {
      // Note: In real app, you'd notify all admins, but for simplicity we'll create an announcement
      await prisma.announcement.create({
        data: {
          title: 'Kontribusi Baru Perlu Verifikasi',
          content: `${student.name} (${student.nim}) mengirim kontribusi Rp${amount.toLocaleString('id-ID')} untuk "${target.title}". Silakan verifikasi di halaman Target Urunan.`,
          priority: 'NORMAL',
          isActive: true,
          createdBy: adminUser.id
        }
      })
    }

    return NextResponse.json({
      message: 'Contribution submitted successfully',
      contribution
    })
  } catch (error) {
    console.error('Submit contribution error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
