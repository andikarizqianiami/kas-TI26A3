import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma/db'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user || !['ADMIN', 'BENDAHARA'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id: paymentId } = await params
    const body = await request.json()
    const { reason } = body

    if (!reason || reason.trim().length === 0) {
      return NextResponse.json(
        { error: 'Alasan penolakan harus diisi' },
        { status: 400 }
      )
    }

    // Get payment
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        student: true,
      },
    })

    if (!payment) {
      return NextResponse.json(
        { error: 'Pembayaran tidak ditemukan' },
        { status: 404 }
      )
    }

    if (payment.status !== 'PENDING_VERIFICATION') {
      return NextResponse.json(
        { error: 'Pembayaran tidak dalam status menunggu verifikasi' },
        { status: 400 }
      )
    }

    // Update payment status to REJECTED
    const updatedPayment = await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: 'REJECTED',
        rejectionReason: reason,
        verifiedBy: session.user.id,
        verifiedAt: new Date(),
      },
    })

    // Create notification for student
    await prisma.notification.create({
      data: {
        studentId: payment.studentId,
        type: 'PAYMENT_REJECTED',
        title: 'Pembayaran Ditolak',
        message: `Pembayaran Anda ditolak oleh bendahara. Alasan: ${reason}. Silakan upload bukti pembayaran yang benar.`,
      },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'REJECT_PAYMENT',
        entity: 'Payment',
        entityId: payment.id,
        metadata: JSON.stringify({
          studentId: payment.studentId,
          studentName: payment.student.name,
          amount: payment.amount,
          reason,
        }),
      },
    })

    // TODO: Send WhatsApp notification if configured
    // const whatsappProvider = getWhatsAppProvider()
    // await whatsappProvider.sendMessage({
    //   to: payment.student.whatsapp,
    //   message: `Halo ${payment.student.name}, pembayaran kas TI26A3 Anda ditolak. Alasan: ${reason}. Silakan upload bukti pembayaran yang benar melalui aplikasi.`
    // })

    return NextResponse.json({
      success: true,
      payment: updatedPayment,
    })
  } catch (error) {
    console.error('Reject payment error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
