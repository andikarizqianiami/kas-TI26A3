import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma/db'

// GET /api/admin/funding-targets/[id]/contributions - Get all contributions for a target
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user || !['ADMIN', 'BENDAHARA'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    const where: any = { fundingTargetId: id }
    if (status) where.status = status

    const contributions = await prisma.contribution.findMany({
      where,
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
    })

    return NextResponse.json({ contributions })
  } catch (error) {
    console.error('Get contributions error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
