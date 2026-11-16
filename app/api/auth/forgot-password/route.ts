import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma/db'

export async function POST(req: Request) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email harus diisi' },
        { status: 400 }
      )
    }

    // Cek apakah user ada
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email },
          { nim: email }
        ]
      }
    })

    // Untuk keamanan, selalu return success meskipun user tidak ditemukan
    // Ini mencegah enumeration attack
    if (!user) {
      return NextResponse.json({
        message: 'Jika email terdaftar, link reset password akan dikirim.'
      })
    }

    // TODO: Implementasi pengiriman email reset password
    // Di sini Anda perlu:
    // 1. Generate token reset password
    // 2. Simpan token ke database dengan expiry time
    // 3. Kirim email dengan link reset
    
    // Contoh implementasi sederhana:
    // const resetToken = crypto.randomBytes(32).toString('hex')
    // await prisma.passwordReset.create({
    //   data: {
    //     userId: user.id,
    //     token: resetToken,
    //     expiresAt: new Date(Date.now() + 3600000) // 1 jam
    //   }
    // })
    // await sendResetEmail(user.email, resetToken)

    return NextResponse.json({
      message: 'Link reset password telah dikirim ke email Anda.'
    })

  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}
