import { PrismaClient } from '@prisma/client'
import { requireArg } from './lib/cli'

// Shows the account state for one student (never prints password hashes).
// Usage: npx tsx scripts/check-student.ts <NIM>

const prisma = new PrismaClient()

async function checkStudent() {
  const nim = requireArg(0, 'npx tsx scripts/check-student.ts <NIM>')

  const student = await prisma.student.findFirst({
    where: { nim },
    include: { user: true },
  })

  if (!student) {
    console.log('❌ Student not found')
    return
  }

  console.log('=== Student Data ===')
  console.log('NIM:', student.nim)
  console.log('Name:', student.name)
  console.log('User Email:', student.user?.email)
  console.log('User Active:', student.user?.isActive)
  console.log('Has Password:', !!student.user?.password)
}

checkStudent()
  .catch((e) => {
    console.error('❌ Error:', e instanceof Error ? e.message : e)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
