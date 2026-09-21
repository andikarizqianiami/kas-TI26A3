import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma/db'
import bcrypt from 'bcryptjs'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only ADMIN can access this endpoint
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Fetch all students
    const students = await prisma.student.findMany({
      include: {
        user: {
          select: {
            email: true,
            id: true
          }
        },
        bills: {
          where: {
            status: 'PAID'
          }
        }
      },
      orderBy: {
        nim: 'asc'
      }
    })

    return NextResponse.json({ 
      students,
      total: students.length,
      active: students.filter(s => s.isActive).length,
      inactive: students.filter(s => !s.isActive).length
    })
  } catch (error) {
    console.error('Error fetching students:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create new student with user account
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { nim, name, email, whatsapp, class: studentClass } = await request.json()

    // Validation
    if (!nim || !name || !email) {
      return NextResponse.json(
        { error: 'NIM, name, and email are required' },
        { status: 400 }
      )
    }

    // Check if NIM already exists
    const existingStudent = await prisma.student.findUnique({
      where: { nim }
    })

    if (existingStudent) {
      return NextResponse.json(
        { error: 'NIM already exists' },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 400 }
      )
    }

    // Default password is same as NIM
    const hashedPassword = await bcrypt.hash(nim, 10)

    // Create user and student in transaction
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          role: 'MAHASISWA'
        }
      })

      const student = await tx.student.create({
        data: {
          nim,
          name,
          email,
          whatsapp: whatsapp || null,
          class: studentClass || 'TI26A3',
          userId: user.id
        },
        include: {
          user: {
            select: {
              email: true,
              id: true
            }
          }
        }
      })

      // Create audit log
      await tx.auditLog.create({
        data: {
          userId: session.user.id,
          action: 'CREATE_STUDENT',
          entity: 'Student',
          entityId: student.id,
          metadata: JSON.stringify({
            nim: student.nim,
            name: student.name,
            email: student.email
          })
        }
      })

      return student
    })

    return NextResponse.json({
      message: 'Student created successfully',
      student: result,
      defaultPassword: nim
    })
  } catch (error) {
    console.error('Error creating student:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
