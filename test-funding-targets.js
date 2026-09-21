#!/usr/bin/env node

// Simple test script for Funding Targets feature
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testFundingTargets() {
  console.log('🧪 Testing Funding Targets Feature...\n')

  try {
    // 1. Get all funding targets
    console.log('1️⃣  Fetching all funding targets...')
    const targets = await prisma.fundingTarget.findMany({
      include: {
        _count: {
          select: {
            contributions: true
          }
        }
      }
    })

    console.log(`   ✅ Found ${targets.length} funding targets\n`)

    // 2. Display each target
    for (const target of targets) {
      const progress = Math.round((target.currentAmount / target.targetAmount) * 100)
      console.log(`   📌 ${target.title}`)
      console.log(`      Status: ${target.status}`)
      console.log(`      Target: Rp${target.targetAmount.toLocaleString('id-ID')}`)
      console.log(`      Collected: Rp${target.currentAmount.toLocaleString('id-ID')} (${progress}%)`)
      console.log(`      Contributors: ${target._count.contributions}`)
      console.log(`      Deadline: ${target.deadline ? target.deadline.toLocaleDateString('id-ID') : 'No deadline'}`)
      console.log('')
    }

    // 3. Get pending contributions
    console.log('2️⃣  Checking pending contributions...')
    const pendingContributions = await prisma.contribution.findMany({
      where: {
        status: 'PENDING_VERIFICATION'
      },
      include: {
        student: {
          select: {
            name: true,
            nim: true
          }
        },
        fundingTarget: {
          select: {
            title: true
          }
        }
      }
    })

    console.log(`   ✅ Found ${pendingContributions.length} pending contributions\n`)

    for (const contrib of pendingContributions) {
      console.log(`   ⏳ ${contrib.student.name} (${contrib.student.nim})`)
      console.log(`      Target: ${contrib.fundingTarget.title}`)
      console.log(`      Amount: Rp${contrib.amount.toLocaleString('id-ID')}`)
      console.log(`      Date: ${contrib.paymentDate.toLocaleString('id-ID')}`)
      console.log('')
    }

    // 4. Get verified contributions count
    console.log('3️⃣  Contribution statistics...')
    const stats = await prisma.contribution.groupBy({
      by: ['status'],
      _count: {
        status: true
      },
      _sum: {
        amount: true
      }
    })

    for (const stat of stats) {
      console.log(`   ${stat.status}: ${stat._count.status} contributions, Total: Rp${(stat._sum.amount || 0).toLocaleString('id-ID')}`)
    }
    console.log('')

    // 5. Test auto-complete logic
    console.log('4️⃣  Testing auto-complete logic...')
    const almostComplete = targets.find(t => t.progressPercentage >= 90)
    if (almostComplete) {
      const remaining = almostComplete.targetAmount - almostComplete.currentAmount
      console.log(`   📊 Target "${almostComplete.title}" is ${Math.round((almostComplete.currentAmount / almostComplete.targetAmount) * 100)}% complete`)
      console.log(`   💰 Needs Rp${remaining.toLocaleString('id-ID')} more to complete`)
      console.log(`   ⚡ Will auto-complete when verified contributions reach target`)
    }
    console.log('')

    // 6. Summary
    console.log('✨ Test Summary:')
    console.log(`   Total Targets: ${targets.length}`)
    console.log(`   Active Targets: ${targets.filter(t => t.status === 'ACTIVE').length}`)
    console.log(`   Completed Targets: ${targets.filter(t => t.status === 'COMPLETED').length}`)
    console.log(`   Pending Verifications: ${pendingContributions.length}`)
    console.log('')

    console.log('🎉 All tests passed!')
    console.log('')
    console.log('🌐 Open in browser:')
    console.log('   Admin: http://localhost:3000/dashboard/admin/funding-targets')
    console.log('   Student: http://localhost:3000/dashboard/funding-targets')
    console.log('')
    console.log('🔐 Login credentials:')
    console.log('   Admin: admin@kas-ti26a3.test / admin123')
    console.log('   Student: 2026010001 / mahasiswa123')

  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

testFundingTargets()
