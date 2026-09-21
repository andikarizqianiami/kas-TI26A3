'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Plus, Search, FileText } from 'lucide-react'
import Link from 'next/link'
import { formatCurrency, formatDate } from '@/lib/utils/format'

interface Bill {
  id: string
  name: string
  amount: number
  weekPeriod: string
  deadline: string
  status: string
  student: { nim: string; name: string }
}

export default function AdminBillsPage() {
  const [bills, setBills] = useState<Bill[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('ALL')

  useEffect(() => {
    fetchBills()
  }, [])

  const fetchBills = async () => {
    try {
      const res = await fetch('/api/admin/bills')
      if (res.ok) {
        const data = await res.json()
        setBills(data.bills || [])
      }
    } catch (err) {
      console.error('Failed to fetch bills')
    } finally {
      setLoading(false)
    }
  }

  const filteredBills = bills.filter(b => {
    const matchSearch = b.student.name.toLowerCase().includes(search.toLowerCase()) ||
                       b.student.nim.includes(search) ||
                       b.name.toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus === 'ALL' || b.status === filterStatus
    return matchSearch && matchStatus
  })

  const stats = {
    total: bills.length,
    paid: bills.filter(b => b.status === 'PAID').length,
    unpaid: bills.filter(b => b.status === 'UNPAID').length,
    overdue: bills.filter(b => b.status === 'OVERDUE').length
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
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold" style={{ color: 'var(--color-text)' }}>
                Manajemen Tagihan
              </h1>
              <p style={{ color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>
                Kelola tagihan kas mingguan mahasiswa
              </p>
            </div>
            <Link href="/dashboard/admin/bills/create">
              <button
                className="btn-primary"
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <Plus size={18} /> Buat Tagihan Baru
              </button>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="surface" style={{ padding: '1rem' }}>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Total Tagihan</p>
            <h3 className="text-2xl font-bold" style={{ color: 'var(--color-text)', marginTop: '0.25rem' }}>
              {stats.total}
            </h3>
          </div>
          <div className="surface" style={{ padding: '1rem' }}>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Lunas</p>
            <h3 className="text-2xl font-bold" style={{ color: '#22c55e', marginTop: '0.25rem' }}>
              {stats.paid}
            </h3>
          </div>
          <div className="surface" style={{ padding: '1rem' }}>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Belum Bayar</p>
            <h3 className="text-2xl font-bold" style={{ color: '#eab308', marginTop: '0.25rem' }}>
              {stats.unpaid}
            </h3>
          </div>
          <div className="surface" style={{ padding: '1rem' }}>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Terlambat</p>
            <h3 className="text-2xl font-bold" style={{ color: '#ef4444', marginTop: '0.25rem' }}>
              {stats.overdue}
            </h3>
          </div>
        </div>

        {/* Filters */}
        <div className="surface mb-6" style={{ padding: '1rem' }}>
          <div className="flex gap-4">
            <div style={{ flex: 1, position: 'relative' }}>
              <Search 
                size={18} 
                style={{ 
                  position: 'absolute', 
                  left: '1rem', 
                  top: '50%', 
                  transform: 'translateY(-50%)',
                  color: 'var(--color-text-muted)' 
                }} 
              />
              <input
                type="text"
                placeholder="Cari berdasarkan nama, NIM, atau tagihan..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem 0.75rem 3rem',
                  background: 'var(--color-bg)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '0.5rem',
                  color: 'var(--color-text)',
                  fontSize: '0.875rem'
                }}
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{
                padding: '0.75rem 1rem',
                background: 'var(--color-bg)',
                border: '1px solid var(--color-border)',
                borderRadius: '0.5rem',
                color: 'var(--color-text)',
                fontSize: '0.875rem'
              }}
            >
              <option value="ALL">Semua Status</option>
              <option value="PAID">Lunas</option>
              <option value="UNPAID">Belum Bayar</option>
              <option value="OVERDUE">Terlambat</option>
            </select>
          </div>
        </div>

        {/* Bills Table */}
        <div className="surface" style={{ padding: '1.5rem' }}>
          <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--color-text)' }}>
            Daftar Tagihan ({filteredBills.length})
          </h2>

          {filteredBills.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
              <FileText size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
              <p>{search || filterStatus !== 'ALL' ? 'Tidak ada tagihan yang cocok dengan filter.' : 'Belum ada tagihan.'}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <th className="text-left p-3" style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', fontWeight: 600 }}>
                      Mahasiswa
                    </th>
                    <th className="text-left p-3" style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', fontWeight: 600 }}>
                      Tagihan
                    </th>
                    <th className="text-left p-3" style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', fontWeight: 600 }}>
                      Jumlah
                    </th>
                    <th className="text-left p-3" style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', fontWeight: 600 }}>
                      Periode
                    </th>
                    <th className="text-left p-3" style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', fontWeight: 600 }}>
                      Deadline
                    </th>
                    <th className="text-left p-3" style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', fontWeight: 600 }}>
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBills.map((bill) => (
                    <tr key={bill.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                      <td className="p-3">
                        <div>
                          <p style={{ color: 'var(--color-text)', fontWeight: 500 }}>{bill.student.name}</p>
                          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>{bill.student.nim}</p>
                        </div>
                      </td>
                      <td className="p-3" style={{ color: 'var(--color-text)' }}>
                        {bill.name}
                      </td>
                      <td className="p-3" style={{ color: 'var(--color-text)', fontWeight: 600 }}>
                        {formatCurrency(bill.amount)}
                      </td>
                      <td className="p-3" style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                        {bill.weekPeriod}
                      </td>
                      <td className="p-3" style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                        {formatDate(bill.deadline, 'dd MMM yyyy')}
                      </td>
                      <td className="p-3">
                        <span
                          style={{
                            padding: '0.25rem 0.75rem',
                            borderRadius: '0.5rem',
                            fontSize: '0.75rem',
                            fontWeight: 500,
                            background: bill.status === 'PAID' ? 'rgba(34, 197, 94, 0.1)' : 
                                       bill.status === 'UNPAID' ? 'rgba(234, 179, 8, 0.1)' :
                                       'rgba(239, 68, 68, 0.1)',
                            color: bill.status === 'PAID' ? '#22c55e' : 
                                  bill.status === 'UNPAID' ? '#eab308' :
                                  '#ef4444'
                          }}
                        >
                          {bill.status === 'PAID' ? 'Lunas' : 
                           bill.status === 'UNPAID' ? 'Belum Bayar' : 
                           'Terlambat'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
