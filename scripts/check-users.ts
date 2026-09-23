import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkUsers() {
  console.log('🔍 Checking users in database...\n')

  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: 'asc'
    }
  })

  console.log(`Found ${users.length} users:\n`)
  
  users.forEach((user, index) => {
    console.log(`${index + 1}. ${user.email}`)
    console.log(`   - Role: ${user.role}`)
    console.log(`   - Active: ${user.isActive}`)
    console.log(`   - Created: ${user.createdAt.toISOString()}`)
    console.log(`   - ID: ${user.id}\n`)
  })

  // Check specifically for bendahara
  const bendahara = await prisma.user.findUnique({
    where: { email: 'bendahara@ti26a3.udb.ac.id' }
  })

  if (bendahara) {
    console.log('✅ Bendahara user exists!')
    console.log(`   - Active: ${bendahara.isActive}`)
    console.log(`   - Role: ${bendahara.role}`)
  } else {
    console.log('❌ Bendahara user NOT FOUND!')
  }
}

checkUsers()
  .catch((e) => {
    console.error('Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
