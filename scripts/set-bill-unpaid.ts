import { PrismaClient } from '@prisma/client'
import { requireArg } from './lib/cli'

// Usage: npx tsx scripts/set-bill-unpaid.ts <NIM>

const prisma = new PrismaClient()

async function main() {
  const nim = requireArg(0, 'npx tsx scripts/set-bill-unpaid.ts <NIM>')

  const student = await prisma.student.findFirst({
    where: { nim }
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
