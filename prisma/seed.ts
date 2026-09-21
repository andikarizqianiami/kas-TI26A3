import { PrismaClient, Role, BillStatus, PaymentStatus, PaymentMethod } from '@prisma/client'
import { hashPassword } from '../lib/auth/hash'
import { getWeekPeriod, getStartOfWeek, getNextWednesday } from '../lib/utils/format'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Clean database
  console.log('🗑️  Cleaning database...')
  await prisma.auditLog.deleteMany()
  await prisma.notificationLog.deleteMany()
  await prisma.notification.deleteMany()
  await prisma.webhookEvent.deleteMany()
  await prisma.payment.deleteMany()
  await prisma.bill.deleteMany()
  await prisma.cashExpense.deleteMany()
  await prisma.cashIncome.deleteMany()
  await prisma.weeklyReport.deleteMany()
  await prisma.announcement.deleteMany()
  await prisma.paymentAccount.deleteMany()
  await prisma.systemSetting.deleteMany()
  await prisma.student.deleteMany()
  await prisma.user.deleteMany()

  // Create Admin User
  console.log('👤 Creating admin user...')
  const adminPassword = await hashPassword('admin123')
  const admin = await prisma.user.create({
    data: {
      email: 'admin@kas-ti26a3.test',
      password: adminPassword,
      role: Role.ADMIN,
      isActive: true,
    },
  })

  // Create Bendahara User
  console.log('👤 Creating bendahara user...')
  const bendaharaPassword = await hashPassword('bendahara123')
  const bendahara = await prisma.user.create({
    data: {
      email: 'bendahara@kas-ti26a3.test',
      password: bendaharaPassword,
      role: Role.BENDAHARA,
      isActive: true,
    },
  })

  console.log('✅ No students created - ready for production use')

  // Create Payment Accounts
  console.log('🏦 Creating payment accounts...')
  await prisma.paymentAccount.create({
    data: {
      name: 'QRIS - Bendahara TI26A3',
      type: 'QRIS_DANA',
      accountName: 'Bendahara Kelas TI26A3',
      description: 'Scan QRIS untuk pembayaran kas kelas.',
      qrisImageUrl: null, // Upload QRIS image via admin dashboard
      isActive: true,
    },
  })

  console.log('✅ Created payment accounts')

  // Create System Settings
  console.log('⚙️  Creating system settings...')
  await prisma.systemSetting.createMany({
    data: [
      {
        key: 'WEEKLY_BILL_AMOUNT',
        value: '5000',
        description: 'Nominal kas mingguan dalam Rupiah',
      },
      {
        key: 'WEEKLY_BILL_DAY',
        value: 'WEDNESDAY',
        description: 'Hari deadline pembayaran kas mingguan',
      },
      {
        key: 'WEEKLY_BILL_NAME',
        value: 'Kas Mingguan',
        description: 'Nama tagihan kas mingguan',
      },
    ],
  })

  console.log('✅ Created system settings')

  console.log('')
  console.log('✨ Database initialized successfully!')
  console.log('')
  console.log('🔐 Login Credentials:')
  console.log('   Admin:')
  console.log('   - Email: admin@kas-ti26a3.test')
  console.log('   - Password: admin123')
  console.log('')
  console.log('   Bendahara:')
  console.log('   - Email: bendahara@kas-ti26a3.test')
  console.log('   - Password: bendahara123')
  console.log('')
  console.log('📝 Next Steps:')
  console.log('   1. Login as admin or bendahara')
  console.log('   2. Add students via Dashboard > Mahasiswa')
  console.log('   3. Upload QRIS payment image via Settings')
  console.log('   4. Create weekly bills when ready')
  console.log('')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
