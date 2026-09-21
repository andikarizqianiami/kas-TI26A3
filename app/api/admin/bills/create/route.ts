import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma/db'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only ADMIN and BENDAHARA can create bills
    if (!['ADMIN', 'BENDAHARA'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const {
      type,
      studentId,
      name,
      description,
      amount,
      weekPeriod,
      weekStartDate,
      deadline
    } = body

    // Validation
    if (!type || !['individual', 'mass'].includes(type)) {
      return NextResponse.json({ error: 'Invalid bill type' }, { status: 400 })
    }

    if (!name || !amount || !weekPeriod || !weekStartDate || !deadline) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (amount <= 0) {
      return NextResponse.json({ error: 'Amount must be greater than 0' }, { status: 400 })
    }

    if (type === 'individual') {
      if (!studentId) {
        return NextResponse.json({ error: 'Student ID required for individual bill' }, { status: 400 })
      }

      // Check if student exists
      const student = await prisma.student.findUnique({
        where: { id: studentId }
      })

      if (!student) {
        return NextResponse.json({ error: 'Student not found' }, { status: 404 })
      }

      // Check for duplicate bill (same student + same week period)
      const existingBill = await prisma.bill.findFirst({
        where: {
          studentId,
          weekPeriod
        }
      })

      if (existingBill) {
        return NextResponse.json({ 
          error: `Tagihan untuk periode ${weekPeriod} sudah ada untuk mahasiswa ini` 
        }, { status: 400 })
      }

      // Create individual bill
      const bill = await prisma.bill.create({
        data: {
          studentId,
          name,
          description: description || '',
          amount: parseInt(amount),
          weekPeriod,
          weekStartDate: new Date(weekStartDate),
          deadline: new Date(deadline),
          status: 'UNPAID'
        }
      })

      return NextResponse.json({
        message: 'Tagihan berhasil dibuat',
        bill
      })
    }

    // Mass creation
    if (type === 'mass') {
      // Get all active students
      const students = await prisma.student.findMany({
        where: { isActive: true }
      })

      if (students.length === 0) {
        return NextResponse.json({ error: 'No active students found' }, { status: 400 })
      }

      // Check for existing bills for this period
      const existingBills = await prisma.bill.findMany({
        where: {
          weekPeriod,
          studentId: {
            in: students.map(s => s.id)
          }
        }
      })

      // Filter out students who already have bills for this period
      const studentsWithoutBills = students.filter(
        s => !existingBills.some(b => b.studentId === s.id)
      )

      if (studentsWithoutBills.length === 0) {
        return NextResponse.json({ 
          error: `Semua mahasiswa sudah memiliki tagihan untuk periode ${weekPeriod}` 
        }, { status: 400 })
      }

      // Create bills for all students
      const billsData = studentsWithoutBills.map(student => ({
        studentId: student.id,
        name,
        description: description || '',
        amount: parseInt(amount),
        weekPeriod,
        weekStartDate: new Date(weekStartDate),
        deadline: new Date(deadline),
        status: 'UNPAID' as const
      }))

      const result = await prisma.bill.createMany({
        data: billsData
      })

      return NextResponse.json({
        message: `Berhasil membuat ${result.count} tagihan untuk ${studentsWithoutBills.length} mahasiswa`,
        count: result.count,
        skipped: students.length - studentsWithoutBills.length
      })
    }

    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })

  } catch (error) {
    console.error('Error creating bill:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
