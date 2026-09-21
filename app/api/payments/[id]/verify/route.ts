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

    // Get payment
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        bill: true,
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

    const now = new Date()

    // Update payment status to PAID
    const updatedPayment = await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: 'PAID',
        verifiedBy: session.user.id,
        verifiedAt: now,
        paidAt: now,
      },
    })

    // Update bill status to PAID
    await prisma.bill.update({
      where: { id: payment.billId },
      data: {
        status: 'PAID',
        paidAt: now,
      },
    })

    // Add to cash income
    await prisma.cashIncome.create({
      data: {
        category: 'KAS_MINGGUAN',
        description: `Pembayaran kas dari ${payment.student.name} (${payment.student.nim})`,
        amount: payment.amount,
        date: now,
        paymentId: payment.id,
        createdBy: session.user.id,
        notes: `Verifikasi pembayaran ${payment.method}`,
      },
    })

    // Create notification for student
    await prisma.notification.create({
      data: {
        studentId: payment.studentId,
        type: 'PAYMENT_SUCCESS',
        title: 'Pembayaran Diverifikasi',
        message: `Pembayaran kas sebesar Rp${payment.amount.toLocaleString('id-ID')} telah diverifikasi dan dinyatakan LUNAS. Terima kasih!`,
      },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'VERIFY_PAYMENT',
        entity: 'Payment',
        entityId: payment.id,
        metadata: JSON.stringify({
          studentId: payment.studentId,
          studentName: payment.student.name,
          amount: payment.amount,
          billId: payment.billId,
        }),
      },
    })

    // TODO: Send WhatsApp notification if configured
    // const whatsappProvider = getWhatsAppProvider()
    // await whatsappProvider.sendMessage({
    //   to: payment.student.whatsapp,
    //   message: `Halo ${payment.student.name}, pembayaran kas TI26A3 sebesar Rp${payment.amount.toLocaleString('id-ID')} telah diverifikasi dan dinyatakan LUNAS. Terima kasih!`
    // })

    return NextResponse.json({
      success: true,
      payment: updatedPayment,
    })
  } catch (error) {
    console.error('Verify payment error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
