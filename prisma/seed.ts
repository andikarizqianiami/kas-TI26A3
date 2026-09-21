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

  // Create Students
  console.log('👥 Creating students...')
  const studentPassword = await hashPassword('mahasiswa123')
  
  const studentsData = [
    { nim: '2026010001', name: 'Ahmad Rizki Pratama', whatsapp: '6281234567801' },
    { nim: '2026010002', name: 'Siti Nurhaliza', whatsapp: '6281234567802' },
    { nim: '2026010003', name: 'Budi Santoso', whatsapp: '6281234567803' },
    { nim: '2026010004', name: 'Dewi Lestari', whatsapp: '6281234567804' },
    { nim: '2026010005', name: 'Eko Prasetyo', whatsapp: '6281234567805' },
    { nim: '2026010006', name: 'Fitri Handayani', whatsapp: '6281234567806' },
    { nim: '2026010007', name: 'Gilang Ramadhan', whatsapp: '6281234567807' },
    { nim: '2026010008', name: 'Hana Pertiwi', whatsapp: '6281234567808' },
    { nim: '2026010009', name: 'Indra Gunawan', whatsapp: '6281234567809' },
    { nim: '2026010010', name: 'Julia Kartika', whatsapp: '6281234567810' },
    { nim: '2026010011', name: 'Kurniawan Saputra', whatsapp: '6281234567811' },
    { nim: '2026010012', name: 'Lina Marlina', whatsapp: '6281234567812' },
    { nim: '2026010013', name: 'Muhammad Fadli', whatsapp: '6281234567813' },
    { nim: '2026010014', name: 'Nur Azizah', whatsapp: '6281234567814' },
    { nim: '2026010015', name: 'Oka Wijaya', whatsapp: '6281234567815' },
    { nim: '2026010016', name: 'Putri Ayu', whatsapp: '6281234567816' },
    { nim: '2026010017', name: 'Qori Maulana', whatsapp: '6281234567817' },
    { nim: '2026010018', name: 'Rina Susanti', whatsapp: '6281234567818' },
    { nim: '2026010019', name: 'Surya Dinata', whatsapp: '6281234567819' },
    { nim: '2026010020', name: 'Tari Wulandari', whatsapp: '6281234567820' },
    { nim: '2026010021', name: 'Umar Fauzi', whatsapp: '6281234567821' },
    { nim: '2026010022', name: 'Vina Amelia', whatsapp: '6281234567822' },
    { nim: '2026010023', name: 'Wawan Setiawan', whatsapp: '6281234567823' },
    { nim: '2026010024', name: 'Xenia Putri', whatsapp: '6281234567824' },
    { nim: '2026010025', name: 'Yudi Hermawan', whatsapp: '6281234567825' },
    { nim: '2026010026', name: 'Zahra Kamila', whatsapp: '6281234567826' },
    { nim: '2026010027', name: 'Arif Budiman', whatsapp: '6281234567827' },
    { nim: '2026010028', name: 'Bella Safira', whatsapp: '6281234567828' },
    { nim: '2026010029', name: 'Candra Wijaya', whatsapp: '6281234567829' },
    { nim: '2026010030', name: 'Dina Maharani', whatsapp: '6281234567830' },
  ]

  const students = []
  for (const data of studentsData) {
    const user = await prisma.user.create({
      data: {
        email: `${data.nim}@student.udb.ac.id`,
        password: studentPassword,
        role: Role.MAHASISWA,
        isActive: true,
      },
    })

    const student = await prisma.student.create({
      data: {
        userId: user.id,
        nim: data.nim,
        name: data.name,
        email: user.email,
        whatsapp: data.whatsapp,
        class: 'TI26A3',
        isActive: true,
      },
    })

    students.push(student)
  }

  console.log(`✅ Created ${students.length} students`)

  // Create Bills for current week
  console.log('📄 Creating weekly bills...')
  const now = new Date()
  const weekPeriod = getWeekPeriod(now)
  const weekStartDate = getStartOfWeek(now)
  const deadline = getNextWednesday(now)

  const bills = []
  for (let i = 0; i < students.length; i++) {
    const student = students[i]
    
    // Varied bill status for demo
    let status: 'UNPAID' | 'PAID' | 'OVERDUE' = 'UNPAID'
    if (i < 20) status = 'PAID'      // 20 students paid
    else if (i < 25) status = 'UNPAID' // 5 students unpaid
    else status = 'OVERDUE'          // 5 students overdue

    const bill = await prisma.bill.create({
      data: {
        studentId: student.id,
        name: 'Kas Mingguan',
        description: `Kas kelas TI26A3 periode minggu ${weekPeriod}`,
        amount: 5000,
        weekPeriod,
        weekStartDate,
        deadline,
        status,
        paidAt: status === 'PAID' ? new Date() : null,
      },
    })

    bills.push(bill)
  }

  console.log(`✅ Created ${bills.length} bills`)

  // Create Payments for paid bills
  console.log('💰 Creating payments...')
  const paidBills = bills.filter(b => b.status === BillStatus.PAID)
  
  for (let i = 0; i < paidBills.length; i++) {
    const bill = paidBills[i]
    const student = students.find(s => s.id === bill.studentId)!
    
    await prisma.payment.create({
      data: {
        billId: bill.id,
        studentId: student.id,
        transactionId: `TRX${Date.now()}${i}`,
        amount: bill.amount,
        method: 'QRIS_DANA',
        status: PaymentStatus.PAID,
        paymentDate: bill.paidAt,
        paidAt: bill.paidAt,
        verifiedBy: admin.id,
        verifiedAt: bill.paidAt,
      },
    })
  }

  // Add some pending verification payments
  const unpaidBills = bills.filter(b => b.status === BillStatus.UNPAID).slice(0, 2)
  for (const bill of unpaidBills) {
    const student = students.find(s => s.id === bill.studentId)!
    await prisma.payment.create({
      data: {
        billId: bill.id,
        studentId: student.id,
        amount: bill.amount,
        method: 'QRIS_DANA',
        status: PaymentStatus.PENDING_VERIFICATION,
        proofImageUrl: '/uploads/payment-proofs/sample-proof.jpg',
        paymentDate: new Date(),
        paymentNotes: 'Bayar via DANA',
      },
    })
  }

  console.log('✅ Created payments')

  // Create Cash Incomes
  console.log('💵 Creating cash incomes...')
  const totalPaidAmount = paidBills.reduce((sum, bill) => sum + bill.amount, 0)
  
  await prisma.cashIncome.create({
    data: {
      category: 'KAS_MINGGUAN',
      description: `Pembayaran kas mingguan periode ${weekPeriod}`,
      amount: totalPaidAmount,
      date: new Date(),
      createdBy: admin.id,
    },
  })

  await prisma.cashIncome.create({
    data: {
      category: 'DONASI',
      description: 'Donasi dari alumni',
      amount: 100000,
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      createdBy: admin.id,
      notes: 'Terima kasih alumni angkatan 2023',
    },
  })

  console.log('✅ Created cash incomes')

  // Create Cash Expenses
  console.log('💸 Creating cash expenses...')
  await prisma.cashExpense.create({
    data: {
      category: 'KONSUMSI',
      description: 'Snack rapat kelas',
      amount: 50000,
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      createdBy: bendahara.id,
    },
  })

  await prisma.cashExpense.create({
    data: {
      category: 'PERLENGKAPAN',
      description: 'Spidol dan kertas untuk presentasi',
      amount: 35000,
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      createdBy: bendahara.id,
    },
  })

  console.log('✅ Created cash expenses')

  // Create Payment Accounts
  console.log('🏦 Creating payment accounts...')
  await prisma.paymentAccount.create({
    data: {
      name: 'QRIS DANA - Bendahara TI26A3',
      type: 'QRIS_DANA',
      accountName: 'Bendahara Kelas TI26A3',
      description: 'Scan QRIS untuk pembayaran kas kelas. Nominal Rp5.000 per minggu.',
      qrisImageUrl: null, // Admin harus upload QRIS image manual
      isActive: true,
    },
  })

  await prisma.paymentAccount.create({
    data: {
      name: 'BCA - Bendahara TI26A3',
      type: 'BANK',
      accountNumber: '1234567890',
      accountName: 'Bendahara Kelas TI26A3',
      description: 'Transfer manual ke rekening BCA',
      isActive: false, // Non-aktif, prioritas QRIS
    },
  })

  console.log('✅ Created payment accounts')

  // Create Announcements
  console.log('📢 Creating announcements...')
  await prisma.announcement.create({
    data: {
      title: 'Pengingat Pembayaran Kas Mingguan',
      content: 'Jangan lupa melakukan pembayaran kas mingguan sebesar Rp5.000 sebelum hari Rabu. Terima kasih!',
      priority: 'NORMAL',
      isActive: true,
      createdBy: bendahara.id,
    },
  })

  await prisma.announcement.create({
    data: {
      title: 'Rapat Kelas',
      content: 'Akan ada rapat kelas pada hari Jumat, 20 September 2026 pukul 14:00 WIB. Mohon kehadiran semua mahasiswa.',
      priority: 'HIGH',
      isActive: true,
      createdBy: admin.id,
    },
  })

  console.log('✅ Created announcements')

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

  // Create sample notifications
  console.log('🔔 Creating notifications...')
  for (const student of students.slice(0, 5)) {
    await prisma.notification.create({
      data: {
        studentId: student.id,
        type: 'NEW_BILL',
        title: 'Tagihan Kas Baru',
        message: 'Tagihan kas mingguan sebesar Rp5.000 telah dibuat. Deadline: Rabu.',
        isRead: false,
      },
    })
  }

  console.log('✅ Created notifications')

  // Create Funding Targets
  console.log('🎯 Creating funding targets...')
  
  const fundingTarget1 = await prisma.fundingTarget.create({
    data: {
      title: 'Urunan Workshop Web Development',
      description: 'Workshop pembuatan website modern menggunakan React dan Next.js. Akan diadakan selama 2 hari dengan materi lengkap dari dasar hingga deployment. Termasuk sertifikat dan modul.',
      targetAmount: 1500000,
      currentAmount: 0,
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      status: 'ACTIVE',
      createdBy: admin.id,
    }
  })

  const fundingTarget2 = await prisma.fundingTarget.create({
    data: {
      title: 'Urunan Study Tour Bali',
      description: 'Study tour ke Bali untuk mengunjungi startup dan tech company. Biaya mencakup transportasi, akomodasi 3 hari 2 malam, dan konsumsi. Akan ada company visit ke beberapa unicorn startup.',
      targetAmount: 5000000,
      currentAmount: 0,
      deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
      status: 'ACTIVE',
      createdBy: bendahara.id,
    }
  })

  const fundingTarget3 = await prisma.fundingTarget.create({
    data: {
      title: 'Urunan Acara Perpisahan Kelas',
      description: 'Acara perpisahan kelas TI26A3 di akhir semester. Mencakup sewa venue, dekorasi, konsumsi, doorprize, dan dokumentasi foto/video profesional.',
      targetAmount: 3000000,
      currentAmount: 2800000, // Almost completed
      deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      status: 'ACTIVE',
      createdBy: admin.id,
    }
  })

  console.log('✅ Created funding targets')

  // Create sample contributions for funding target 3 (almost completed)
  console.log('💰 Creating sample contributions...')
  for (let i = 0; i < 20; i++) {
    const student = students[i]
    await prisma.contribution.create({
      data: {
        fundingTargetId: fundingTarget3.id,
        studentId: student.id,
        amount: 100000 + Math.floor(Math.random() * 50000), // 100k - 150k
        method: i % 2 === 0 ? 'QRIS_DANA' : 'MANUAL_TRANSFER',
        status: 'VERIFIED',
        proofImageUrl: '/uploads/sample-proof.jpg',
        paymentDate: new Date(Date.now() - Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000),
        verifiedBy: admin.id,
        verifiedAt: new Date(Date.now() - Math.floor(Math.random() * 5) * 24 * 60 * 60 * 1000),
      }
    })
  }

  // Add some pending contributions for verification
  for (let i = 20; i < 23; i++) {
    const student = students[i]
    const target = i === 20 ? fundingTarget1 : i === 21 ? fundingTarget2 : fundingTarget3
    await prisma.contribution.create({
      data: {
        fundingTargetId: target.id,
        studentId: student.id,
        amount: 50000 + Math.floor(Math.random() * 50000),
        method: 'QRIS_DANA',
        status: 'PENDING_VERIFICATION',
        proofImageUrl: '/uploads/sample-proof-pending.jpg',
        paymentDate: new Date(),
        paymentNotes: 'Bayar via DANA',
      }
    })
  }

  console.log('✅ Created sample contributions')

  console.log('✨ Seeding completed successfully!')
  console.log('')
  console.log('📝 Demo Accounts:')
  console.log('   Admin:')
  console.log('   - Email: admin@kas-ti26a3.test')
  console.log('   - Password: admin123')
  console.log('')
  console.log('   Bendahara:')
  console.log('   - Email: bendahara@kas-ti26a3.test')
  console.log('   - Password: bendahara123')
  console.log('')
  console.log('   Mahasiswa (example):')
  console.log('   - Email/NIM: 2026010001@student.udb.ac.id or 2026010001')
  console.log('   - Password: mahasiswa123')
  console.log('')
  console.log('🎯 Funding Targets:')
  console.log('   1. Workshop Web Development (Active) - Target: Rp1.500.000')
  console.log('   2. Study Tour Bali (Active) - Target: Rp5.000.000')
  console.log('   3. Acara Perpisahan (Active, 93%) - Target: Rp3.000.000')
  console.log('')
  console.log('💰 Sample Contributions:')
  console.log('   - 20 verified contributions on Target #3')
  console.log('   - 3 pending contributions (need verification)')
  console.log('')
  console.log('🌐 Test URLs:')
  console.log('   Admin: http://localhost:3000/dashboard/admin/funding-targets')
  console.log('   Student: http://localhost:3000/dashboard/funding-targets')
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
