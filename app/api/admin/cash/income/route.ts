import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma/db'

// GET - List all incomes
export async function GET() {
  try {
    const session = await auth()
    if (!session?.user || !['ADMIN', 'BENDAHARA'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const incomes = await prisma.cashIncome.findMany({
      orderBy: { date: 'desc' }
    })

    return NextResponse.json({ incomes })
  } catch (error) {
    console.error('Error fetching incomes:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create new income
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || !['ADMIN', 'BENDAHARA'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { amount, description, category, date } = await request.json()

    if (!amount || !description || !category || !date) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const income = await prisma.cashIncome.create({
      data: {
        amount: parseInt(amount),
        description,
        category,
        date: new Date(date),
        createdBy: session.user.id
      }
    })

    return NextResponse.json({ message: 'Pemasukan berhasil ditambahkan', income })
  } catch (error) {
    console.error('Error creating income:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
