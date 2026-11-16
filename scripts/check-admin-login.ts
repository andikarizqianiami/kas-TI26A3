import { prisma } from '@/lib/prisma/db'
import bcrypt from 'bcryptjs'

async function checkAdmin() {
  console.log('🔍 Checking admin users in database...\n')
  
  // Check admin
  const admin = await prisma.user.findUnique({
    where: { email: 'admin@ti26a3.udb.ac.id' },
    select: { 
      id: true, 
      email: true, 
      role: true, 
      isActive: true,
      password: true 
    }
  })
  
  if (!admin) {
    console.log('❌ Admin user NOT FOUND in database!')
    console.log('   Perlu seeding database terlebih dahulu.')
    return
  }
  
  console.log('✅ Admin user found:')
  console.log('   Email:', admin.email)
  console.log('   Role:', admin.role)
  console.log('   Active:', admin.isActive)
  
  // Test password
  const testPassword = 'admin123456789'
  const isValid = await bcrypt.compare(testPassword, admin.password)
  console.log('\n🔐 Password test:')
  console.log('   Testing password:', testPassword)
  console.log('   Valid:', isValid ? '✅ YES - Login akan berhasil!' : '❌ NO - Password salah!')
  
  if (isValid) {
    console.log('\n   👉 Anda bisa login dengan:')
    console.log('      Email: admin@ti26a3.udb.ac.id')
    console.log('      Password: admin123456789')
  }
  
  // Check bendahara
  console.log('\n' + '='.repeat(50) + '\n')
  const bendahara = await prisma.user.findUnique({
    where: { email: 'bendahara@ti26a3.udb.ac.id' },
    select: { 
      email: true, 
      role: true, 
      isActive: true,
      password: true 
    }
  })
  
  if (!bendahara) {
    console.log('❌ Bendahara user NOT FOUND in database!')
    return
  }
  
  console.log('✅ Bendahara user found:')
  console.log('   Email:', bendahara.email)
  console.log('   Role:', bendahara.role)
  console.log('   Active:', bendahara.isActive)
  
  const testPassword2 = 'bendahara123456789'
  const isValid2 = await bcrypt.compare(testPassword2, bendahara.password)
  console.log('\n🔐 Password test:')
  console.log('   Testing password:', testPassword2)
  console.log('   Valid:', isValid2 ? '✅ YES - Login akan berhasil!' : '❌ NO - Password salah!')
  
  if (isValid2) {
    console.log('\n   👉 Anda bisa login dengan:')
    console.log('      Email: bendahara@ti26a3.udb.ac.id')
    console.log('      Password: bendahara123456789')
  }
  
  console.log('\n' + '='.repeat(50))
  console.log('✨ Test selesai!')
}

checkAdmin()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
