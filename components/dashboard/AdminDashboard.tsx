'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { Bell, DollarSign, FileText, Settings, TrendingUp, Users, type LucideIcon } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils/cn'
import { formatCurrency } from '@/lib/utils/format'
import DashboardCharts, { type ChartsStatus } from './admin/DashboardCharts'
import { ErrorState } from './admin/ChartStates'
import { normalizeChartData, type ChartData } from './admin/chart-data'

interface DashboardStats {
  students: { total: number; active: number }
  bills: { total: number; paid: number; unpaid: number; overdue: number }
  cash: { balance: number; totalIncome: number; totalExpense: number }
}

const QUICK_ACTIONS: Array<{ href: string; label: string; icon: LucideIcon }> = [
  { href: '/dashboard/admin/students', label: 'Manajemen Mahasiswa', icon: Users },
  { href: '/dashboard/admin/bills', label: 'Manajemen Tagihan', icon: FileText },
  { href: '/dashboard/admin/payments', label: 'Verifikasi Pembayaran', icon: DollarSign },
  { href: '/dashboard/admin/cash', label: 'Pengelolaan Kas', icon: TrendingUp },
  { href: '/dashboard/admin/reports', label: 'Laporan', icon: FileText },
  { href: '/dashboard/admin/announcements', label: 'Pengumuman', icon: Bell },
]

// Same 1400px width as the `.container` used by the other admin pages
const PAGE_CONTAINER = 'mx-auto w-full max-w-[1400px] px-4 sm:px-6 lg:px-8'

interface StatCardProps {
  className: string
  icon: LucideIcon
  label: string
  value: string | number
  hint: string
}

function StatCard({ className, icon: Icon, label, value, hint }: StatCardProps) {
  // Gradient, padding and hover come from the .stat-card-N classes in globals.css
  return (
    <Card className={cn('flex min-w-0 flex-col justify-between gap-3', className)}>
      <h3 className="flex items-center gap-2 text-sm font-semibold">
        <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
        {label}
      </h3>
      <div>
        <p className="break-words text-2xl font-bold leading-tight tabular-nums xl:text-3xl">{value}</p>
        <p className="mt-1 text-xs opacity-90">{hint}</p>
      </div>
    </Card>
  )
}

/**
 * Stat card counts from /api/admin/dashboard/summary, which ADMIN and BENDAHARA can
 * both read. (The old /api/admin/students call is ADMIN-only, so Bendahara saw 0.)
 * Resolves to null on failure.
 */
async function fetchStats(): Promise<DashboardStats | null> {
  try {
    const res = await fetch('/api/admin/dashboard/summary')
    if (!res.ok) {
      throw new Error(`Request failed with status ${res.status}`)
    }
    const data = await res.json()

    return {
      students: {
        total: data.students?.total || 0,
        active: data.students?.active || 0,
      },
      bills: {
        total: data.bills?.total || 0,
        paid: data.bills?.paid || 0,
        unpaid: data.bills?.unpaid || 0,
        overdue: data.bills?.overdue || 0,
      },
      cash: {
        balance: data.cash?.balance || 0,
        totalIncome: data.cash?.totalIncome || 0,
        totalExpense: data.cash?.totalExpense || 0,
      },
    }
  } catch (error) {
    console.error('Failed to fetch stats:', error)
    return null
  }
}

/** Resolves to null when the request fails or returns a non-2xx status. */
async function fetchChartData(): Promise<ChartData | null> {
  try {
    const res = await fetch('/api/admin/dashboard/stats')
    if (!res.ok) {
      throw new Error(`Request failed with status ${res.status}`)
    }
    return normalizeChartData(await res.json())
  } catch (error) {
    console.error('Failed to fetch chart data:', error)
    return null
  }
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [chartData, setChartData] = useState<ChartData | null>(null)
  const [chartsStatus, setChartsStatus] = useState<ChartsStatus>('loading')

  const applyStats = useCallback((result: DashboardStats | null) => {
    setStats(result)
    setLoading(false)
  }, [])

  const applyChartData = useCallback((result: ChartData | null) => {
    setChartData(result)
    setChartsStatus(result ? 'ready' : 'error')
  }, [])

  useEffect(() => {
    // State is only set from promise callbacks; `active` drops late results after unmount
    let active = true
    void fetchStats().then((result) => {
      if (active) applyStats(result)
    })
    void fetchChartData().then((result) => {
      if (active) applyChartData(result)
    })
    return () => {
      active = false
    }
  }, [applyStats, applyChartData])

  const retryStats = () => {
    setLoading(true)
    void fetchStats().then(applyStats)
  }

  const retryCharts = () => {
    setChartsStatus('loading')
    void fetchChartData().then(applyChartData)
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(to bottom, #ffffff 0%, #f8fafc 100%)' }}>
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className={cn(PAGE_CONTAINER, 'flex items-center justify-between gap-4 py-4')}>
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-blue-900">Dashboard Admin</h1>
            <p className="text-sm text-gray-600">Sistem Kas TI26A3</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Link
              href="/dashboard/admin/settings"
              aria-label="Pengaturan"
              title="Pengaturan"
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            >
              <Settings className="h-5 w-5" aria-hidden="true" />
            </Link>
            <Link
              href="/api/auth/signout"
              className="inline-flex h-10 items-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Logout
            </Link>
          </div>
        </div>
      </header>

      <main className={cn(PAGE_CONTAINER, 'space-y-8 py-8')}>
        <section aria-labelledby="summary-heading">
          <h2 id="summary-heading" className="sr-only">
            Ringkasan
          </h2>
          {loading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4" aria-busy="true">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="p-6">
                  <div className="h-20 animate-pulse rounded bg-slate-200" aria-hidden="true" />
                </Card>
              ))}
            </div>
          ) : stats ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <StatCard
                className="stat-card-1"
                icon={Users}
                label="Total Mahasiswa"
                value={stats.students.active}
                hint="Mahasiswa aktif"
              />
              <StatCard
                className="stat-card-2"
                icon={TrendingUp}
                label="Sudah Bayar"
                value={stats.bills.paid}
                hint="Tagihan lunas"
              />
              <StatCard
                className="stat-card-3"
                icon={FileText}
                label="Belum Bayar"
                value={stats.bills.unpaid + stats.bills.overdue}
                hint="Perlu diingatkan"
              />
              <StatCard
                className="stat-card-4"
                icon={DollarSign}
                label="Saldo Kas"
                value={formatCurrency(stats.cash.balance)}
                hint="Saldo real-time"
              />
            </div>
          ) : (
            <ErrorState
              title="Gagal memuat statistik"
              description="Ringkasan mahasiswa, tagihan, dan kas tidak dapat diambil."
              onRetry={retryStats}
              minHeight={160}
            />
          )}
        </section>

        <DashboardCharts status={chartsStatus} data={chartData} onRetry={retryCharts} />

        <section aria-labelledby="menu-heading">
          <Card className="p-6">
            <h2 id="menu-heading" className="mb-4 text-lg font-semibold text-slate-900">
              Menu Utama
            </h2>
            <nav aria-labelledby="menu-heading">
              <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {QUICK_ACTIONS.map(({ href, label, icon: Icon }) => (
                  <li key={href}>
                    <Link href={href} className="menu-item h-full">
                      <Icon className="h-8 w-8" aria-hidden="true" />
                      <span>{label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </Card>
        </section>
      </main>
    </div>
  )
}
