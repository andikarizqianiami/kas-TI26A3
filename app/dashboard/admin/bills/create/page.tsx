'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Plus, Users, User } from 'lucide-react'
import Link from 'next/link'

interface Student {
  id: string
  nim: string
  name: string
}

export default function CreateBillPage() {
  const router = useRouter()
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  
  // Form state
  const [billType, setBillType] = useState<'individual' | 'mass'>('mass')
  const [selectedStudentId, setSelectedStudentId] = useState('')
  const [billName, setBillName] = useState('Kas Mingguan')
  const [description, setDescription] = useState('Iuran kas mingguan TI26A3')
  const [amount, setAmount] = useState('5000')
  const [weekPeriod, setWeekPeriod] = useState('')
  const [weekStartDate, setWeekStartDate] = useState('')
  const [deadline, setDeadline] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    fetchStudents()
    setDefaultDates()
  }, [])

  const fetchStudents = async () => {
    try {
      const res = await fetch('/api/admin/students')
      if (res.ok) {
        const data = await res.json()
        setStudents(data.students || [])
      }
    } catch (err) {
      console.error('Failed to fetch students')
    } finally {
      setLoading(false)
    }
  }

  const setDefaultDates = () => {
    const now = new Date()
    const year = now.getFullYear()
    const week = getWeekNumber(now)
    
    // Set week period (e.g., 2026-W38)
    setWeekPeriod(`${year}-W${week.toString().padStart(2, '0')}`)
    
    // Set week start date (today)
    setWeekStartDate(now.toISOString().split('T')[0])
    
    // Set deadline (7 days from now)
    const deadlineDate = new Date(now)
    deadlineDate.setDate(deadlineDate.getDate() + 7)
    setDeadline(deadlineDate.toISOString().split('T')[0])
  }

  const getWeekNumber = (date: Date) => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1)
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    // Validation
    if (!billName.trim()) {
      setError('Nama tagihan harus diisi')
      return
    }
    if (!amount || parseInt(amount) <= 0) {
      setError('Jumlah harus lebih dari 0')
      return
    }
    if (!weekPeriod) {
      setError('Periode minggu harus diisi')
      return
    }
    if (!weekStartDate || !deadline) {
      setError('Tanggal harus diisi')
      return
    }
    if (billType === 'individual' && !selectedStudentId) {
      setError('Pilih mahasiswa terlebih dahulu')
      return
    }

    setSubmitting(true)

    try {
      const res = await fetch('/api/admin/bills/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: billType,
          studentId: billType === 'individual' ? selectedStudentId : undefined,
          name: billName,
          description,
          amount: parseInt(amount),
          weekPeriod,
          weekStartDate: new Date(weekStartDate),
          deadline: new Date(deadline)
        })
      })

      const data = await res.json()

      if (res.ok) {
        setSuccess(data.message || 'Tagihan berhasil dibuat!')
        setTimeout(() => {
          router.push('/dashboard/admin/bills')
        }, 1500)
      } else {
        setError(data.error || 'Gagal membuat tagihan')
      }
    } catch (err) {
      setError('Terjadi kesalahan. Silakan coba lagi.')
    } finally {
      setSubmitting(false)
    }
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
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link 
            href="/dashboard/admin/bills" 
            className="inline-flex items-center gap-2 mb-4" 
            style={{ color: 'var(--color-primary)', fontSize: '0.875rem' }}
          >
            <ArrowLeft size={16} /> Kembali ke Manajemen Tagihan
          </Link>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--color-text)' }}>
            Buat Tagihan Baru
          </h1>
          <p style={{ color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>
            Buat tagihan untuk individu atau semua mahasiswa sekaligus
          </p>
        </div>

        {/* Messages */}
        {error && (
          <div style={{ 
            padding: '1rem', 
            marginBottom: '1.5rem', 
            background: 'rgba(239, 68, 68, 0.1)', 
            border: '1px solid #ef4444',
            borderRadius: '0.5rem',
            color: '#ef4444'
          }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{ 
            padding: '1rem', 
            marginBottom: '1.5rem', 
            background: 'rgba(34, 197, 94, 0.1)', 
            border: '1px solid #22c55e',
            borderRadius: '0.5rem',
            color: '#22c55e'
          }}>
            {success}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="surface" style={{ padding: '2rem' }}>
          {/* Bill Type Selection */}
          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', color: 'var(--color-text)', fontWeight: 600, marginBottom: '1rem' }}>
              Tipe Tagihan
            </label>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                type="button"
                onClick={() => setBillType('mass')}
                style={{
                  flex: 1,
                  padding: '1.5rem',
                  border: billType === 'mass' ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                  borderRadius: '0.5rem',
                  background: billType === 'mass' ? 'rgba(59, 130, 246, 0.1)' : 'var(--color-bg)',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <Users size={32} style={{ color: billType === 'mass' ? 'var(--color-primary)' : 'var(--color-text-muted)' }} />
                <span style={{ color: 'var(--color-text)', fontWeight: 600 }}>Semua Mahasiswa</span>
                <span style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                  Buat tagihan untuk {students.length} mahasiswa
                </span>
              </button>

              <button
                type="button"
                onClick={() => setBillType('individual')}
                style={{
                  flex: 1,
                  padding: '1.5rem',
                  border: billType === 'individual' ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                  borderRadius: '0.5rem',
                  background: billType === 'individual' ? 'rgba(59, 130, 246, 0.1)' : 'var(--color-bg)',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <User size={32} style={{ color: billType === 'individual' ? 'var(--color-primary)' : 'var(--color-text-muted)' }} />
                <span style={{ color: 'var(--color-text)', fontWeight: 600 }}>Individual</span>
                <span style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                  Buat untuk satu mahasiswa
                </span>
              </button>
            </div>
          </div>

          {/* Student Selection (Individual only) */}
          {billType === 'individual' && (
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', color: 'var(--color-text)', fontWeight: 600, marginBottom: '0.5rem' }}>
                Pilih Mahasiswa
              </label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                required={billType === 'individual'}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: 'var(--color-bg)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '0.5rem',
                  color: 'var(--color-text)',
                  fontSize: '0.875rem'
                }}
              >
                <option value="">-- Pilih Mahasiswa --</option>
                {students.map(student => (
                  <option key={student.id} value={student.id}>
                    {student.nim} - {student.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Bill Name */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', color: 'var(--color-text)', fontWeight: 600, marginBottom: '0.5rem' }}>
              Nama Tagihan
            </label>
            <input
              type="text"
              value={billName}
              onChange={(e) => setBillName(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                background: 'var(--color-bg)',
                border: '1px solid var(--color-border)',
                borderRadius: '0.5rem',
                color: 'var(--color-text)'
              }}
            />
          </div>

          {/* Description */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', color: 'var(--color-text)', fontWeight: 600, marginBottom: '0.5rem' }}>
              Deskripsi
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              style={{
                width: '100%',
                padding: '0.75rem',
                background: 'var(--color-bg)',
                border: '1px solid var(--color-border)',
                borderRadius: '0.5rem',
                color: 'var(--color-text)',
                resize: 'vertical'
              }}
            />
          </div>

          {/* Amount */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', color: 'var(--color-text)', fontWeight: 600, marginBottom: '0.5rem' }}>
              Jumlah (Rp)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              min="0"
              step="1000"
              style={{
                width: '100%',
                padding: '0.75rem',
                background: 'var(--color-bg)',
                border: '1px solid var(--color-border)',
                borderRadius: '0.5rem',
                color: 'var(--color-text)'
              }}
            />
          </div>

          {/* Week Period, Start Date, Deadline in Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', color: 'var(--color-text)', fontWeight: 600, marginBottom: '0.5rem' }}>
                Periode Minggu
              </label>
              <input
                type="text"
                value={weekPeriod}
                onChange={(e) => setWeekPeriod(e.target.value)}
                required
                placeholder="2026-W38"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: 'var(--color-bg)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '0.5rem',
                  color: 'var(--color-text)'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', color: 'var(--color-text)', fontWeight: 600, marginBottom: '0.5rem' }}>
                Tanggal Mulai
              </label>
              <input
                type="date"
                value={weekStartDate}
                onChange={(e) => setWeekStartDate(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: 'var(--color-bg)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '0.5rem',
                  color: 'var(--color-text)'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', color: 'var(--color-text)', fontWeight: 600, marginBottom: '0.5rem' }}>
                Batas Pembayaran
              </label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: 'var(--color-bg)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '0.5rem',
                  color: 'var(--color-text)'
                }}
              />
            </div>
          </div>

          {/* Submit Button */}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <Link href="/dashboard/admin/bills">
              <button
                type="button"
                className="btn-secondary"
                disabled={submitting}
              >
                Batal
              </button>
            </Link>
            <button
              type="submit"
              className="btn-primary"
              disabled={submitting}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              {submitting ? 'Memproses...' : (
                <>
                  <Plus size={18} />
                  Buat Tagihan
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
