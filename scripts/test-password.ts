import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function testPassword() {
  const student = await prisma.student.findFirst({
    where: { nim: '2026010001' },
    include: { user: true }
  })
  
  if (!student?.user) {
    console.log('❌ Student tidak ditemukan')
    return
  }
  
  console.log('=== Testing Password ===')
  console.log('Email:', student.user.email)
  console.log('NIM:', student.nim)
  console.log('Stored Hash:', student.user.password?.substring(0, 30) + '...')
  
  // Test password = NIM
  const testPassword = student.nim
  const isValid = await bcrypt.compare(testPassword, student.user.password!)
  
  console.log('\nTest Password:', testPassword)
  console.log('Is Valid?', isValid ? '✅ YES' : '❌ NO')
  
  // Create new hash for comparison
  const newHash = await bcrypt.hash(testPassword, 10)
  console.log('\nNew Hash (for reference):', newHash.substring(0, 30) + '...')
  
  await prisma.$disconnect()
}

testPassword()
