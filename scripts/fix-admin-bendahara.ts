import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../lib/auth/hash'

const prisma = new PrismaClient()

async function fixAdminBendahara() {
  console.log('🔧 Fixing Admin and Bendahara users...\n')

  // Password yang kuat
  const adminPassword = 'Admin@TI26A3#2024'
  const bendaharaPassword = 'Bendahara@TI26A3#2024'

  // Hash passwords
  const adminHash = await hashPassword(adminPassword)
  const bendaharaHash = await hashPassword(bendaharaPassword)

  // Update admin email dan password
  console.log('1️⃣ Updating admin user...')
  const adminResult = await prisma.user.updateMany({
    where: { email: 'admin@kas-ti26a3.test' },
    data: {
      email: 'admin@ti26a3.udb.ac.id',
      password: adminHash,
    }
  })
  
  if (adminResult.count > 0) {
    console.log('   ✅ Admin updated successfully')
    console.log(`   - New email: admin@ti26a3.udb.ac.id`)
    console.log(`   - New password: ${adminPassword}\n`)
  } else {
    // Try to create if not exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@ti26a3.udb.ac.id' }
    })
    
    if (!existingAdmin) {
      await prisma.user.create({
        data: {
          email: 'admin@ti26a3.udb.ac.id',
          password: adminHash,
          role: 'ADMIN',
          isActive: true,
        }
      })
      console.log('   ✅ Admin created successfully\n')
    } else {
      // Update existing
      await prisma.user.update({
        where: { email: 'admin@ti26a3.udb.ac.id' },
        data: { password: adminHash }
      })
      console.log('   ✅ Admin password updated\n')
    }
  }

  // Update bendahara email dan password
  console.log('2️⃣ Updating bendahara user...')
  const bendaharaResult = await prisma.user.updateMany({
    where: { email: 'bendahara@kas-ti26a3.test' },
    data: {
      email: 'bendahara@ti26a3.udb.ac.id',
      password: bendaharaHash,
    }
  })
  
  if (bendaharaResult.count > 0) {
    console.log('   ✅ Bendahara updated successfully')
    console.log(`   - New email: bendahara@ti26a3.udb.ac.id`)
    console.log(`   - New password: ${bendaharaPassword}\n`)
  } else {
    // Try to create if not exists
    const existingBendahara = await prisma.user.findUnique({
      where: { email: 'bendahara@ti26a3.udb.ac.id' }
    })
    
    if (!existingBendahara) {
      await prisma.user.create({
        data: {
          email: 'bendahara@ti26a3.udb.ac.id',
          password: bendaharaHash,
          role: 'BENDAHARA',
          isActive: true,
        }
      })
      console.log('   ✅ Bendahara created successfully\n')
    } else {
      // Update existing
      await prisma.user.update({
        where: { email: 'bendahara@ti26a3.udb.ac.id' },
        data: { password: bendaharaHash }
      })
      console.log('   ✅ Bendahara password updated\n')
    }
  }

  console.log('✅ Done!\n')
  console.log('📝 Login Credentials:')
  console.log('   Admin:')
  console.log(`   - Email: admin@ti26a3.udb.ac.id`)
  console.log(`   - Password: ${adminPassword}\n`)
  console.log('   Bendahara:')
  console.log(`   - Email: bendahara@ti26a3.udb.ac.id`)
  console.log(`   - Password: ${bendaharaPassword}\n`)
}

fixAdminBendahara()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
