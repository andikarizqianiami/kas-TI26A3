import { NextAuthConfig } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from '@/lib/prisma/db'
import { verifyPassword } from './hash'

export const authConfig: NextAuthConfig = {
  // Note: Tidak pakai PrismaAdapter karena kita pakai JWT session, bukan database session
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email or NIM', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        // Invalid logins return null so Auth.js raises CredentialsSignin. Throwing a plain
        // Error is treated as a server error, and in debug mode (development) Auth.js then
        // logs the whole submitted form, including the password, to the terminal.
        const rejectLogin = (reason: string) => {
          console.warn(`[auth] Login gagal: ${reason}`)
          return null
        }

        const rawIdentifier = credentials?.email
        const password = credentials?.password
        if (typeof rawIdentifier !== 'string' || typeof password !== 'string' || !password) {
          return rejectLogin('email/NIM atau password kosong')
        }

        // Text copied from chat or docs often carries surrounding spaces or a
        // sentence-ending period ("...udb.ac.id."); neither can be part of an email or NIM
        const identifier = rawIdentifier.trim().replace(/\.+$/, '')
        if (!identifier) {
          return rejectLogin('email/NIM atau password kosong')
        }

        // Find user by email or NIM
        let user = await prisma.user.findUnique({
          where: { email: identifier.toLowerCase() },
          include: { student: true },
        })

        // If not found by email, try to find by NIM
        if (!user) {
          const student = await prisma.student.findUnique({
            where: { nim: identifier },
            include: { user: true },
          })
          user = student?.user ? { ...student.user, student } : null
        }

        if (!user) {
          return rejectLogin('email atau NIM tidak ditemukan')
        }

        if (!user.isActive) {
          return rejectLogin('akun tidak aktif')
        }

        const isValid = await verifyPassword(password, user.password)
        if (!isValid) {
          return rejectLogin('password salah')
        }

        return {
          id: user.id,
          email: user.email,
          role: user.role,
          name: user.student?.name || user.email,
          studentId: user.student?.id,
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.studentId = user.studentId
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.studentId = token.studentId as string | undefined
      }
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
  trustHost: true,
}

// Type augmentation for NextAuth
declare module 'next-auth' {
  interface User {
    role?: string
    studentId?: string
  }

  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      role: string
      studentId?: string
    }
  }

  interface JWT {
    id: string
    role: string
    studentId?: string
  }
}
