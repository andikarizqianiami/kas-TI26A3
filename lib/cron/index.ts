import cron from 'node-cron'
import { generateWeeklyBills, updateOverdueBills, sendPaymentReminders } from './weekly-billing'

const TIMEZONE = process.env.CRON_TIMEZONE || 'Asia/Jakarta'
const CRON_ENABLED = process.env.CRON_ENABLED === 'true'

/**
 * Initialize all cron jobs
 */
export function initializeCronJobs() {
  if (!CRON_ENABLED) {
    console.log('[CRON] Cron jobs are disabled')
    return
  }

  console.log(`[CRON] Initializing cron jobs with timezone: ${TIMEZONE}`)

  // Job 1: Generate weekly bills
  // Run every Monday at 00:00 (midnight)
  cron.schedule(
    '0 0 * * 1',
    async () => {
      console.log('[CRON] Running: Generate weekly bills')
      try {
        const result = await generateWeeklyBills()
        console.log('[CRON] Result:', result)
      } catch (error) {
        console.error('[CRON] Failed to generate weekly bills:', error)
      }
    },
    {
      timezone: TIMEZONE,
    }
  )

  // Job 2: Update overdue bills
  // Run every day at 00:30
  cron.schedule(
    '30 0 * * *',
    async () => {
      console.log('[CRON] Running: Update overdue bills')
      try {
        const result = await updateOverdueBills()
        console.log('[CRON] Result:', result)
      } catch (error) {
        console.error('[CRON] Failed to update overdue bills:', error)
      }
    },
    {
      timezone: TIMEZONE,
    }
  )

  // Job 3: Send payment reminders
  // Run every Tuesday at 20:00 (8 PM) - reminder before Wednesday deadline
  cron.schedule(
    '0 20 * * 2',
    async () => {
      console.log('[CRON] Running: Send payment reminders')
      try {
        const result = await sendPaymentReminders()
        console.log('[CRON] Result:', result)
      } catch (error) {
        console.error('[CRON] Failed to send payment reminders:', error)
      }
    },
    {
      timezone: TIMEZONE,
    }
  )

  // Job 4: Send morning reminders on Wednesday
  // Run every Wednesday at 08:00 (8 AM) - morning of deadline
  cron.schedule(
    '0 8 * * 3',
    async () => {
      console.log('[CRON] Running: Send Wednesday morning reminders')
      try {
        const result = await sendPaymentReminders()
        console.log('[CRON] Result:', result)
      } catch (error) {
        console.error('[CRON] Failed to send Wednesday reminders:', error)
      }
    },
    {
      timezone: TIMEZONE,
    }
  )

  console.log('[CRON] All cron jobs initialized successfully')
}

// Export functions for manual trigger via API
export { generateWeeklyBills, updateOverdueBills, sendPaymentReminders }
