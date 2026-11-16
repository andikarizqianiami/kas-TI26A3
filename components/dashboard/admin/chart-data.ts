// Types and pure helpers for the admin dashboard charts.

export interface ChartData {
  paymentTrends: Array<{ month: string; amount: number; count: number }>
  cashFlow: Array<{ month: string; income: number; expense: number; net: number }>
  statusDistribution: { paid: number; unpaid: number; overdue: number }
  topStudents: Array<{ name: string; nim: string; paidCount: number; totalPaid: number }>
  weeklyActivity: Array<{ week: string; count: number; amount: number }>
}

const toNumber = (value: unknown): number =>
  typeof value === 'number' && Number.isFinite(value) ? value : 0

// Drops null/primitive rows so per-row field access cannot throw
const toArray = <T>(value: unknown): T[] =>
  Array.isArray(value) ? (value.filter((row) => row !== null && typeof row === 'object') as T[]) : []

/**
 * Guards against partial API responses so a missing field renders an empty
 * state instead of crashing the chart (e.g. `undefined.map`).
 */
export function normalizeChartData(raw: unknown): ChartData {
  const data = (raw ?? {}) as Partial<Record<keyof ChartData, unknown>>
  const status = (data.statusDistribution ?? {}) as Partial<Record<'paid' | 'unpaid' | 'overdue', unknown>>

  return {
    paymentTrends: toArray(data.paymentTrends),
    cashFlow: toArray(data.cashFlow),
    statusDistribution: {
      paid: toNumber(status.paid),
      unpaid: toNumber(status.unpaid),
      overdue: toNumber(status.overdue),
    },
    topStudents: toArray(data.topStudents),
    weeklyActivity: toArray(data.weeklyActivity),
  }
}

// A series counts as empty when it has no rows or every value is zero.
export const isCashFlowEmpty = (rows: ChartData['cashFlow']) =>
  rows.every((row) => !row.income && !row.expense)

export const isPaymentTrendsEmpty = (rows: ChartData['paymentTrends']) =>
  rows.every((row) => !row.amount)

export const isStatusDistributionEmpty = ({ paid, unpaid, overdue }: ChartData['statusDistribution']) =>
  paid + unpaid + overdue === 0

export const isWeeklyActivityEmpty = (rows: ChartData['weeklyActivity']) =>
  rows.every((row) => !row.count)

export const isTopStudentsEmpty = (rows: ChartData['topStudents']) =>
  rows.every((row) => !row.paidCount)

const compactNumber = new Intl.NumberFormat('id-ID', { notation: 'compact', maximumFractionDigits: 1 })

/** Short axis labels, e.g. 240000 -> "240 rb", 1500000 -> "1,5 jt". */
export const formatCompactNumber = (value: number) => compactNumber.format(value)
