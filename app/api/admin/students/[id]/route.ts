import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma/db'

// PUT - Update student
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const { name, email, whatsapp, class: studentClass, isActive } = await request.json()

    // Check if student exists
    const existingStudent = await prisma.student.findUnique({
      where: { id },
      include: { user: true }
    })

    if (!existingStudent) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 })
    }

    // Check email uniqueness if changed
    if (email && email !== existingStudent.email) {
      const emailExists = await prisma.user.findFirst({
        where: {
          email,
          id: { not: existingStudent.userId }
        }
      })

      if (emailExists) {
        return NextResponse.json({ error: 'Email already exists' }, { status: 400 })
      }
    }

    // Update student and user in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update student
      const student = await tx.student.update({
        where: { id },
        data: {
          name,
          email,
          whatsapp: whatsapp || null,
          class: studentClass,
          isActive: isActive !== undefined ? isActive : existingStudent.isActive
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

      // Update user email and name if changed
      if (existingStudent.userId) {
        await tx.user.update({
          where: { id: existingStudent.userId },
          data: {
            email: email || existingStudent.email,
            name: name || existingStudent.name
          }
        })
      }

      // Create audit log
      await tx.auditLog.create({
        data: {
          userId: session.user.id,
          action: 'UPDATE_STUDENT',
          entity: 'Student',
          entityId: student.id,
          metadata: JSON.stringify({
            nim: student.nim,
            name: student.name,
            email: student.email,
            isActive: student.isActive
          })
        }
      })

      return student
    })

    return NextResponse.json({
      message: 'Student updated successfully',
      student: result
    })
  } catch (error) {
    console.error('Error updating student:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Delete student (soft delete by setting isActive to false)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Check if student exists
    const student = await prisma.student.findUnique({
      where: { id }
    })

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 })
    }

    // Soft delete - set isActive to false
    await prisma.student.update({
      where: { id },
      data: {
        isActive: false
      }
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'DELETE_STUDENT',
        entity: 'Student',
        entityId: id,
        metadata: JSON.stringify({
          nim: student.nim,
          name: student.name,
          email: student.email
        })
      }
    })

    return NextResponse.json({
      message: 'Student deactivated successfully'
    })
  } catch (error) {
    console.error('Error deleting student:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
