import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function resetPasswords() {
  console.log('🔄 Resetting student passwords to their NIM...\n')
  
  const students = await prisma.student.findMany({
    include: { user: true }
  })
  
  console.log(`Found ${students.length} students\n`)
  
  for (const student of students) {
    if (student.user) {
      // Set password = NIM
      const hashedPassword = await bcrypt.hash(student.nim, 10)
      
      await prisma.user.update({
        where: { id: student.user.id },
        data: { password: hashedPassword }
      })
      
      console.log(`✅ ${student.nim} (${student.name}) - Password reset to: ${student.nim}`)
    }
  }
  
  console.log('\n✨ All student passwords reset!')
  console.log('\n📝 Students can now login with:')
  console.log('   Email/NIM: [their NIM]')
  console.log('   Password: [their NIM]')
  console.log('\nExample:')
  console.log('   Email/NIM: 2026010001')
  console.log('   Password: 2026010001')
  
  await prisma.$disconnect()
}

resetPasswords().catch(console.error)
