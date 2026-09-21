import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma/db'
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, subMonths, format } from 'date-fns'

export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user || !['ADMIN', 'BENDAHARA'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const now = new Date()

    // 1. Payment Trends - Last 6 months
    const paymentTrends = []
    for (let i = 5; i >= 0; i--) {
      const date = subMonths(now, i)
      const startDate = startOfMonth(date)
      const endDate = endOfMonth(date)

      const payments = await prisma.payment.findMany({
        where: {
          status: 'PAID',
          paidAt: {
            gte: startDate,
            lte: endDate
          }
        }
      })

      const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0)
      const count = payments.length

      paymentTrends.push({
        month: format(date, 'MMM yyyy'),
        amount: totalAmount,
        count: count,
        monthKey: format(date, 'yyyy-MM')
      })
    }

    // 2. Cash Flow - Income vs Expense last 6 months
    const cashFlow = []
    for (let i = 5; i >= 0; i--) {
      const date = subMonths(now, i)
      const startDate = startOfMonth(date)
      const endDate = endOfMonth(date)

      const incomeResult = await prisma.cashIncome.aggregate({
        where: {
          date: {
            gte: startDate,
            lte: endDate
          }
        },
        _sum: {
          amount: true
        }
      })

      const expenseResult = await prisma.cashExpense.aggregate({
        where: {
          date: {
            gte: startDate,
            lte: endDate
          }
        },
        _sum: {
          amount: true
        }
      })

      cashFlow.push({
        month: format(date, 'MMM yyyy'),
        income: incomeResult._sum.amount || 0,
        expense: expenseResult._sum.amount || 0,
        net: (incomeResult._sum.amount || 0) - (expenseResult._sum.amount || 0)
      })
    }

    // 3. Payment Status Distribution
    const allBills = await prisma.bill.findMany({
      select: {
        status: true
      }
    })

    const statusDistribution = {
      paid: allBills.filter(b => b.status === 'PAID').length,
      unpaid: allBills.filter(b => b.status === 'UNPAID').length,
      overdue: allBills.filter(b => b.status === 'OVERDUE').length
    }

    // 4. Top Students by Payment Count
    const studentsWithPaymentCount = await prisma.student.findMany({
      include: {
        bills: {
          where: {
            status: 'PAID'
          }
        }
      },
      take: 5
    })

    const topStudents = studentsWithPaymentCount
      .map(student => ({
        name: student.name,
        nim: student.nim,
        paidCount: student.bills.length,
        totalPaid: student.bills.reduce((sum, b) => sum + b.amount, 0)
      }))
      .sort((a, b) => b.paidCount - a.paidCount)
      .slice(0, 5)

    // 5. Income by Category
    const incomeByCategory = await prisma.cashIncome.groupBy({
      by: ['category'],
      _sum: {
        amount: true
      },
      _count: true
    })

    const incomeCategories = incomeByCategory.map(item => ({
      category: item.category,
      amount: item._sum.amount || 0,
      count: item._count
    }))

    // 6. Expense by Category
    const expenseByCategory = await prisma.cashExpense.groupBy({
      by: ['category'],
      _sum: {
        amount: true
      },
      _count: true
    })

    const expenseCategories = expenseByCategory.map(item => ({
      category: item.category,
      amount: item._sum.amount || 0,
      count: item._count
    }))

    // 7. Weekly Payment Activity (last 4 weeks)
    const weeklyActivity = []
    for (let i = 3; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - (i * 7))
      const startDate = startOfWeek(date, { weekStartsOn: 1 })
      const endDate = endOfWeek(date, { weekStartsOn: 1 })

      const payments = await prisma.payment.findMany({
        where: {
          status: 'PAID',
          paidAt: {
            gte: startDate,
            lte: endDate
          }
        }
      })

      weeklyActivity.push({
        week: `Minggu ${4 - i}`,
        count: payments.length,
        amount: payments.reduce((sum, p) => sum + p.amount, 0)
      })
    }

    // 8. Current Balance
    const totalIncome = await prisma.cashIncome.aggregate({
      _sum: { amount: true }
    })
    const totalExpense = await prisma.cashExpense.aggregate({
      _sum: { amount: true }
    })
    const currentBalance = (totalIncome._sum.amount || 0) - (totalExpense._sum.amount || 0)

    return NextResponse.json({
      paymentTrends,
      cashFlow,
      statusDistribution,
      topStudents,
      incomeCategories,
      expenseCategories,
      weeklyActivity,
      currentBalance,
      summary: {
        totalIncome: totalIncome._sum.amount || 0,
        totalExpense: totalExpense._sum.amount || 0,
        totalBills: allBills.length,
        totalStudents: studentsWithPaymentCount.length
      }
    })
  } catch (error) {
    console.error('Get dashboard stats error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
