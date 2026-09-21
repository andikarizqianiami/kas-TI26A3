import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma/db'
import { FundingTargetStatus } from '@prisma/client'

// GET /api/admin/funding-targets/[id] - Get single funding target
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const target = await prisma.fundingTarget.findUnique({
      where: { id },
      include: {
        contributions: {
          include: {
            student: {
              select: {
                id: true,
                name: true,
                nim: true,
                whatsapp: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    })

    if (!target) {
      return NextResponse.json({ error: 'Funding target not found' }, { status: 404 })
    }

    return NextResponse.json({ target })
  } catch (error) {
    console.error('Get funding target error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/admin/funding-targets/[id] - Update funding target
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user || !['ADMIN', 'BENDAHARA'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { title, description, targetAmount, deadline, imageUrl, status } = body

    // Check if exists
    const existing = await prisma.fundingTarget.findUnique({
      where: { id }
    })

    if (!existing) {
      return NextResponse.json({ error: 'Funding target not found' }, { status: 404 })
    }

    const updateData: any = {}
    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (targetAmount !== undefined) updateData.targetAmount = parseInt(targetAmount)
    if (deadline !== undefined) updateData.deadline = deadline ? new Date(deadline) : null
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl || null
    if (status !== undefined) updateData.status = status as FundingTargetStatus

    const target = await prisma.fundingTarget.update({
      where: { id },
      data: updateData
    })

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'UPDATE_FUNDING_TARGET',
        entity: 'FundingTarget',
        entityId: id,
        metadata: JSON.stringify(updateData)
      }
    })

    return NextResponse.json({ message: 'Funding target updated successfully', target })
  } catch (error) {
    console.error('Update funding target error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/admin/funding-targets/[id] - Delete (soft) funding target
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user || !['ADMIN', 'BENDAHARA'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Check if exists
    const existing = await prisma.fundingTarget.findUnique({
      where: { id }
    })

    if (!existing) {
      return NextResponse.json({ error: 'Funding target not found' }, { status: 404 })
    }

    // Soft delete by setting status to CANCELLED
    await prisma.fundingTarget.update({
      where: { id },
      data: { status: 'CANCELLED' }
    })

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'DELETE_FUNDING_TARGET',
        entity: 'FundingTarget',
        entityId: id
      }
    })

    return NextResponse.json({ message: 'Funding target cancelled successfully' })
  } catch (error) {
    console.error('Delete funding target error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
