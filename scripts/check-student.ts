import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkStudent() {
  const student = await prisma.student.findFirst({
    where: { nim: '2026010001' },
    include: { user: true }
  })
  
  console.log('=== Student Data ===')
  console.log('NIM:', student?.nim)
  console.log('Name:', student?.name)
  console.log('User Email:', student?.user?.email)
  console.log('User Active:', student?.user?.isActive)
  console.log('Has Password:', !!student?.user?.password)
  console.log('Password (first 20 chars):', student?.user?.password?.substring(0, 20))
  
  await prisma.$disconnect()
}

checkStudent()
