import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma/db'
import { FundingTargetStatus } from '@prisma/client'

// GET /api/admin/funding-targets - List all funding targets
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user || !['ADMIN', 'BENDAHARA'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') as FundingTargetStatus | null

    const where = status ? { status } : {}

    const targets = await prisma.fundingTarget.findMany({
      where,
      include: {
        contributions: {
          include: {
            student: {
              select: {
                id: true,
                name: true,
                nim: true
              }
            }
          }
        },
        _count: {
          select: {
            contributions: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Calculate statistics
    const stats = {
      total: targets.length,
      active: targets.filter(t => t.status === 'ACTIVE').length,
      completed: targets.filter(t => t.status === 'COMPLETED').length,
      cancelled: targets.filter(t => t.status === 'CANCELLED').length,
      totalCollected: targets.reduce((sum, t) => sum + t.currentAmount, 0),
      totalTarget: targets.reduce((sum, t) => sum + t.targetAmount, 0)
    }

    return NextResponse.json({ targets, stats })
  } catch (error) {
    console.error('Get funding targets error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/admin/funding-targets - Create new funding target
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user || !['ADMIN', 'BENDAHARA'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, targetAmount, deadline, imageUrl } = body

    // Validation
    if (!title || !description || !targetAmount || targetAmount <= 0) {
      return NextResponse.json(
        { error: 'Title, description, and valid target amount are required' },
        { status: 400 }
      )
    }

    const target = await prisma.fundingTarget.create({
      data: {
        title,
        description,
        targetAmount: parseInt(targetAmount),
        deadline: deadline ? new Date(deadline) : null,
        imageUrl: imageUrl || null,
        createdBy: session.user.id,
        status: 'ACTIVE'
      }
    })

    // Create notifications for all active students
    const students = await prisma.student.findMany({
      where: { isActive: true },
      select: { id: true }
    })

    await prisma.notification.createMany({
      data: students.map(student => ({
        studentId: student.id,
        type: 'ANNOUNCEMENT',
        title: 'Target Urunan Baru',
        message: `Target urunan "${title}" telah dibuat. Target: Rp${targetAmount.toLocaleString('id-ID')}. Silakan berkontribusi!`
      }))
    })

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'CREATE_FUNDING_TARGET',
        entity: 'FundingTarget',
        entityId: target.id,
        metadata: JSON.stringify({ title, targetAmount })
      }
    })

    return NextResponse.json({ message: 'Funding target created successfully', target })
  } catch (error) {
    console.error('Create funding target error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
