import { NextResponse } from 'next/server'
import type { BillStatus } from '@prisma/client'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma/db'

// Counts for the dashboard stat cards, readable by ADMIN and BENDAHARA.
// Returns aggregates only. The student list itself (/api/admin/students, with
// emails and WhatsApp numbers) stays ADMIN-only.
export async function GET() {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!['ADMIN', 'BENDAHARA'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const [totalStudents, activeStudents, billsByStatus, income, expense] = await Promise.all([
      prisma.student.count(),
      prisma.student.count({ where: { isActive: true } }),
      prisma.bill.groupBy({ by: ['status'], _count: { _all: true } }),
      prisma.cashIncome.aggregate({ _sum: { amount: true } }),
      prisma.cashExpense.aggregate({ _sum: { amount: true } }),
    ])

    const billCount = (status: BillStatus) =>
      billsByStatus.find((row) => row.status === status)?._count._all ?? 0
    const totalIncome = income._sum.amount ?? 0
    const totalExpense = expense._sum.amount ?? 0

    return NextResponse.json({
      students: { total: totalStudents, active: activeStudents },
      bills: {
        total: billsByStatus.reduce((sum, row) => sum + row._count._all, 0),
        paid: billCount('PAID'),
        unpaid: billCount('UNPAID'),
        overdue: billCount('OVERDUE'),
      },
      cash: { balance: totalIncome - totalExpense, totalIncome, totalExpense },
    })
  } catch (error) {
    console.error('Get dashboard summary error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
