import prisma from '@/lib/prisma/db'
import { getWeekPeriod, getStartOfWeek, getEndOfWeek, getNextWednesday } from '@/lib/utils/format'
import { BillStatus } from '@prisma/client'

/**
 * Generate weekly bills for all active students
 * This function should be called every week (e.g., Monday morning)
 */
export async function generateWeeklyBills() {
  try {
    const now = new Date()
    const weekPeriod = getWeekPeriod(now)
    const weekStartDate = getStartOfWeek(now)
    const deadline = getNextWednesday(now)

    console.log(`[CRON] Generating weekly bills for period: ${weekPeriod}`)

    // Get all active students
    const activeStudents = await prisma.student.findMany({
      where: { isActive: true },
      include: { user: true },
    })

    if (activeStudents.length === 0) {
      console.log('[CRON] No active students found')
      return { success: true, created: 0 }
    }

    // Get weekly bill configuration from environment or system settings
    const billAmount = parseInt(process.env.WEEKLY_BILL_AMOUNT || '5000')
    const billName = process.env.WEEKLY_BILL_NAME || 'Kas Mingguan'

    // Check if bills already exist for this week
    const existingBills = await prisma.bill.findMany({
      where: { weekPeriod },
    })

    if (existingBills.length > 0) {
      console.log(`[CRON] Bills already exist for ${weekPeriod}, skipping...`)
      return { success: true, created: 0, skipped: true }
    }

    // Create bills for all active students
    const billsToCreate = activeStudents.map((student) => ({
      studentId: student.id,
      name: billName,
      description: `Kas kelas TI26A3 periode minggu ${weekPeriod}`,
      amount: billAmount,
      weekPeriod,
      weekStartDate,
      deadline,
      status: BillStatus.UNPAID,
    }))

    // Use createMany for better performance
    const result = await prisma.bill.createMany({
      data: billsToCreate,
      skipDuplicates: true, // Skip if duplicate exists (based on unique constraint)
    })

    console.log(`[CRON] Successfully created ${result.count} bills for ${weekPeriod}`)

    // Create notifications for students
    const notificationsToCreate = activeStudents.map((student) => ({
      studentId: student.id,
      type: 'NEW_BILL' as const,
      title: 'Tagihan Kas Baru',
      message: `Tagihan kas mingguan sebesar Rp${billAmount.toLocaleString('id-ID')} telah dibuat. Deadline pembayaran: Rabu.`,
    }))

    await prisma.notification.createMany({
      data: notificationsToCreate,
    })

    console.log(`[CRON] Created ${notificationsToCreate.length} notifications`)

    return {
      success: true,
      created: result.count,
      weekPeriod,
      deadline: deadline.toISOString(),
    }
  } catch (error) {
    console.error('[CRON] Error generating weekly bills:', error)
    throw error
  }
}

/**
 * Update overdue bills
 * Check all unpaid bills past deadline and mark as OVERDUE
 */
export async function updateOverdueBills() {
  try {
    console.log('[CRON] Checking for overdue bills...')

    const now = new Date()

    const result = await prisma.bill.updateMany({
      where: {
        status: BillStatus.UNPAID,
        deadline: {
          lt: now,
        },
      },
      data: {
        status: BillStatus.OVERDUE,
      },
    })

    console.log(`[CRON] Updated ${result.count} bills to OVERDUE status`)

    return {
      success: true,
      updated: result.count,
    }
  } catch (error) {
    console.error('[CRON] Error updating overdue bills:', error)
    throw error
  }
}

/**
 * Send payment reminders
 * Send WhatsApp reminder to students with unpaid bills
 */
export async function sendPaymentReminders() {
  try {
    console.log('[CRON] Sending payment reminders...')

    const now = new Date()
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // Find unpaid bills with deadline within next 24 hours
    const upcomingBills = await prisma.bill.findMany({
      where: {
        status: BillStatus.UNPAID,
        deadline: {
          gte: now,
          lte: tomorrow,
        },
      },
      include: {
        student: true,
      },
    })

    console.log(`[CRON] Found ${upcomingBills.length} bills to remind`)

    // Create notifications
    for (const bill of upcomingBills) {
      await prisma.notification.create({
        data: {
          studentId: bill.studentId,
          type: 'PAYMENT_REMINDER',
          title: 'Pengingat Pembayaran Kas',
          message: `Halo ${bill.student.name}, jangan lupa melakukan pembayaran kas sebesar Rp${bill.amount.toLocaleString('id-ID')}. Deadline: besok (Rabu).`,
        },
      })

      // Log for WhatsApp notification (actual sending would be done by notification service)
      await prisma.notificationLog.create({
        data: {
          recipientId: bill.studentId,
          channel: 'WHATSAPP',
          message: `Halo ${bill.student.name}, ini pengingat Kas TI26A3.\n\nIuran minggu ini: Rp${bill.amount.toLocaleString('id-ID')}\nDeadline: Rabu\n\nSilakan melakukan pembayaran melalui aplikasi KAS TI26A3.\n\nTerima kasih.`,
          status: 'pending',
        },
      })
    }

    return {
      success: true,
      reminded: upcomingBills.length,
    }
  } catch (error) {
    console.error('[CRON] Error sending payment reminders:', error)
    throw error
  }
}
