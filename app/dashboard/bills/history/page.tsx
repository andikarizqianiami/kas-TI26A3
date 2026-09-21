'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, ReceiptText, Search, Filter, Download, CheckCircle, XCircle, Clock, Calendar } from 'lucide-react'
import Link from 'next/link'
import { formatCurrency, formatDate, formatDateTime } from '@/lib/utils/format'

interface Bill {
  id: string
  name: string
  description: string
  amount: number
  weekPeriod: string
  weekStartDate: string
  deadline: string
  status: 'PAID' | 'UNPAID' | 'OVERDUE'
  paidAt: string | null
  createdAt: string
  payment?: {
    id: string
    method: string
    paymentDate: string
    status: string
  } | null
}

interface Statistics {
  total: number
  paid: number
  unpaid: number
  overdue: number
  totalAmount: number
  totalPaid: number
  totalUnpaid: number
}

const STATUS_CONFIG = {
  PAID: { label: 'Lunas', color: '#22c55e', bg: 'rgba(34, 197, 94, 0.1)', icon: CheckCircle },
  UNPAID: { label: 'Belum Dibayar', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)', icon: Clock },
  OVERDUE: { label: 'Terlambat', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)', icon: XCircle },
}

export default function BillHistoryPage() {
  const [bills, setBills] = useState<Bill[]>([])
  const [filteredBills, setFilteredBills] = useState<Bill[]>([])
  const [statistics, setStatistics] = useState<Statistics | null>(null)
  const [periods, setPeriods] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [periodFilter, setPeriodFilter] = useState('ALL')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    fetchBillHistory()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [bills, searchQuery, statusFilter, periodFilter])

  const fetchBillHistory = async () => {
    try {
      const res = await fetch('/api/bills/history')
      if (res.ok) {
        const data = await res.json()
        setBills(data.bills || [])
        setStatistics(data.statistics)
        setPeriods(data.periods || [])
      }
    } catch (err) {
      console.error('Failed to fetch bill history')
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...bills]

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(bill => 
        bill.name.toLowerCase().includes(query) ||
        bill.description.toLowerCase().includes(query) ||
        bill.weekPeriod.toLowerCase().includes(query)
      )
    }

    // Status filter
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(bill => bill.status === statusFilter)
    }

    // Period filter
    if (periodFilter !== 'ALL') {
      filtered = filtered.filter(bill => bill.weekPeriod === periodFilter)
    }

    setFilteredBills(filtered)
  }

  const clearFilters = () => {
    setSearchQuery('')
    setStatusFilter('ALL')
    setPeriodFilter('ALL')
  }

  const exportToCSV = () => {
    const headers = ['Periode', 'Tagihan', 'Jumlah', 'Deadline', 'Status', 'Tgl Bayar']
    const rows = filteredBills.map(bill => [
      bill.weekPeriod,
      bill.name,
      bill.amount,
      formatDate(bill.deadline, 'dd/MM/yyyy'),
      STATUS_CONFIG[bill.status].label,
      bill.paidAt ? formatDate(bill.paidAt, 'dd/MM/yyyy') : '-'
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `riwayat-tagihan-${formatDate(new Date(), 'yyyy-MM-dd')}.csv`
    a.click()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-bg)' }}>
        <p style={{ color: 'var(--color-text-muted)' }}>Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg)', padding: '2rem' }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link 
            href="/dashboard" 
            className="inline-flex items-center gap-2 mb-4" 
            style={{ color: 'var(--color-primary)', fontSize: '0.875rem' }}
          >
            <ArrowLeft size={16} /> Kembali ke Dashboard
          </Link>
          
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold" style={{ color: 'var(--color-text)' }}>
                Riwayat Tagihan
              </h1>
              <p style={{ color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>
                Lihat semua tagihan kas kelas Anda
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="btn-secondary"
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <Filter size={18} />
                Filter
              </button>
              
              <button
                onClick={exportToCSV}
                className="btn-primary"
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <Download size={18} />
                Export CSV
              </button>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        {statistics && (
          <div className="grid gap-4 md:grid-cols-4 mb-6">
            <div className="surface" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <div style={{ padding: '0.5rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '0.5rem' }}>
                  <ReceiptText size={20} style={{ color: '#3b82f6' }} />
                </div>
                <span style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', fontWeight: 600 }}>
                  Total Tagihan
                </span>
              </div>
              <p className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
                {statistics.total}
              </p>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                {formatCurrency(statistics.totalAmount)}
              </p>
            </div>

            <div className="surface" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <div style={{ padding: '0.5rem', background: 'rgba(34, 197, 94, 0.1)', borderRadius: '0.5rem' }}>
                  <CheckCircle size={20} style={{ color: '#22c55e' }} />
                </div>
                <span style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', fontWeight: 600 }}>
                  Lunas
                </span>
              </div>
              <p className="text-2xl font-bold" style={{ color: '#22c55e' }}>
                {statistics.paid}
              </p>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                {formatCurrency(statistics.totalPaid)}
              </p>
            </div>

            <div className="surface" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <div style={{ padding: '0.5rem', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '0.5rem' }}>
                  <Clock size={20} style={{ color: '#f59e0b' }} />
                </div>
                <span style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', fontWeight: 600 }}>
                  Belum Bayar
                </span>
              </div>
              <p className="text-2xl font-bold" style={{ color: '#f59e0b' }}>
                {statistics.unpaid}
              </p>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                {formatCurrency(statistics.totalUnpaid)}
              </p>
            </div>

            <div className="surface" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <div style={{ padding: '0.5rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '0.5rem' }}>
                  <XCircle size={20} style={{ color: '#ef4444' }} />
                </div>
                <span style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', fontWeight: 600 }}>
                  Terlambat
                </span>
              </div>
              <p className="text-2xl font-bold" style={{ color: '#ef4444' }}>
                {statistics.overdue}
              </p>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                Perlu segera dibayar
              </p>
            </div>
          </div>
        )}

        {/* Filters Panel */}
        {showFilters && (
          <div className="surface mb-6" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
              {/* Search */}
              <div>
                <label style={{ display: 'block', color: 'var(--color-text)', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                  Cari
                </label>
                <div style={{ position: 'relative' }}>
                  <Search size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari tagihan..."
                    style={{ width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.75rem', background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: '0.5rem', color: 'var(--color-text)' }}
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div>
                <label style={{ display: 'block', color: 'var(--color-text)', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: '0.5rem', color: 'var(--color-text)' }}
                >
                  <option value="ALL">Semua Status</option>
                  <option value="PAID">Lunas</option>
                  <option value="UNPAID">Belum Dibayar</option>
                  <option value="OVERDUE">Terlambat</option>
                </select>
              </div>

              {/* Period Filter */}
              <div>
                <label style={{ display: 'block', color: 'var(--color-text)', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                  Periode
                </label>
                <select
                  value={periodFilter}
                  onChange={(e) => setPeriodFilter(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: '0.5rem', color: 'var(--color-text)' }}
                >
                  <option value="ALL">Semua Periode</option>
                  {periods.map(period => (
                    <option key={period} value={period}>{period}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={clearFilters}
                className="btn-secondary"
                style={{ fontSize: '0.875rem' }}
              >
                Reset Filter
              </button>
            </div>
          </div>
        )}

        {/* Bills List */}
        <div className="surface" style={{ padding: '1.5rem' }}>
          <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 className="text-xl font-semibold" style={{ color: 'var(--color-text)' }}>
              Daftar Tagihan ({filteredBills.length})
            </h2>
          </div>

          {filteredBills.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
              <ReceiptText size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
              <p>Tidak ada tagihan ditemukan</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
                    <th className="text-left p-3" style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', fontWeight: 600 }}>
                      Periode
                    </th>
                    <th className="text-left p-3" style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', fontWeight: 600 }}>
                      Tagihan
                    </th>
                    <th className="text-right p-3" style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', fontWeight: 600 }}>
                      Jumlah
                    </th>
                    <th className="text-left p-3" style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', fontWeight: 600 }}>
                      Deadline
                    </th>
                    <th className="text-center p-3" style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', fontWeight: 600 }}>
                      Status
                    </th>
                    <th className="text-left p-3" style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', fontWeight: 600 }}>
                      Tgl Bayar
                    </th>
                    <th className="text-center p-3" style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', fontWeight: 600 }}>
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBills.map((bill) => {
                    const statusConfig = STATUS_CONFIG[bill.status]
                    const StatusIcon = statusConfig.icon

                    return (
                      <tr key={bill.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                        <td className="p-3" style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Calendar size={14} />
                            {bill.weekPeriod}
                          </div>
                        </td>
                        <td className="p-3">
                          <div>
                            <p className="font-semibold" style={{ color: 'var(--color-text)' }}>
                              {bill.name}
                            </p>
                            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                              {bill.description}
                            </p>
                          </div>
                        </td>
                        <td className="p-3 text-right" style={{ color: 'var(--color-text)', fontWeight: 600 }}>
                          {formatCurrency(bill.amount)}
                        </td>
                        <td className="p-3" style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                          {formatDate(bill.deadline, 'dd MMM yyyy')}
                        </td>
                        <td className="p-3">
                          <div style={{ display: 'flex', justifyContent: 'center' }}>
                            <span style={{ 
                              display: 'inline-flex', 
                              alignItems: 'center', 
                              gap: '0.25rem', 
                              padding: '0.375rem 0.75rem', 
                              background: statusConfig.bg, 
                              color: statusConfig.color, 
                              borderRadius: '9999px', 
                              fontSize: '0.75rem', 
                              fontWeight: 600 
                            }}>
                              <StatusIcon size={12} />
                              {statusConfig.label}
                            </span>
                          </div>
                        </td>
                        <td className="p-3" style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                          {bill.paidAt ? formatDate(bill.paidAt, 'dd MMM yyyy') : '-'}
                        </td>
                        <td className="p-3">
                          <div style={{ display: 'flex', justifyContent: 'center' }}>
                            {bill.status !== 'PAID' && (
                              <Link href={`/dashboard/payment/${bill.id}`}>
                                <button
                                  className="btn-primary"
                                  style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                                >
                                  Bayar
                                </button>
                              </Link>
                            )}
                            {bill.status === 'PAID' && bill.payment && (
                              <span style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                                {bill.payment.method.replace('_', ' ')}
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
