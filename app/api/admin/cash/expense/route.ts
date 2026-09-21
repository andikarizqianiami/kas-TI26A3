import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma/db'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user || !['ADMIN', 'BENDAHARA'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const expenses = await prisma.cashExpense.findMany({ orderBy: { date: 'desc' } })
    return NextResponse.json({ expenses })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || !['ADMIN', 'BENDAHARA'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { amount, description, category, date } = await request.json()
    const expense = await prisma.cashExpense.create({
      data: { 
        amount: parseInt(amount), 
        description, 
        category, 
        date: new Date(date),
        createdBy: session.user.id
      }
    })
    return NextResponse.json({ message: 'Pengeluaran berhasil ditambahkan', expense })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
