/**
 * Environment Variables Validation
 * Cek apakah semua required env vars sudah ada
 */

export function checkRequiredEnvVars() {
  const required = {
    DATABASE_URL: process.env.DATABASE_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  }

  const missing: string[] = []
  
  Object.entries(required).forEach(([key, value]) => {
    if (!value) {
      missing.push(key)
    }
  })

  if (missing.length > 0) {
    const error = `Missing required environment variables: ${missing.join(', ')}`
    
    if (process.env.NODE_ENV === 'production') {
      // Di production, throw error
      throw new Error(error)
    } else {
      // Di development, warning aja
      console.warn('⚠️  ' + error)
    }
  }

  return {
    valid: missing.length === 0,
    missing
  }
}

export function getEnvInfo() {
  return {
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL: process.env.DATABASE_URL ? 'Set (hidden)' : 'Not set',
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'Set (hidden)' : 'Not set',
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'Not set',
  }
}
