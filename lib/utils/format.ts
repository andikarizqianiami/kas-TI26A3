import { format } from 'date-fns'
import { id as localeId } from 'date-fns/locale'

/**
 * Format currency to Indonesian Rupiah
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Format date to Indonesian locale
 */
export function formatDate(date: Date | string, formatStr: string = 'dd MMMM yyyy'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return format(dateObj, formatStr, { locale: localeId })
}

/**
 * Format date with time
 */
export function formatDateTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return format(dateObj, 'dd MMM yyyy, HH:mm', { locale: localeId })
}

/**
 * Get week period string (e.g., "2026-W38")
 */
export function getWeekPeriod(date: Date): string {
  const year = date.getFullYear()
  const weekNumber = getWeekNumber(date)
  return `${year}-W${weekNumber.toString().padStart(2, '0')}`
}

/**
 * Get ISO week number
 */
export function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
}

/**
 * Get next Wednesday from a given date
 */
export function getNextWednesday(from: Date = new Date()): Date {
  const date = new Date(from)
  const day = date.getDay()
  const daysUntilWednesday = day <= 3 ? 3 - day : 10 - day
  date.setDate(date.getDate() + daysUntilWednesday)
  date.setHours(23, 59, 59, 999) // End of Wednesday
  return date
}

/**
 * Get start of week (Monday)
 */
export function getStartOfWeek(date: Date = new Date()): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1) // Adjust when day is Sunday
  const startOfWeek = new Date(d.setDate(diff))
  startOfWeek.setHours(0, 0, 0, 0)
  return startOfWeek
}

/**
 * Get end of week (Sunday)
 */
export function getEndOfWeek(date: Date = new Date()): Date {
  const startOfWeek = getStartOfWeek(date)
  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(startOfWeek.getDate() + 6)
  endOfWeek.setHours(23, 59, 59, 999)
  return endOfWeek
}

/**
 * Check if date is overdue (past deadline)
 */
export function isOverdue(deadline: Date | string): boolean {
  const deadlineDate = typeof deadline === 'string' ? new Date(deadline) : deadline
  return deadlineDate < new Date()
}
