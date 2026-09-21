import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma/db'
import { saveFile, validateImageFile } from '@/lib/storage/local'

export async function POST(request: NextRequest) {
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

    const formData = await request.formData()
    const billId = formData.get('billId') as string
    const amount = parseInt(formData.get('amount') as string)
    const paymentDate = formData.get('paymentDate') as string
    const paymentNotes = formData.get('paymentNotes') as string
    const proofFile = formData.get('proofFile') as File

    // Validate
    if (!billId || !amount || !paymentDate || !proofFile) {
      return NextResponse.json(
        { error: 'Data tidak lengkap' },
        { status: 400 }
      )
    }

    // Validate bill
    const bill = await prisma.bill.findUnique({
      where: { id: billId },
    })

    if (!bill || bill.studentId !== student.id) {
      return NextResponse.json(
        { error: 'Tagihan tidak ditemukan' },
        { status: 404 }
      )
    }

    if (bill.status === 'PAID') {
      return NextResponse.json(
        { error: 'Tagihan sudah lunas' },
        { status: 400 }
      )
    }

    // Validate amount matches bill
    if (amount !== bill.amount) {
      return NextResponse.json(
        { error: `Nominal harus sesuai dengan tagihan: Rp${bill.amount.toLocaleString('id-ID')}` },
        { status: 400 }
      )
    }

    // Validate image file
    try {
      validateImageFile(proofFile)
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'File tidak valid' },
        { status: 400 }
      )
    }

    // Save proof image
    const proofImageUrl = await saveFile(proofFile, 'payment-proofs')

    // Check if payment already exists
    const existingPayment = await prisma.payment.findUnique({
      where: { billId },
    })

    if (existingPayment) {
      // Update existing payment
      const payment = await prisma.payment.update({
        where: { id: existingPayment.id },
        data: {
          amount,
          method: 'QRIS_DANA',
          status: 'PENDING_VERIFICATION',
          proofImageUrl,
          paymentDate: new Date(paymentDate),
          paymentNotes: paymentNotes || null,
        },
      })

      // Create notification for student
      await prisma.notification.create({
        data: {
          studentId: student.id,
          type: 'PAYMENT_SUCCESS',
          title: 'Bukti Pembayaran Diterima',
          message: 'Bukti pembayaran Anda telah diterima dan menunggu verifikasi bendahara.',
        },
      })

      // Create audit log
      await prisma.auditLog.create({
        data: {
          userId: session.user.id,
          action: 'UPLOAD_PAYMENT_PROOF',
          entity: 'Payment',
          entityId: payment.id,
          metadata: JSON.stringify({
            billId,
            amount,
            method: 'QRIS_DANA',
          }),
        },
      })

      return NextResponse.json({
        success: true,
        payment,
      })
    }

    // Create new payment
    const payment = await prisma.payment.create({
      data: {
        billId,
        studentId: student.id,
        amount,
        method: 'QRIS_DANA',
        status: 'PENDING_VERIFICATION',
        proofImageUrl,
        paymentDate: new Date(paymentDate),
        paymentNotes: paymentNotes || null,
      },
    })

    // Create notification
    await prisma.notification.create({
      data: {
        studentId: student.id,
        type: 'PAYMENT_SUCCESS',
        title: 'Bukti Pembayaran Diterima',
        message: 'Bukti pembayaran Anda telah diterima dan menunggu verifikasi bendahara.',
      },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'CREATE_PAYMENT',
        entity: 'Payment',
        entityId: payment.id,
        metadata: JSON.stringify({
          billId,
          amount,
          method: 'QRIS_DANA',
        }),
      },
    })

    return NextResponse.json({
      success: true,
      payment,
    })
  } catch (error) {
    console.error('Upload payment proof error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
