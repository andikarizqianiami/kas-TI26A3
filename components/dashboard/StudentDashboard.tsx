'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Bell, CalendarDays, CheckCircle2, ChevronRight, CircleAlert, Clock3, CreditCard, LogOut, ReceiptText, Wallet } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils/format'

interface Payment {
  id: string
  amount: number
  method: string
  status: string
  createdAt: string
  bill?: { name: string } | null
}

interface Announcement { id: string; title: string; content: string; createdAt: string }

interface DashboardData {
  student: { id: string; nim: string; name: string; email: string; class: string }
  currentBill: { id: string; name: string; amount: number; deadline: string; status: string; weekPeriod: string } | null
  statistics: { totalBills: number; paidBills: number; unpaidBills: number; overdueBills: number; totalAmount: number; totalPaid: number; totalUnpaid: number }
  classBalance: number
  recentPayments: Payment[]
  unreadNotifications: number
  announcements: Announcement[]
}

function firstName(name: string) { return name.trim().split(/\s+/)[0] || name }
function paymentStatus(status: string) {
  if (status === 'PAID') return { label: 'Lunas', className: 'is-paid' }
  if (status === 'PENDING_VERIFICATION') return { label: 'Menunggu verifikasi', className: 'is-pending' }
  if (status === 'REJECTED') return { label: 'Ditolak', className: 'is-overdue' }
  return { label: 'Diproses', className: 'is-pending' }
}

export default function StudentDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadDashboard() {
      try {
        const response = await fetch('/api/dashboard/student')
        if (response.ok) setData(await response.json())
      } catch {
        setData(null)
      } finally {
        setLoading(false)
      }
    }
    void loadDashboard()
  }, [])

  if (loading) return <main className="dashboard-loading"><span /><p>Memuat dashboard...</p></main>
  if (!data) return <main className="dashboard-loading"><CircleAlert size={28} /><h1>Dashboard belum dapat dimuat</h1><p>Silakan muat ulang halaman ini.</p></main>

  const billsNeedingAttention = data.statistics.unpaidBills + data.statistics.overdueBills
  const avatar = firstName(data.student.name).slice(0, 1).toUpperCase()

  return (
    <main className="student-dashboard">
      <header className="student-topbar">
        <Link href="/dashboard" className="student-brand"><span>KT</span><strong>KAS TI26A3</strong></Link>
        <div className="student-account">
          {data.unreadNotifications > 0 && <span className="notification-count"><Bell size={14} /> {data.unreadNotifications}</span>}
          <div className="student-avatar" aria-label={data.student.name}>{avatar}</div>
          <Link href="/api/auth/signout" className="student-logout" aria-label="Keluar"><LogOut size={17} /><span>Keluar</span></Link>
        </div>
      </header>

      <div className="student-content">
        <section className="student-welcome">
          <div><p className="student-kicker">Dashboard mahasiswa</p><h1>Halo, {firstName(data.student.name)}.</h1><p>{data.student.class} · {data.student.nim}</p></div>
          <div className="student-date"><CalendarDays size={16} /> {formatDate(new Date(), 'EEEE, dd MMMM yyyy')}</div>
        </section>

        <section className="overview-grid">
          <article className="bill-card">
            <div className="card-label"><span><ReceiptText size={17} /> Tagihan minggu ini</span>{data.currentBill && <span className={`bill-state ${data.currentBill.status === 'PAID' ? 'is-paid' : 'is-pending'}`}>{data.currentBill.status === 'PAID' ? 'Lunas' : 'Belum dibayar'}</span>}</div>
            {data.currentBill ? <><h2>{formatCurrency(data.currentBill.amount)}</h2><p>{data.currentBill.name} · Periode {data.currentBill.weekPeriod}</p><div className="bill-card-bottom"><span><Clock3 size={15} /> Batas pembayaran {formatDate(data.currentBill.deadline, 'dd MMM yyyy')}</span>{data.currentBill.status !== 'PAID' && <Link href={`/dashboard/payment/${data.currentBill.id}`}>Bayar sekarang <ChevronRight size={15} /></Link>}</div></> : <><h2 className="no-bill-title">Tidak ada tagihan aktif</h2><p>Tagihan baru akan muncul di sini saat dibuat oleh bendahara.</p><div className="bill-card-bottom"><span><CheckCircle2 size={15} /> Semua tagihan sudah diperiksa</span></div></>}
          </article>
          <article className="balance-card"><div className="balance-icon"><Wallet size={21} /></div><p>Saldo kas kelas</p><h2>{formatCurrency(data.classBalance)}</h2><span>Saldo tercatat saat ini</span></article>
        </section>

        <section className="summary-grid" aria-label="Ringkasan pembayaran">
          <article><p>Total pembayaran</p><strong>{formatCurrency(data.statistics.totalPaid)}</strong><span>{data.statistics.paidBills} tagihan telah lunas</span></article>
          <article><p>Perlu diperhatikan</p><strong className={billsNeedingAttention > 0 ? 'amount-attention' : ''}>{billsNeedingAttention}</strong><span>{billsNeedingAttention ? 'Tagihan belum diselesaikan' : 'Tidak ada tunggakan'}</span></article>
          <article><p>Total tagihan</p><strong>{data.statistics.totalBills}</strong><span>{formatCurrency(data.statistics.totalAmount)} keseluruhan</span></article>
        </section>

        {/* Target Urunan Quick Access */}
        <section style={{ marginTop: '1.5rem' }}>
          <FundingTargetsStudentWidget />
        </section>

        <section className="dashboard-columns">
          <article className="dashboard-panel"><div className="panel-heading"><div><h2>Riwayat pembayaran</h2><p>Pembayaran terbaru kamu</p></div><CreditCard size={19} /></div>{data.recentPayments.length ? <><div className="payment-list">{data.recentPayments.map((payment) => { const status = paymentStatus(payment.status); return <div className="payment-row" key={payment.id}><div className="payment-icon"><ReceiptText size={17} /></div><div className="payment-main"><strong>{payment.bill?.name || 'Pembayaran kas'}</strong><span>{formatDate(payment.createdAt)} · {payment.method.replaceAll('_', ' ')}</span></div><div className="payment-amount"><strong>{formatCurrency(payment.amount)}</strong><span className={`mini-status ${status.className}`}>{status.label}</span></div></div> })}</div><div style={{ padding: '1rem', borderTop: '1px solid var(--color-border)' }}><Link href="/dashboard/bills/history" style={{ color: 'var(--color-primary)', fontSize: '0.875rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>Lihat Semua Riwayat <ChevronRight size={15} /></Link></div></> : <div className="empty-panel"><CreditCard size={24} /><p>Belum ada riwayat pembayaran.</p></div>}</article>
          <article className="dashboard-panel"><div className="panel-heading"><div><h2>Pengumuman kelas</h2><p>Informasi dari pengurus</p></div><Bell size={19} /></div>{data.announcements.length ? <div className="announcement-list">{data.announcements.map((announcement) => <article className="announcement-item" key={announcement.id}><div><h3>{announcement.title}</h3><p>{announcement.content}</p></div><time>{formatDate(announcement.createdAt, 'dd MMM')}</time></article>)}</div> : <div className="empty-panel"><Bell size={24} /><p>Belum ada pengumuman baru.</p></div>}</article>
        </section>
      </div>
    </main>
  )
}

// Funding Targets Widget for Students
function FundingTargetsStudentWidget() {
  const [targets, setTargets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFundingTargets()
  }, [])

  const fetchFundingTargets = async () => {
    try {
      const res = await fetch('/api/funding-targets')
      if (res.ok) {
        const data = await res.json()
        // Show top 2 active targets
        const activeTargets = data.targets.filter((t: any) => t.status === 'ACTIVE').slice(0, 2)
        setTargets(activeTargets)
      }
    } catch (error) {
      console.error('Failed to fetch funding targets:', error)
    } finally {
      setLoading(false)
    }
  }

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return '#22c55e'
    if (percentage >= 75) return '#3b82f6'
    if (percentage >= 50) return '#f59e0b'
    return '#6b7280'
  }

  if (loading) {
    return (
      <article className="dashboard-panel">
        <div className="panel-heading">
          <div>
            <h2>🎯 Target Urunan Aktif</h2>
            <p>Kontribusi untuk target kelas</p>
          </div>
        </div>
        <div style={{ padding: '1.5rem' }}>
          <div style={{ height: '100px', background: 'var(--color-border)', borderRadius: '8px', animation: 'pulse 2s infinite' }}></div>
        </div>
      </article>
    )
  }

  if (targets.length === 0) {
    return (
      <Link 
        href="/dashboard/funding-targets" 
        className="dashboard-panel" 
        style={{ 
          cursor: 'pointer', 
          transition: 'all 0.2s',
          textDecoration: 'none',
          color: 'inherit',
          display: 'block'
        }}
      >
        <div className="panel-heading">
          <div>
            <h2>🎯 Target Urunan Kelas</h2>
            <p>Lihat dan berkontribusi untuk target urunan kelas</p>
          </div>
          <ChevronRight size={24} />
        </div>
        <div style={{ padding: '1.5rem', textAlign: 'center' }}>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
            Klik untuk melihat target urunan yang sedang berlangsung
          </p>
        </div>
      </Link>
    )
  }

  return (
    <article className="dashboard-panel">
      <div className="panel-heading">
        <div>
          <h2>🎯 Target Urunan Aktif</h2>
          <p>Kontribusi untuk target kelas</p>
        </div>
        <Link href="/dashboard/funding-targets" style={{ color: 'var(--color-primary)', fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          Lihat Semua <ChevronRight size={15} />
        </Link>
      </div>
      <div style={{ padding: '1rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {targets.map((target) => {
            const progress = target.progressPercentage || 0
            const myTotal = target.myContributions?.reduce((sum: number, c: any) => sum + (c.status === 'VERIFIED' ? c.amount : 0), 0) || 0

            return (
              <Link
                key={target.id}
                href={`/dashboard/funding-targets/${target.id}`}
                style={{
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px',
                  padding: '1rem',
                  textDecoration: 'none',
                  color: 'inherit',
                  display: 'block',
                  transition: 'all 0.2s',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-primary)'
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-border)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                <div style={{ marginBottom: '0.75rem' }}>
                  <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: '0.25rem', color: 'var(--color-text)' }}>
                    {target.title}
                  </h3>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {target.description}
                  </p>
                </div>

                <div style={{ marginBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', fontSize: '0.8125rem' }}>
                    <span style={{ color: 'var(--color-text-secondary)' }}>
                      {formatCurrency(target.currentAmount)} / {formatCurrency(target.targetAmount)}
                    </span>
                    <span style={{ fontWeight: 700, color: 'var(--color-text)' }}>{progress}%</span>
                  </div>
                  <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--color-border)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${progress}%`,
                        height: '100%',
                        backgroundColor: getProgressColor(progress),
                        transition: 'width 0.3s ease'
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                  <span>{target.contributorsCount} kontributor</span>
                  {myTotal > 0 && (
                    <span style={{ color: 'var(--color-success)', fontWeight: 600 }}>
                      Anda: {formatCurrency(myTotal)}
                    </span>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </article>
  )
}
