import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma/db'
import { BillStatus, PaymentStatus } from '@prisma/client'

export async function GET() {
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

    // Get current week bill
    const now = new Date()
    const currentBill = await prisma.bill.findFirst({
      where: {
        studentId: student.id,
        weekStartDate: {
          lte: now,
        },
        deadline: {
          gte: now,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Get all bills
    const allBills = await prisma.bill.findMany({
      where: {
        studentId: student.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Calculate statistics
    const totalBills = allBills.length
    const paidBills = allBills.filter(b => b.status === BillStatus.PAID).length
    const unpaidBills = allBills.filter(b => b.status === BillStatus.UNPAID).length
    const overdueBills = allBills.filter(b => b.status === BillStatus.OVERDUE).length
    
    const totalAmount = allBills.reduce((sum, bill) => sum + bill.amount, 0)
    const totalPaid = allBills
      .filter(b => b.status === BillStatus.PAID)
      .reduce((sum, bill) => sum + bill.amount, 0)
    const totalUnpaid = totalAmount - totalPaid

    // Get recent payments
    const recentPayments = await prisma.payment.findMany({
      where: {
        studentId: student.id,
      },
      include: {
        bill: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 5,
    })

    // Get class balance
    const totalIncome = await prisma.cashIncome.aggregate({
      _sum: {
        amount: true,
      },
    })

    const totalExpense = await prisma.cashExpense.aggregate({
      _sum: {
        amount: true,
      },
    })

    const classBalance = (totalIncome._sum.amount || 0) - (totalExpense._sum.amount || 0)

    // Get notifications
    const unreadNotifications = await prisma.notification.count({
      where: {
        studentId: student.id,
        isRead: false,
      },
    })

    // Get recent announcements
    const announcements = await prisma.announcement.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 3,
    })

    return NextResponse.json({
      student: {
        id: student.id,
        nim: student.nim,
        name: student.name,
        email: student.email,
        class: student.class,
      },
      currentBill,
      statistics: {
        totalBills,
        paidBills,
        unpaidBills,
        overdueBills,
        totalAmount,
        totalPaid,
        totalUnpaid,
      },
      classBalance,
      recentPayments,
      unreadNotifications,
      announcements,
    })
  } catch (error) {
    console.error('Get student dashboard error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
