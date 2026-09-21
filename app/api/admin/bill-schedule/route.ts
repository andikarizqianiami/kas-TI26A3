import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma/db'

// GET /api/admin/bill-schedule - Get all bill schedules
export async function GET() {
  try {
    const session = await auth()
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'BENDAHARA')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const schedules = await prisma.billSchedule.findMany({
      orderBy: { weekStartDate: 'desc' },
      take: 20
    })

    return NextResponse.json({ schedules })
  } catch (error) {
    console.error('Error fetching bill schedules:', error)
    return NextResponse.json({ error: 'Failed to fetch bill schedules' }, { status: 500 })
  }
}

// POST /api/admin/bill-schedule - Create new bill schedule
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'BENDAHARA')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { weekStartDate, weekEndDate, billDay, amount, notes } = await request.json()

    if (!weekStartDate || !weekEndDate || !billDay) {
      return NextResponse.json(
        { error: 'Week dates and bill day are required' },
        { status: 400 })
    }

    // Calculate bill date based on day
    const billDate = await calculateBillDate(new Date(weekStartDate), billDay)

    const schedule = await prisma.billSchedule.create({
      data: {
        weekStartDate: new Date(weekStartDate),
        weekEndDate: new Date(weekEndDate),
        billDay,
        billDate,
        amount: amount || 5000,
        notes
      }
    })

    // Log audit
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'CREATE_BILL_SCHEDULE',
        entity: 'BillSchedule',
        entityId: schedule.id,
        metadata: JSON.stringify({ weekStartDate, billDay, amount })
      }
    })

    return NextResponse.json({ schedule }, { status: 201 })
  } catch (error) {
    console.error('Error creating bill schedule:', error)
    return NextResponse.json({ error: 'Failed to create bill schedule' }, { status: 500 })
  }
}

// Helper function to calculate bill date and adjust for holidays
async function calculateBillDate(weekStart: Date, dayName: string): Promise<Date> {
  const dayMap: { [key: string]: number } = {
    SUNDAY: 0,
    MONDAY: 1,
    TUESDAY: 2,
    WEDNESDAY: 3,
    THURSDAY: 4,
    FRIDAY: 5,
    SATURDAY: 6
  }

  const targetDay = dayMap[dayName]
  const currentDay = weekStart.getDay()
  let daysToAdd = (targetDay - currentDay + 7) % 7

  let billDate = new Date(weekStart)
  billDate.setDate(billDate.getDate() + daysToAdd)

  // Check if bill date is a holiday
  const holidays = await prisma.holiday.findMany({
    where: {
      date: {
        gte: billDate,
        lte: new Date(billDate.getTime() + 7 * 24 * 60 * 60 * 1000) // Next 7 days
      }
    }
  })

  // If bill date is a holiday, move to next non-holiday weekday
  while (isHoliday(billDate, holidays) || billDate.getDay() === 0 || billDate.getDay() === 6) {
    billDate.setDate(billDate.getDate() + 1)
  }

  return billDate
}

function isHoliday(date: Date, holidays: any[]): boolean {
  const dateStr = date.toISOString().split('T')[0]
  return holidays.some(h => {
    const holidayStr = new Date(h.date).toISOString().split('T')[0]
    return holidayStr === dateStr
  })
}
