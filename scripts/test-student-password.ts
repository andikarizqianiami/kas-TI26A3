import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function testPassword() {
  const student = await prisma.student.findUnique({
    where: { nim: '2026010001' },
    include: { user: true }
  })
  
  if (!student?.user) {
    console.log('❌ Student not found')
    return
  }
  
  console.log('🔍 Testing passwords for:', student.user.email)
  console.log('')
  
  const testPasswords = [
    '2026010001',
    'password',
    'mahasiswa',
    'student',
    'admin123',
    '123456'
  ]
  
  for (const pwd of testPasswords) {
    const match = await bcrypt.compare(pwd, student.user.password)
    if (match) {
      console.log(`✅ FOUND! Password: "${pwd}"`)
      break
    } else {
      console.log(`❌ Not: "${pwd}"`)
    }
  }
  
  await prisma.$disconnect()
}

testPassword().catch(console.error)
