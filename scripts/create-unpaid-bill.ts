import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Get first student
  const student = await prisma.student.findFirst({
    where: { nim: '2026010001' }
  })

  if (!student) {
    console.log('Student not found')
    return
  }

  // Create unpaid bill for THIS week (not next week)
  const weekStart = new Date()
  weekStart.setDate(weekStart.getDate() - 2) // Start 2 days ago
  
  const deadline = new Date()
  deadline.setDate(deadline.getDate() + 5) // Deadline 5 days from now

  const bill = await prisma.bill.create({
    data: {
      studentId: student.id,
      name: 'Kas Mingguan',
      description: 'Iuran kas mingguan TI26A3',
      amount: 5000,
      weekPeriod: '2026-W38', // Current week
      weekStartDate: weekStart,
      deadline: deadline,
      status: 'UNPAID'
    }
  })

  console.log('✅ Created unpaid bill:', bill)
  console.log(`\n📝 Test payment flow:`)
  console.log(`1. Login as: 2026010001 / mahasiswa123`)
  console.log(`2. Dashboard will show unpaid bill`)
  console.log(`3. Click "Bayar sekarang"`)
  console.log(`4. Upload payment proof`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
