import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function testAuth() {
  const email = '2026010001@student.udb.ac.id'
  const password = '2026010001'
  
  console.log('=== Testing Auth Flow ===')
  console.log('Attempting login with:')
  console.log('Email:', email)
  console.log('Password:', password)
  console.log()
  
  // Step 1: Find user by email
  let user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    include: { student: true },
  })
  
  console.log('Step 1 - Find by email:', user ? '✅ Found' : '❌ Not found')
  
  // Step 2: If not found by email, try NIM
  if (!user) {
    console.log('Trying to find by NIM...')
    const student = await prisma.student.findUnique({
      where: { nim: email },
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
  console.log('Email:', user.email)
  console.log('Active:', user.isActive)
  console.log('Has Password:', !!user.password)
  
  // Step 3: Check if active
  if (!user.isActive) {
    console.log('\n❌ Account is not active!')
    return
  }
  
  console.log('\n✅ Account is active')
  
  // Step 4: Verify password
  const isValid = await bcrypt.compare(password, user.password)
  console.log('\nStep 4 - Password verification:', isValid ? '✅ VALID' : '❌ INVALID')
  
  if (isValid) {
    console.log('\n🎉 AUTH SUCCESS! User should be able to login.')
  } else {
    console.log('\n❌ AUTH FAILED! Password does not match.')
  }
  
  await prisma.$disconnect()
}

testAuth()
