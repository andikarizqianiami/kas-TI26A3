import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { promptHidden, requireArg } from './lib/cli'

// Replays the login flow from lib/auth/config.ts for one account.
// Usage: npx tsx scripts/test-auth.ts <email-atau-NIM>   (password diketik tersembunyi)

const prisma = new PrismaClient()

async function testAuth() {
  const identifier = requireArg(0, 'npx tsx scripts/test-auth.ts <email-atau-NIM>')
  const password = await promptHidden('Password: ')

  console.log('=== Testing Auth Flow ===')

  // Step 1: Find user by email
  let user = await prisma.user.findUnique({
    where: { email: identifier.toLowerCase() },
    include: { student: true },
  })
  console.log('Step 1 - Find by email:', user ? '✅ Found' : '❌ Not found')

  // Step 2: If not found by email, try NIM
  if (!user) {
    const student = await prisma.student.findUnique({
      where: { nim: identifier },
      include: { user: true },
    })
    user = student?.user ? { ...student.user, student } : null
    console.log('Step 2 - Find by NIM:', user ? '✅ Found' : '❌ Not found')
  }

  if (!user) {
    console.log('\n❌ User not found!')
    return
  }

  console.log('\n✅ User found!')
  console.log('Role:', user.role)
  console.log('Active:', user.isActive)

  // Step 3: Check if active
  if (!user.isActive) {
    console.log('\n❌ Account is not active!')
    return
  }

  // Step 4: Verify password
  const isValid = await bcrypt.compare(password, user.password)
  console.log('\nStep 4 - Password verification:', isValid ? '✅ VALID' : '❌ INVALID')
  console.log(isValid ? '\n🎉 AUTH SUCCESS! User should be able to login.' : '\n❌ AUTH FAILED! Password does not match.')
}

testAuth()
  .catch((e) => {
    console.error('❌ Error:', e instanceof Error ? e.message : e)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
