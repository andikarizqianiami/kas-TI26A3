import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import prisma from '@/lib/prisma'

// GET /api/admin/holidays - Get all holidays
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'BENDAHARA')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const holidays = await prisma.holiday.findMany({
      orderBy: { date: 'asc' }
    })

    return NextResponse.json({ holidays })
  } catch (error) {
    console.error('Error fetching holidays:', error)
    return NextResponse.json({ error: 'Failed to fetch holidays' }, { status: 500 })
  }
}

// POST /api/admin/holidays - Create new holiday
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'BENDAHARA')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { date, name, description, isRecurring } = await request.json()

    if (!date || !name) {
      return NextResponse.json(
        { error: 'Date and name are required' },
        { status: 400 }
      )
    }

    const holiday = await prisma.holiday.create({
      data: {
        date: new Date(date),
        name,
        description,
        isRecurring: isRecurring || false
      }
    })

    // Log audit
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'CREATE_HOLIDAY',
        entity: 'Holiday',
        entityId: holiday.id,
        metadata: JSON.stringify({ name, date })
      }
    })

    return NextResponse.json({ holiday }, { status: 201 })
  } catch (error) {
    console.error('Error creating holiday:', error)
    return NextResponse.json({ error: 'Failed to create holiday' }, { status: 500 })
  }
}
