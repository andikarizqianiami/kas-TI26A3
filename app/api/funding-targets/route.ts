import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma/db'

// GET /api/funding-targets - List active funding targets (for students)
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get student ID if mahasiswa
    let studentId: string | null = null
    if (session.user.role === 'MAHASISWA') {
      const student = await prisma.student.findFirst({
        where: { userId: session.user.id }
      })
      studentId = student?.id || null
    }

    const targets = await prisma.fundingTarget.findMany({
      where: {
        status: {
          in: ['ACTIVE', 'COMPLETED']
        }
      },
      include: {
        _count: {
          select: {
            contributions: {
              where: {
                status: 'VERIFIED'
              }
            }
          }
        },
        ...(studentId && {
          contributions: {
            where: {
              studentId
            },
            select: {
              id: true,
              amount: true,
              status: true,
              createdAt: true
            }
          }
        })
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Calculate progress percentage
    const targetsWithProgress = targets.map(target => ({
      ...target,
      progressPercentage: Math.min(100, Math.round((target.currentAmount / target.targetAmount) * 100)),
      contributorsCount: target._count.contributions,
      myContributions: studentId ? target.contributions : []
    }))

    return NextResponse.json({ targets: targetsWithProgress })
  } catch (error) {
    console.error('Get funding targets error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
