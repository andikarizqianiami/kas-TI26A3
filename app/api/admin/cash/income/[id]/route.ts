import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma/db'

// PUT - Update income
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user || !['ADMIN', 'BENDAHARA'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const { amount, description, category, date } = await request.json()

    const income = await prisma.cashIncome.update({
      where: { id },
      data: {
        amount: parseInt(amount),
        description,
        category,
        date: new Date(date)
      }
    })

    return NextResponse.json({ message: 'Pemasukan berhasil diupdate', income })
  } catch (error) {
    console.error('Error updating income:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Delete income
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user || !['ADMIN', 'BENDAHARA'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    await prisma.cashIncome.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Pemasukan berhasil dihapus' })
  } catch (error) {
    console.error('Error deleting income:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
