import { NextResponse } from 'next/server'

export async function GET() {
  // Only allow in development or with secret key
  const debugKey = process.env.DEBUG_SECRET || 'debug123'
  
  try {
    const checks = {
      timestamp: new Date().toISOString(),
      nodeEnv: process.env.NODE_ENV,
      
      // Environment variables
      env: {
        DATABASE_URL: process.env.DATABASE_URL ? 
          `${process.env.DATABASE_URL.substring(0, 20)}...` : 'NOT SET',
        NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 
          'SET (length: ' + process.env.NEXTAUTH_SECRET.length + ')' : 'NOT SET',
        NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'NOT SET',
      },
      
      // Database
      database: { status: 'checking...' } as any,
      
      // Auth config
      auth: { status: 'checking...' } as any,
    }

    // Test database
    try {
      const { prisma } = await import('@/lib/prisma/db')
      await prisma.$connect()
      checks.database = { status: 'connected', version: 'ok' }
      
      // Count users
      const userCount = await prisma.user.count()
      checks.database = { ...checks.database, userCount }
      
      await prisma.$disconnect()
    } catch (error) {
      checks.database = {
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }
    }

    // Test auth config
    try {
      const { authConfig } = await import('@/lib/auth/config')
      checks.auth = {
        status: 'loaded',
        hasProviders: !!authConfig.providers && authConfig.providers.length > 0,
        providerCount: authConfig.providers?.length || 0,
        sessionStrategy: authConfig.session?.strategy || 'unknown',
      }
    } catch (error) {
      checks.auth = {
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }
    }

    return NextResponse.json(checks, { status: 200 })
    
  } catch (error) {
    return NextResponse.json({
      error: 'Debug endpoint failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: process.env.NODE_ENV === 'development' ? 
        (error instanceof Error ? error.stack : undefined) : undefined
    }, { status: 500 })
  }
}
