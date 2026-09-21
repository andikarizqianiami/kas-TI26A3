import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma/db'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only ADMIN and BENDAHARA can access
    if (!['ADMIN', 'BENDAHARA'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Fetch all bills with student info
    const bills = await prisma.bill.findMany({
      include: {
        student: {
          select: {
            nim: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    const stats = {
      total: bills.length,
      paid: bills.filter(b => b.status === 'PAID').length,
      unpaid: bills.filter(b => b.status === 'UNPAID').length,
      overdue: bills.filter(b => b.status === 'OVERDUE').length,
      totalAmount: bills.reduce((sum, b) => sum + b.amount, 0),
      paidAmount: bills.filter(b => b.status === 'PAID').reduce((sum, b) => sum + b.amount, 0)
    }

    return NextResponse.json({ bills, stats })
  } catch (error) {
    console.error('Error fetching bills:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
