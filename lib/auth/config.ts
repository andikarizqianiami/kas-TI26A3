import { NextAuthConfig } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@auth/prisma-adapter'
import prisma from '@/lib/prisma/db'
import { verifyPassword } from './hash'

export const authConfig: NextAuthConfig = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email or NIM', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email dan password harus diisi')
        }

        const email = credentials.email as string
        const password = credentials.password as string

        // Find user by email or NIM
        let user = await prisma.user.findUnique({
          where: { email: email.toLowerCase() },
          include: { student: true },
        })

        // If not found by email, try to find by NIM
        if (!user) {
          const student = await prisma.student.findUnique({
            where: { nim: email },
            include: { user: true },
          })
          user = student?.user ? { ...student.user, student } : null
        }

        if (!user) {
          throw new Error('Email atau NIM tidak ditemukan')
        }

        if (!user.isActive) {
          throw new Error('Akun tidak aktif')
        }

        const isValid = await verifyPassword(password, user.password)
        if (!isValid) {
          throw new Error('Password salah')
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
