import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma/db'

export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user || !['ADMIN', 'BENDAHARA'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get all pending verification payments
    const pendingPayments = await prisma.payment.findMany({
      where: {
        status: 'PENDING_VERIFICATION',
      },
      include: {
        student: {
          select: {
            id: true,
            nim: true,
            name: true,
            email: true,
            whatsapp: true,
          },
        },
        bill: {
          select: {
            id: true,
            name: true,
            amount: true,
            deadline: true,
            weekPeriod: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Get summary stats
    const totalPending = pendingPayments.length
    const totalAmount = pendingPayments.reduce((sum, p) => sum + p.amount, 0)

    return NextResponse.json({
      payments: pendingPayments,
      summary: {
        totalPending,
        totalAmount,
      },
    })
  } catch (error) {
    console.error('Get pending payments error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
