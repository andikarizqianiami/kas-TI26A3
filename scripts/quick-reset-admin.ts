import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🔄 Resetting Admin & Bendahara passwords...')
  
  // Password baru - GANTI INI SESUAI KEINGINAN ANDA
  const adminPassword = 'admin123456789'  // Min 12 karakter
  const bendaharaPassword = 'bendahara123456789'  // Min 12 karakter
  
  // Hash passwords
  const adminHash = await bcrypt.hash(adminPassword, 10)
  const bendaharaHash = await bcrypt.hash(bendaharaPassword, 10)
  
  // Update Admin
  const admin = await prisma.user.update({
    where: { email: 'admin@ti26a3.udb.ac.id' },
    data: { password: adminHash }
  })
  console.log('✅ Admin password updated:', admin.email)
  console.log('   New password:', adminPassword)
  
  // Update Bendahara
  const bendahara = await prisma.user.update({
    where: { email: 'bendahara@ti26a3.udb.ac.id' },
    data: { password: bendaharaHash }
  })
  console.log('✅ Bendahara password updated:', bendahara.email)
  console.log('   New password:', bendaharaPassword)
  
  console.log('\n✨ Done! You can now login with:')
  console.log('   Admin: admin@ti26a3.udb.ac.id / ' + adminPassword)
  console.log('   Bendahara: bendahara@ti26a3.udb.ac.id / ' + bendaharaPassword)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
