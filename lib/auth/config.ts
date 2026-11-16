import { NextAuthConfig } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from '@/lib/prisma/db'
import bcrypt from 'bcryptjs'

export const authConfig: NextAuthConfig = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email or NIM', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          const rawIdentifier = credentials?.email
          const password = credentials?.password
          
          if (!rawIdentifier || !password || typeof rawIdentifier !== 'string' || typeof password !== 'string') {
            return null
          }

          const identifier = rawIdentifier.trim().replace(/\.+$/, '')
          
          // Find user by email
          let user = await prisma.user.findUnique({
            where: { email: identifier.toLowerCase() },
            include: { student: true },
          })

          // If not found by email, try NIM
          if (!user) {
            const student = await prisma.student.findUnique({
              where: { nim: identifier },
              include: { user: true },
            })
            user = student?.user ? { ...student.user, student } : null
          }

          if (!user || !user.isActive) {
            return null
          }

          const isValid = await bcrypt.compare(password, user.password)
          if (!isValid) {
            return null
          }

          return {
            id: user.id,
            email: user.email,
            role: user.role,
            name: user.student?.name || user.email,
            studentId: user.student?.id,
          }
        } catch (error) {
          console.error('[Auth Error]:', error)
          return null
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
