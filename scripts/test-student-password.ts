import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { promptHidden, requireArg } from './lib/cli'

// Checks whether a password matches a student's account.
// Usage: npx tsx scripts/test-student-password.ts <NIM>   (password diketik tersembunyi)

const prisma = new PrismaClient()

async function testPassword() {
  const nim = requireArg(0, 'npx tsx scripts/test-student-password.ts <NIM>')

  const student = await prisma.student.findUnique({
    where: { nim },
    include: { user: true },
  })

  if (!student?.user) {
    console.log('❌ Student not found')
    return
  }

  console.log('🔍 Testing password for NIM', student.nim)
  const candidate = await promptHidden('Password yang dicek: ')
  const match = await bcrypt.compare(candidate, student.user.password)
  console.log(match ? '✅ Password cocok' : '❌ Password tidak cocok')
}

testPassword()
  .catch((e) => {
    console.error('❌ Error:', e instanceof Error ? e.message : e)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
