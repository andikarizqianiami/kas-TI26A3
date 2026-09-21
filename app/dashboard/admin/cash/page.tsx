'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, TrendingUp, TrendingDown, Wallet } from 'lucide-react'
import Link from 'next/link'
import { formatCurrency, formatDate } from '@/lib/utils/format'

interface CashData {
  balance: number
  totalIncome: number
  totalExpense: number
  recentIncomes: Array<{
    id: string
    amount: number
    description: string
    date: string
    source: string
  }>
  recentExpenses: Array<{
    id: string
    amount: number
    description: string
    date: string
    category: string
  }>
}

export default function AdminCashPage() {
  const [data, setData] = useState<CashData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCashData()
  }, [])

  const fetchCashData = async () => {
    try {
      const res = await fetch('/api/admin/cash')
      if (res.ok) {
        const cashData = await res.json()
        setData(cashData)
      }
    } catch (err) {
      console.error('Failed to fetch cash data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-bg)' }}>
        <p style={{ color: 'var(--color-text-muted)' }}>Loading...</p>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-bg)' }}>
        <p style={{ color: 'var(--color-text-muted)' }}>Failed to load cash data</p>
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
                Pengelolaan Kas
              </h1>
              <p style={{ color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>
                Monitor pemasukan dan pengeluaran kas kelas
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Link href="/dashboard/admin/cash/income">
                <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#22c55e', borderColor: '#22c55e' }}>
                  <TrendingUp size={18} /> Kelola Pemasukan
                </button>
              </Link>
              <Link href="/dashboard/admin/cash/expense">
                <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#ef4444', borderColor: '#ef4444' }}>
                  <TrendingDown size={18} /> Kelola Pengeluaran
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Balance Overview */}
        <div className="grid grid-cols-3 gap-6 mb-6">
          <div className="surface" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ 
                width: '3rem', 
                height: '3rem', 
                borderRadius: '0.75rem', 
                background: 'rgba(59, 130, 246, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Wallet size={24} style={{ color: 'var(--color-primary)' }} />
              </div>
              <div>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Saldo Kas</p>
                <h2 className="text-3xl font-bold" style={{ color: 'var(--color-text)', marginTop: '0.25rem' }}>
                  {formatCurrency(data.balance)}
                </h2>
              </div>
            </div>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Saldo real-time kelas</p>
          </div>

          <div className="surface" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ 
                width: '3rem', 
                height: '3rem', 
                borderRadius: '0.75rem', 
                background: 'rgba(34, 197, 94, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <TrendingUp size={24} style={{ color: '#22c55e' }} />
              </div>
              <div>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Total Pemasukan</p>
                <h2 className="text-3xl font-bold" style={{ color: '#22c55e', marginTop: '0.25rem' }}>
                  {formatCurrency(data.totalIncome)}
                </h2>
              </div>
            </div>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Kas masuk keseluruhan</p>
          </div>

          <div className="surface" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ 
                width: '3rem', 
                height: '3rem', 
                borderRadius: '0.75rem', 
                background: 'rgba(239, 68, 68, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <TrendingDown size={24} style={{ color: '#ef4444' }} />
              </div>
              <div>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Total Pengeluaran</p>
                <h2 className="text-3xl font-bold" style={{ color: '#ef4444', marginTop: '0.25rem' }}>
                  {formatCurrency(data.totalExpense)}
                </h2>
              </div>
            </div>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Kas keluar keseluruhan</p>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="grid grid-cols-2 gap-6">
          {/* Recent Income */}
          <div className="surface" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 className="text-xl font-semibold" style={{ color: 'var(--color-text)' }}>
                Pemasukan Terakhir
              </h2>
              <TrendingUp size={20} style={{ color: '#22c55e' }} />
            </div>

            {data.recentIncomes.length === 0 ? (
              <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: '2rem' }}>
                Belum ada pemasukan
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {data.recentIncomes.map((income) => (
                  <div 
                    key={income.id}
                    style={{ 
                      padding: '1rem',
                      background: 'var(--color-bg)',
                      borderRadius: '0.5rem',
                      border: '1px solid var(--color-border)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <p style={{ color: 'var(--color-text)', fontWeight: 500 }}>{income.description}</p>
                      <p style={{ color: '#22c55e', fontWeight: 600 }}>+{formatCurrency(income.amount)}</p>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                      <span>{income.source}</span>
                      <span>{formatDate(income.date, 'dd MMM yyyy')}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Expenses */}
          <div className="surface" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 className="text-xl font-semibold" style={{ color: 'var(--color-text)' }}>
                Pengeluaran Terakhir
              </h2>
              <TrendingDown size={20} style={{ color: '#ef4444' }} />
            </div>

            {data.recentExpenses.length === 0 ? (
              <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: '2rem' }}>
                Belum ada pengeluaran
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {data.recentExpenses.map((expense) => (
                  <div 
                    key={expense.id}
                    style={{ 
                      padding: '1rem',
                      background: 'var(--color-bg)',
                      borderRadius: '0.5rem',
                      border: '1px solid var(--color-border)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <p style={{ color: 'var(--color-text)', fontWeight: 500 }}>{expense.description}</p>
                      <p style={{ color: '#ef4444', fontWeight: 600 }}>-{formatCurrency(expense.amount)}</p>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                      <span>{expense.category}</span>
                      <span>{formatDate(expense.date, 'dd MMM yyyy')}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
