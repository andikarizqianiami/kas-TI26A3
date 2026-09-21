import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ billId: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { billId: id } = await params

    const bill = await prisma.bill.findUnique({
      where: { id },
      include: {
        student: true,
        payment: true
      }
    })

    if (!bill) {
      return NextResponse.json({ error: 'Bill not found' }, { status: 404 })
    }

    // Check authorization
    if (session.user.role === 'MAHASISWA') {
      const student = await prisma.student.findFirst({
        where: { userId: session.user.id }
      })

      if (!student || bill.studentId !== student.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
      }
    }

    return NextResponse.json({ bill })
  } catch (error) {
    console.error('Get bill error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
