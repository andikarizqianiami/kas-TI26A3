import { NextResponse } from 'next/server'

/**
 * Endpoint untuk validate environment variables
 * Hanya accessible di development atau dengan secret key
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const key = searchParams.get('key')
  
  // Simple protection
  if (process.env.NODE_ENV === 'production' && key !== process.env.DEBUG_SECRET) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const validation = {
    timestamp: new Date().toISOString(),
    nodeEnv: process.env.NODE_ENV,
    
    required: {
      DATABASE_URL: {
        exists: !!process.env.DATABASE_URL,
        format: process.env.DATABASE_URL?.startsWith('postgresql://') || process.env.DATABASE_URL?.startsWith('postgres://'),
        value: process.env.DATABASE_URL ? 
          process.env.DATABASE_URL.substring(0, 30) + '...' : 'NOT SET'
      },
      NEXTAUTH_SECRET: {
        exists: !!process.env.NEXTAUTH_SECRET,
        length: process.env.NEXTAUTH_SECRET?.length || 0,
        sufficient: (process.env.NEXTAUTH_SECRET?.length || 0) >= 32
      },
      NEXTAUTH_URL: {
        exists: !!process.env.NEXTAUTH_URL,
        value: process.env.NEXTAUTH_URL || 'NOT SET',
        hasHttps: process.env.NEXTAUTH_URL?.startsWith('https://'),
        correctFormat: /^https:\/\/.+/.test(process.env.NEXTAUTH_URL || '')
      }
    },
    
    optional: {
      ADMIN_DEFAULT_PASSWORD: !!process.env.ADMIN_DEFAULT_PASSWORD,
      BENDAHARA_DEFAULT_PASSWORD: !!process.env.BENDAHARA_DEFAULT_PASSWORD,
    },
    
    summary: {
      allRequired: false,
      missingRequired: [] as string[]
    }
  }

  // Check all required
  const missing: string[] = []
  
  if (!validation.required.DATABASE_URL.exists) missing.push('DATABASE_URL')
  if (!validation.required.NEXTAUTH_SECRET.exists) missing.push('NEXTAUTH_SECRET')
  if (!validation.required.NEXTAUTH_URL.exists) missing.push('NEXTAUTH_URL')
  
  validation.summary.allRequired = missing.length === 0
  validation.summary.missingRequired = missing

  return NextResponse.json(validation, {
    status: validation.summary.allRequired ? 200 : 500
  })
}
