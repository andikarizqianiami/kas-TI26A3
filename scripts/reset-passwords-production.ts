import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

// Use production DATABASE_URL from environment or argument
const DATABASE_URL = process.env.PROD_DATABASE_URL || process.env.DATABASE_URL

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not found!')
  console.error('Usage: PROD_DATABASE_URL="your-neon-url" npx tsx scripts/reset-passwords-production.ts')
  process.exit(1)
}

const prisma = DATABASE_URL ? new PrismaClient({
  datasources: {
    db: {
      url: DATABASE_URL
    }
  }
}) : new PrismaClient()

async function resetPasswords() {
  console.log('🔄 Resetting student passwords in PRODUCTION database...\n')
  console.log('Database:', DATABASE_URL.replace(/:[^:@]+@/, ':***@'), '\n')
  
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
  
  console.log('\n✨ All student passwords reset in PRODUCTION!')
  console.log('\n📝 Students can now login with:')
  console.log('   Email: [NIM]@student.udb.ac.id')
  console.log('   Password: [NIM]')
  console.log('\nExample:')
  console.log('   Email: 2026010001@student.udb.ac.id')
  console.log('   Password: 2026010001')
  
  await prisma.$disconnect()
}

resetPasswords().catch((error) => {
  console.error('❌ Error:', error)
  prisma.$disconnect()
  process.exit(1)
})
