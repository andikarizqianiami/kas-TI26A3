import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma/db'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'MAHASISWA') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const student = await prisma.student.findFirst({
      where: { userId: session.user.id },
    })

    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      )
    }

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') // PAID, UNPAID, OVERDUE, ALL
    const period = searchParams.get('period') // specific week period like "Minggu 1"
    const year = searchParams.get('year') // year filter
    const month = searchParams.get('month') // month filter (1-12)

    // Build where clause
    const where: any = {
      studentId: student.id,
    }

    if (status && status !== 'ALL') {
      where.status = status
    }

    if (period) {
      where.weekPeriod = period
    }

    if (year) {
      const yearInt = parseInt(year)
      where.createdAt = {
        gte: new Date(`${yearInt}-01-01`),
        lte: new Date(`${yearInt}-12-31`)
      }
    }

    if (month && year) {
      const yearInt = parseInt(year)
      const monthInt = parseInt(month)
      const startDate = new Date(yearInt, monthInt - 1, 1)
      const endDate = new Date(yearInt, monthInt, 0, 23, 59, 59)
      
      where.createdAt = {
        gte: startDate,
        lte: endDate
      }
    }

    // Get bills with payments
    const bills = await prisma.bill.findMany({
      where,
      include: {
        payment: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Get statistics
    const stats = {
      total: bills.length,
      paid: bills.filter(b => b.status === 'PAID').length,
      unpaid: bills.filter(b => b.status === 'UNPAID').length,
      overdue: bills.filter(b => b.status === 'OVERDUE').length,
      totalAmount: bills.reduce((sum, b) => sum + b.amount, 0),
      totalPaid: bills.filter(b => b.status === 'PAID').reduce((sum, b) => sum + b.amount, 0),
      totalUnpaid: bills.filter(b => b.status !== 'PAID').reduce((sum, b) => sum + b.amount, 0),
    }

    // Get unique periods for filter dropdown
    const allBills = await prisma.bill.findMany({
      where: { studentId: student.id },
      select: { weekPeriod: true },
      distinct: ['weekPeriod'],
      orderBy: { weekPeriod: 'asc' }
    })

    const periods = allBills.map(b => b.weekPeriod)

    return NextResponse.json({
      bills,
      statistics: stats,
      periods,
      student: {
        id: student.id,
        nim: student.nim,
        name: student.name,
      }
    })
  } catch (error) {
    console.error('Get bill history error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
