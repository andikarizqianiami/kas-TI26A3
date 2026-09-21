'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Users, DollarSign, TrendingUp, FileText, Bell, Settings, PieChart as PieChartIcon, BarChart3 } from 'lucide-react'
import { formatCurrency } from '@/lib/utils/format'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'

interface DashboardStats {
  students: { total: number; active: number }
  bills: { total: number; paid: number; unpaid: number; overdue: number }
  cash: { balance: number; totalIncome: number; totalExpense: number }
}

interface ChartData {
  paymentTrends: Array<{ month: string; amount: number; count: number }>
  cashFlow: Array<{ month: string; income: number; expense: number; net: number }>
  statusDistribution: { paid: number; unpaid: number; overdue: number }
  topStudents: Array<{ name: string; nim: string; paidCount: number; totalPaid: number }>
  incomeCategories: Array<{ category: string; amount: number; count: number }>
  expenseCategories: Array<{ category: string; amount: number; count: number }>
  weeklyActivity: Array<{ week: string; count: number; amount: number }>
}

const COLORS = {
  paid: '#22c55e',
  unpaid: '#f59e0b',
  overdue: '#ef4444',
  income: '#3b82f6',
  expense: '#ef4444',
  net: '#8b5cf6'
}

const PIE_COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [chartData, setChartData] = useState<ChartData | null>(null)
  const [loading, setLoading] = useState(true)
  const [chartsLoading, setChartsLoading] = useState(true)

  useEffect(() => {
    fetchStats()
    fetchChartData()
  }, [])

  const fetchStats = async () => {
    try {
      const [studentsRes, billsRes, cashRes] = await Promise.all([
        fetch('/api/admin/students'),
        fetch('/api/admin/bills'),
        fetch('/api/admin/cash')
      ])

      const [studentsData, billsData, cashData] = await Promise.all([
        studentsRes.json(),
        billsRes.json(),
        cashRes.json()
      ])

      setStats({
        students: {
          total: studentsData.total || 0,
          active: studentsData.active || 0
        },
        bills: billsData.stats || { total: 0, paid: 0, unpaid: 0, overdue: 0 },
        cash: {
          balance: cashData.balance || 0,
          totalIncome: cashData.totalIncome || 0,
          totalExpense: cashData.totalExpense || 0
        }
      })
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchChartData = async () => {
    try {
      const res = await fetch('/api/admin/dashboard/stats')
      if (res.ok) {
        const data = await res.json()
        setChartData(data)
      }
    } catch (error) {
      console.error('Failed to fetch chart data:', error)
    } finally {
      setChartsLoading(false)
    }
  }

  const statusPieData = chartData ? [
    { name: 'Lunas', value: chartData.statusDistribution.paid, color: COLORS.paid },
    { name: 'Belum Bayar', value: chartData.statusDistribution.unpaid, color: COLORS.unpaid },
    { name: 'Terlambat', value: chartData.statusDistribution.overdue, color: COLORS.overdue }
  ] : []

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b bg-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-blue-900">Dashboard Admin</h1>
              <p className="text-gray-600">Sistem Kas TI26A3</p>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/dashboard/admin/settings">
                <Button variant="ghost">
                  <Settings className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/api/auth/signout">
                <Button variant="outline">Logout</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Quick Stats */}
        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
            {[1, 2, 3, 4].map(i => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <div className="h-20 bg-gray-200 animate-pulse rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : stats ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Total Mahasiswa
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.students.active}</div>
                <p className="text-xs text-gray-500 mt-1">Mahasiswa aktif</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Sudah Bayar
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">{stats.bills.paid}</div>
                <p className="text-xs text-gray-500 mt-1">Tagihan lunas</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Belum Bayar
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-yellow-600">{stats.bills.unpaid + stats.bills.overdue}</div>
                <p className="text-xs text-gray-500 mt-1">Perlu diingatkan</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Saldo Kas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">{formatCurrency(stats.cash.balance)}</div>
                <p className="text-xs text-gray-500 mt-1">Saldo real-time</p>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">Failed to load statistics</div>
        )}

        {/* Charts Section */}
        {!chartsLoading && chartData && (
          <div className="grid gap-6 mb-8">
            {/* Cash Flow Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Arus Kas (6 Bulan Terakhir)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData.cashFlow}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                    <Legend />
                    <Line type="monotone" dataKey="income" stroke={COLORS.income} name="Pemasukan" strokeWidth={2} />
                    <Line type="monotone" dataKey="expense" stroke={COLORS.expense} name="Pengeluaran" strokeWidth={2} />
                    <Line type="monotone" dataKey="net" stroke={COLORS.net} name="Saldo Bersih" strokeWidth={2} strokeDasharray="5 5" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Payment Trends */}
              <Card>
                <CardHeader>
                  <CardTitle>Tren Pembayaran</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={chartData.paymentTrends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => formatCurrency(value as number)} />
                      <Bar dataKey="amount" fill="#3b82f6" name="Jumlah" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Status Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChartIcon className="h-5 w-5" />
                    Status Tagihan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={statusPieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry) => `${entry.name}: ${entry.value}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {statusPieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Weekly Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Aktivitas Mingguan</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={chartData.weeklyActivity}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="week" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#22c55e" name="Jumlah Pembayaran" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Top Students */}
              <Card>
                <CardHeader>
                  <CardTitle>Top 5 Mahasiswa Aktif</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {chartData.topStudents.map((student, index) => (
                      <div key={student.nim} className="flex items-center justify-between p-2 rounded bg-gray-50">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold text-sm">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-semibold text-sm">{student.name}</p>
                            <p className="text-xs text-gray-500">{student.nim}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">{student.paidCount} lunas</p>
                          <p className="text-xs text-gray-500">{formatCurrency(student.totalPaid)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Menu Utama</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Link href="/dashboard/admin/students">
                <Button variant="outline" className="w-full h-24 flex flex-col space-y-2">
                  <Users className="h-8 w-8" />
                  <span>Manajemen Mahasiswa</span>
                </Button>
              </Link>

              <Link href="/dashboard/admin/bills">
                <Button variant="outline" className="w-full h-24 flex flex-col space-y-2">
                  <FileText className="h-8 w-8" />
                  <span>Manajemen Tagihan</span>
                </Button>
              </Link>

              <Link href="/dashboard/admin/payments">
                <Button variant="outline" className="w-full h-24 flex flex-col space-y-2">
                  <DollarSign className="h-8 w-8" />
                  <span>Verifikasi Pembayaran</span>
                </Button>
              </Link>

              <Link href="/dashboard/admin/cash">
                <Button variant="outline" className="w-full h-24 flex flex-col space-y-2">
                  <TrendingUp className="h-8 w-8" />
                  <span>Pengelolaan Kas</span>
                </Button>
              </Link>

              <Link href="/dashboard/admin/reports">
                <Button variant="outline" className="w-full h-24 flex flex-col space-y-2">
                  <FileText className="h-8 w-8" />
                  <span>Laporan</span>
                </Button>
              </Link>

              <Link href="/dashboard/admin/announcements">
                <Button variant="outline" className="w-full h-24 flex flex-col space-y-2">
                  <Bell className="h-8 w-8" />
                  <span>Pengumuman</span>
                </Button>
              </Link>

              <Link href="/dashboard/admin/funding-targets">
                <Button variant="outline" className="w-full h-24 flex flex-col space-y-2">
                  <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                  <span>Target Urunan</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Funding Targets Widget */}
        <FundingTargetsWidget />
      </div>
    </div>
  )
}

// Funding Targets Widget Component
function FundingTargetsWidget() {
  const [targets, setTargets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [pendingCount, setPendingCount] = useState(0)

  useEffect(() => {
    fetchFundingTargets()
  }, [])

  const fetchFundingTargets = async () => {
    try {
      const res = await fetch('/api/admin/funding-targets?status=ACTIVE')
      if (res.ok) {
        const data = await res.json()
        setTargets(data.targets.slice(0, 3)) // Top 3 active targets
        
        // Count pending contributions
        const pending = data.targets.reduce((sum: number, t: any) => {
          return sum + t.contributions.filter((c: any) => c.status === 'PENDING_VERIFICATION').length
        }, 0)
        setPendingCount(pending)
      }
    } catch (error) {
      console.error('Failed to fetch funding targets:', error)
    } finally {
      setLoading(false)
    }
  }

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-green-600'
    if (percentage >= 75) return 'bg-blue-600'
    if (percentage >= 50) return 'bg-yellow-600'
    return 'bg-gray-600'
  }

  if (loading) {
    return (
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Target Urunan Aktif</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-200 animate-pulse rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (targets.length === 0) {
    return null
  }

  return (
    <Card className="mb-8">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Target Urunan Aktif</CardTitle>
            <p className="text-sm text-gray-600 mt-1">Target yang sedang berlangsung</p>
          </div>
          <Link href="/dashboard/admin/funding-targets">
            <Button variant="outline" size="sm">
              Lihat Semua
              {pendingCount > 0 && (
                <span className="ml-2 bg-yellow-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {pendingCount}
                </span>
              )}
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {targets.map((target) => {
            const progress = Math.min(100, Math.round((target.currentAmount / target.targetAmount) * 100))
            const pendingContributions = target.contributions?.filter((c: any) => c.status === 'PENDING_VERIFICATION').length || 0

            return (
              <Link 
                key={target.id} 
                href={`/dashboard/admin/funding-targets/${target.id}`}
                className="block"
              >
                <div className="border rounded-lg p-4 hover:border-blue-500 hover:shadow-md transition-all cursor-pointer">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{target.title}</h3>
                      <p className="text-sm text-gray-600 line-clamp-1">{target.description}</p>
                    </div>
                    {pendingContributions > 0 && (
                      <span className="ml-2 bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full whitespace-nowrap">
                        {pendingContributions} pending
                      </span>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">
                        {formatCurrency(target.currentAmount)} / {formatCurrency(target.targetAmount)}
                      </span>
                      <span className="font-bold text-gray-900">{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className={`h-2.5 rounded-full transition-all ${getProgressColor(progress)}`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <span>{target._count.contributions} kontributor</span>
                      {target.deadline && (
                        <span>Deadline: {new Date(target.deadline).toLocaleDateString('id-ID')}</span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
