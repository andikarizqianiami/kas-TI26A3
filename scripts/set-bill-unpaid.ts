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

  // Find current week bill (W38) and set to UNPAID
  const bill = await prisma.bill.findFirst({
    where: {
      studentId: student.id,
      weekPeriod: '2026-W38'
    }
  })

  if (!bill) {
    console.log('Bill W38 not found')
    return
  }

  // Update to UNPAID
  const updated = await prisma.bill.update({
    where: { id: bill.id },
    data: {
      status: 'UNPAID',
      paidAt: null
    }
  })

  console.log('✅ Updated bill to UNPAID:', updated)
  console.log(`\n📝 Now refresh dashboard:`)
  console.log(`- Status will show: Belum dibayar`)
  console.log(`- Button "Bayar sekarang" will appear`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
