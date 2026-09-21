import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma/db'
import { hashPassword } from '@/lib/auth/hash'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, nim, email, password, whatsapp } = body

    if (!name || !nim || !email || !password) {
      return NextResponse.json({ error: 'Semua field harus diisi' }, { status: 400 })
    }

    const existingStudent = await prisma.student.findUnique({ where: { nim } })
    if (existingStudent) {
      return NextResponse.json({ error: 'NIM sudah terdaftar' }, { status: 400 })
    }

    const existingUser = await prisma.user.findUnique({ where: { email: email.toLowerCase() } })
    if (existingUser) {
      return NextResponse.json({ error: 'Email sudah terdaftar' }, { status: 400 })
    }

    const hashedPassword = await hashPassword(password)

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: { email: email.toLowerCase(), password: hashedPassword, role: 'MAHASISWA', isActive: true }
      })
      const student = await tx.student.create({
        data: { nim, name, email: email.toLowerCase(), whatsapp: whatsapp || '', class: 'TI26A3', userId: user.id }
      })
      return { user, student }
    })

    return NextResponse.json({ message: 'Registrasi berhasil', student: { id: result.student.id, nim: result.student.nim, name: result.student.name } }, { status: 201 })
  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan saat registrasi' }, { status: 500 })
  }
}
