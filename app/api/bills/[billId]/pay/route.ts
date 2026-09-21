import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma/db'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ billId: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'MAHASISWA') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { billId } = await params
    const { method, proofImageUrl, paymentNotes } = await request.json()

    // Get student
    const student = await prisma.student.findFirst({
      where: { userId: session.user.id }
    })

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 })
    }

    // Get bill
    const bill = await prisma.bill.findUnique({
      where: { id: billId }
    })

    if (!bill) {
      return NextResponse.json({ error: 'Bill not found' }, { status: 404 })
    }

    // Check if bill belongs to student
    if (bill.studentId !== student.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Check if bill is already paid
    if (bill.status === 'PAID') {
      return NextResponse.json({ error: 'Bill already paid' }, { status: 400 })
    }

    // Check if there's already a pending payment
    const existingPayment = await prisma.payment.findFirst({
      where: {
        billId,
        status: { in: ['PENDING_VERIFICATION', 'PAID'] }
      }
    })

    if (existingPayment) {
      return NextResponse.json(
        { error: 'Payment already submitted for this bill' },
        { status: 400 }
      )
    }

    // Create payment
    const payment = await prisma.payment.create({
      data: {
        billId,
        studentId: student.id,
        amount: bill.amount,
        method: method || 'MANUAL_TRANSFER',
        status: 'PENDING_VERIFICATION',
        proofImageUrl,
        paymentDate: new Date(),
        paymentNotes
      }
    })

    // Update bill status to pending verification
    await prisma.bill.update({
      where: { id: billId },
      data: {
        status: 'UNPAID' // Keep as UNPAID until verified
      }
    })

    // Create notification for admin/bendahara
    await prisma.notification.create({
      data: {
        studentId: student.id,
        type: 'PAYMENT_PENDING',
        title: 'Pembayaran Berhasil Dikirim',
        message: `Pembayaran Anda untuk ${bill.name} sebesar ${bill.amount.toLocaleString('id-ID')} sedang menunggu verifikasi bendahara.`
      }
    })

    return NextResponse.json({
      message: 'Payment submitted successfully',
      payment
    })
  } catch (error) {
    console.error('Submit payment error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
