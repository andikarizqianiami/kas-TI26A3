import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma/db'

// GET /api/funding-targets/[id] - Get single funding target details
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

    // Get student ID if mahasiswa
    let studentId: string | null = null
    if (session.user.role === 'MAHASISWA') {
      const student = await prisma.student.findFirst({
        where: { userId: session.user.id }
      })
      studentId = student?.id || null
    }

    const target = await prisma.fundingTarget.findUnique({
      where: { id },
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
            orderBy: {
              createdAt: 'desc'
            }
          }
        })
      }
    })

    if (!target) {
      return NextResponse.json({ error: 'Funding target not found' }, { status: 404 })
    }

    const progressPercentage = Math.min(100, Math.round((target.currentAmount / target.targetAmount) * 100))
    const contributorsCount = target._count.contributions

    return NextResponse.json({
      target: {
        ...target,
        progressPercentage,
        contributorsCount,
        myContributions: studentId ? target.contributions : []
      }
    })
  } catch (error) {
    console.error('Get funding target error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
