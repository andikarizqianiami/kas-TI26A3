'use client'

import type { ReactNode } from 'react'
import {
  BarChart3,
  CalendarDays,
  PieChart as PieChartIcon,
  TrendingUp,
  Trophy,
  type LucideIcon,
} from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils/cn'
import { formatCurrency } from '@/lib/utils/format'
import { ChartErrorBoundary, ChartSkeleton, EmptyState, ErrorState } from './ChartStates'
import {
  formatCompactNumber,
  isCashFlowEmpty,
  isPaymentTrendsEmpty,
  isStatusDistributionEmpty,
  isTopStudentsEmpty,
  isWeeklyActivityEmpty,
  type ChartData,
} from './chart-data'

export type ChartsStatus = 'loading' | 'error' | 'ready'

const COLORS = {
  paid: '#22c55e',
  unpaid: '#f59e0b',
  overdue: '#ef4444',
  income: '#3b82f6',
  expense: '#ef4444',
  net: '#8b5cf6',
}

const CASH_FLOW_HEIGHT = 300
const PANEL_HEIGHT = 280
const AXIS_TICK = { fontSize: 12, fill: '#64748b' }
const GRID_STROKE = '#e2e8f0'

const currencyTooltip = (value: unknown) => formatCurrency(Number(value))

interface ChartPanelProps {
  title: string
  icon: LucideIcon
  className?: string
  children: ReactNode
}

function ChartPanel({ title, icon: Icon, className, children }: ChartPanelProps) {
  return (
    // min-w-0 lets the chart shrink inside the grid when the window narrows
    <Card className={cn('flex min-w-0 flex-col', className)}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <Icon className="h-5 w-5 shrink-0 text-indigo-500" aria-hidden="true" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1">{children}</CardContent>
    </Card>
  )
}

function SkeletonPanel({ height }: { height: number }) {
  return (
    <Card className="min-w-0">
      <CardHeader className="pb-4">
        <div className="h-5 w-40 animate-pulse rounded bg-slate-200" aria-hidden="true" />
      </CardHeader>
      <CardContent>
        <ChartSkeleton height={height} />
      </CardContent>
    </Card>
  )
}

function ChartsSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true">
      <p role="status" className="sr-only">
        Memuat grafik…
      </p>
      <SkeletonPanel height={CASH_FLOW_HEIGHT} />
      <div className="grid gap-6 md:grid-cols-2">
        {[0, 1, 2, 3].map((i) => (
          <SkeletonPanel key={i} height={PANEL_HEIGHT} />
        ))}
      </div>
    </div>
  )
}

interface DashboardChartsProps {
  status: ChartsStatus
  data: ChartData | null
  onRetry: () => void
}

export default function DashboardCharts({ status, data, onRetry }: DashboardChartsProps) {
  if (status === 'loading') {
    return <ChartsSkeleton />
  }

  if (status === 'error' || !data) {
    return (
      <Card>
        <CardContent className="p-6">
          <ErrorState
            title="Gagal memuat data grafik"
            description="Data grafik tidak dapat diambil dari server. Periksa koneksi lalu coba lagi."
            onRetry={onRetry}
            minHeight={240}
          />
        </CardContent>
      </Card>
    )
  }

  const { cashFlow, paymentTrends, statusDistribution, weeklyActivity, topStudents } = data

  // Recharts 3 reads each sector's color from `fill` (Cell is deprecated)
  const statusItems = [
    { key: 'paid', name: 'Lunas', value: statusDistribution.paid, fill: COLORS.paid },
    { key: 'unpaid', name: 'Belum Bayar', value: statusDistribution.unpaid, fill: COLORS.unpaid },
    { key: 'overdue', name: 'Terlambat', value: statusDistribution.overdue, fill: COLORS.overdue },
  ]
  const totalBills = statusItems.reduce((sum, item) => sum + item.value, 0)
  // Zero slices are dropped so their labels/tooltips do not overlap
  const pieData = statusItems.filter((item) => item.value > 0)

  return (
    <section aria-labelledby="charts-heading" className="space-y-6">
      <h2 id="charts-heading" className="sr-only">
        Grafik keuangan
      </h2>

      <ChartPanel title="Arus Kas (6 Bulan Terakhir)" icon={BarChart3}>
        <ChartErrorBoundary minHeight={CASH_FLOW_HEIGHT} resetKey={data}>
          {isCashFlowEmpty(cashFlow) ? (
            <EmptyState
              title="Belum ada data arus kas"
              description="Pemasukan dan pengeluaran 6 bulan terakhir akan tampil di sini."
              action={{ href: '/dashboard/admin/cash', label: 'Kelola kas' }}
              minHeight={CASH_FLOW_HEIGHT}
            />
          ) : (
            <ResponsiveContainer width="100%" height={CASH_FLOW_HEIGHT}>
              <LineChart data={cashFlow} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} />
                <XAxis dataKey="month" tick={AXIS_TICK} tickLine={false} tickMargin={8} axisLine={{ stroke: GRID_STROKE }} />
                <YAxis tickFormatter={formatCompactNumber} tick={AXIS_TICK} tickLine={false} axisLine={false} width={64} />
                <Tooltip formatter={currencyTooltip} />
                <Legend />
                <Line type="monotone" dataKey="income" stroke={COLORS.income} name="Pemasukan" strokeWidth={2} />
                <Line type="monotone" dataKey="expense" stroke={COLORS.expense} name="Pengeluaran" strokeWidth={2} />
                <Line
                  type="monotone"
                  dataKey="net"
                  stroke={COLORS.net}
                  name="Saldo Bersih"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </ChartErrorBoundary>
      </ChartPanel>

      <div className="grid gap-6 md:grid-cols-2">
        <ChartPanel title="Tren Pembayaran" icon={TrendingUp}>
          <ChartErrorBoundary minHeight={PANEL_HEIGHT} resetKey={data}>
            {isPaymentTrendsEmpty(paymentTrends) ? (
              <EmptyState
                title="Belum ada pembayaran"
                description="Pembayaran lunas dalam 6 bulan terakhir akan tampil di sini."
                action={{ href: '/dashboard/admin/payments', label: 'Verifikasi pembayaran' }}
                minHeight={PANEL_HEIGHT}
              />
            ) : (
              <ResponsiveContainer width="100%" height={PANEL_HEIGHT}>
                <BarChart data={paymentTrends} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} vertical={false} />
                  <XAxis dataKey="month" tick={AXIS_TICK} tickLine={false} tickMargin={8} axisLine={{ stroke: GRID_STROKE }} />
                  <YAxis tickFormatter={formatCompactNumber} tick={AXIS_TICK} tickLine={false} axisLine={false} width={56} />
                  <Tooltip formatter={currencyTooltip} cursor={{ fill: '#f1f5f9' }} />
                  <Bar dataKey="amount" fill="#3b82f6" name="Jumlah" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartErrorBoundary>
        </ChartPanel>

        <ChartPanel title="Status Tagihan" icon={PieChartIcon}>
          <ChartErrorBoundary minHeight={PANEL_HEIGHT} resetKey={data}>
            {isStatusDistributionEmpty(statusDistribution) ? (
              <EmptyState
                icon={PieChartIcon}
                title="Belum ada tagihan"
                description="Status tagihan mahasiswa akan tampil setelah tagihan dibuat."
                action={{ href: '/dashboard/admin/bills/create', label: 'Buat tagihan' }}
                minHeight={PANEL_HEIGHT}
              />
            ) : (
              <div
                className="flex flex-col items-center justify-center gap-6 sm:flex-row"
                style={{ minHeight: PANEL_HEIGHT }}
              >
                <div className="h-[200px] w-full max-w-[220px] shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius="90%"
                        stroke="#ffffff"
                        strokeWidth={2}
                      />
                      <Tooltip formatter={(value) => `${value} tagihan`} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <ul className="w-full max-w-[240px] space-y-3" aria-label="Rincian status tagihan">
                  {statusItems.map((item) => (
                    <li key={item.key} className="flex items-center justify-between gap-4 text-sm">
                      <span className="flex items-center gap-2 text-slate-600">
                        <span
                          className="h-2.5 w-2.5 shrink-0 rounded-full"
                          style={{ backgroundColor: item.fill }}
                          aria-hidden="true"
                        />
                        {item.name}
                      </span>
                      <span className="font-semibold tabular-nums text-slate-900">
                        {item.value}
                        <span className="ml-1 text-xs font-normal text-slate-500">
                          ({Math.round((item.value / totalBills) * 100)}%)
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </ChartErrorBoundary>
        </ChartPanel>

        <ChartPanel title="Aktivitas Mingguan" icon={CalendarDays}>
          <ChartErrorBoundary minHeight={PANEL_HEIGHT} resetKey={data}>
            {isWeeklyActivityEmpty(weeklyActivity) ? (
              <EmptyState
                icon={CalendarDays}
                title="Belum ada aktivitas"
                description="Jumlah pembayaran lunas per minggu (4 minggu terakhir) akan tampil di sini."
                minHeight={PANEL_HEIGHT}
              />
            ) : (
              <ResponsiveContainer width="100%" height={PANEL_HEIGHT}>
                <BarChart data={weeklyActivity} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} vertical={false} />
                  <XAxis dataKey="week" tick={AXIS_TICK} tickLine={false} tickMargin={8} axisLine={{ stroke: GRID_STROKE }} />
                  <YAxis allowDecimals={false} tick={AXIS_TICK} tickLine={false} axisLine={false} width={32} />
                  <Tooltip cursor={{ fill: '#f1f5f9' }} />
                  <Bar dataKey="count" fill="#22c55e" name="Jumlah Pembayaran" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartErrorBoundary>
        </ChartPanel>

        <ChartPanel title="Top 5 Mahasiswa Aktif" icon={Trophy}>
          {isTopStudentsEmpty(topStudents) ? (
            <EmptyState
              icon={Trophy}
              title="Belum ada mahasiswa yang lunas"
              description="Peringkat akan muncul setelah ada tagihan yang lunas."
              action={{ href: '/dashboard/admin/students', label: 'Lihat mahasiswa' }}
              minHeight={PANEL_HEIGHT}
            />
          ) : (
            <ol className="space-y-1.5">
              {topStudents.map((student, index) => (
                <li
                  key={student.nim}
                  className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                      {index + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-800">{student.name}</p>
                      <p className="text-xs text-slate-500">{student.nim}</p>
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-bold text-green-700">{student.paidCount} lunas</p>
                    <p className="text-xs text-slate-500">{formatCurrency(student.totalPaid)}</p>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </ChartPanel>
      </div>
    </section>
  )
}
