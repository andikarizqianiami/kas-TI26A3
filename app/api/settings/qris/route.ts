import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma/db'

export async function GET() {
  try {
    // Get active QRIS DANA payment account
    const qrisAccount = await prisma.paymentAccount.findFirst({
      where: {
        type: 'QRIS_DANA',
        isActive: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    if (!qrisAccount) {
      return NextResponse.json({
        configured: false,
        message: 'QRIS belum dikonfigurasi oleh administrator.',
      })
    }

    return NextResponse.json({
      configured: true,
      qris: {
        id: qrisAccount.id,
        name: qrisAccount.name,
        accountName: qrisAccount.accountName,
        qrisImageUrl: qrisAccount.qrisImageUrl,
        description: qrisAccount.description,
      },
    })
  } catch (error) {
    console.error('Get QRIS settings error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
