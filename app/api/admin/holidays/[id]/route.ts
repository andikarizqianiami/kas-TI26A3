import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma/db'

// DELETE /api/admin/holidays/[id] - Delete holiday
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'BENDAHARA')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    await prisma.holiday.delete({
      where: { id }
    })

    // Log audit
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'DELETE_HOLIDAY',
        entity: 'Holiday',
        entityId: id
      }
    })

    return NextResponse.json({ message: 'Holiday deleted successfully' })
  } catch (error) {
    console.error('Error deleting holiday:', error)
    return NextResponse.json({ error: 'Failed to delete holiday' }, { status: 500 })
  }
}

// PUT /api/admin/holidays/[id] - Update holiday
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'BENDAHARA')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const { date, name, description, isRecurring } = await request.json()

    const holiday = await prisma.holiday.update({
      where: { id },
      data: {
        ...(date && { date: new Date(date) }),
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(isRecurring !== undefined && { isRecurring })
      }
    })

    // Log audit
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'UPDATE_HOLIDAY',
        entity: 'Holiday',
        entityId: id,
        metadata: JSON.stringify({ name, date })
      }
    })

    return NextResponse.json({ holiday })
  } catch (error) {
    console.error('Error updating holiday:', error)
    return NextResponse.json({ error: 'Failed to update holiday' }, { status: 500 })
  }
}
