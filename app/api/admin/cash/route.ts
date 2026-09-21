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

    // Get all incomes and expenses
    const incomes = await prisma.cashIncome.findMany({
      orderBy: { date: 'desc' }
    })

    const expenses = await prisma.cashExpense.findMany({
      orderBy: { date: 'desc' }
    })

    // Calculate totals
    const totalIncome = incomes.reduce((sum, item) => sum + item.amount, 0)
    const totalExpense = expenses.reduce((sum, item) => sum + item.amount, 0)
    const balance = totalIncome - totalExpense

    // Get recent transactions (last 10)
    const recentIncomes = incomes.slice(0, 10).map(item => ({
      id: item.id,
      amount: item.amount,
      description: item.description,
      date: item.date,
      source: item.source
    }))

    const recentExpenses = expenses.slice(0, 10).map(item => ({
      id: item.id,
      amount: item.amount,
      description: item.description,
      date: item.date,
      category: item.category
    }))

    return NextResponse.json({
      balance,
      totalIncome,
      totalExpense,
      recentIncomes,
      recentExpenses,
      stats: {
        incomeCount: incomes.length,
        expenseCount: expenses.length
      }
    })
  } catch (error) {
    console.error('Error fetching cash data:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
