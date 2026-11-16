import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { requireArg } from './lib/cli'

// Reports whether a student still uses the default password (= NIM).
// Usage: npx tsx scripts/test-password.ts <NIM>

const prisma = new PrismaClient()

async function testPassword() {
  const nim = requireArg(0, 'npx tsx scripts/test-password.ts <NIM>')

  const student = await prisma.student.findFirst({
    where: { nim },
    include: { user: true },
  })

  if (!student?.user) {
    console.log('❌ Student tidak ditemukan')
    return
  }

  const usesDefault = await bcrypt.compare(student.nim, student.user.password)
  console.log('=== Testing Password ===')
  console.log('NIM:', student.nim)
  console.log('Masih memakai password default (NIM)?', usesDefault ? '⚠️ YA' : '✅ TIDAK')
}

testPassword()
  .catch((e) => {
    console.error('❌ Error:', e instanceof Error ? e.message : e)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
