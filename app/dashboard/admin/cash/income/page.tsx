'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Plus, TrendingUp, Edit2, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { formatCurrency, formatDate } from '@/lib/utils/format'

interface Income {
  id: string
  amount: number
  description: string
  category: string
  date: string
  createdAt: string
}

export default function IncomeManagementPage() {
  const [incomes, setIncomes] = useState<Income[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Form state
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('KAS_MINGGUAN')
  const [date, setDate] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    fetchIncomes()
    setDate(new Date().toISOString().split('T')[0])
  }, [])

  const fetchIncomes = async () => {
    try {
      const res = await fetch('/api/admin/cash/income')
      if (res.ok) {
        const data = await res.json()
        setIncomes(data.incomes || [])
      }
    } catch (err) {
      console.error('Failed to fetch incomes')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setAmount('')
    setDescription('')
    setCategory('KAS_MINGGUAN')
    setDate(new Date().toISOString().split('T')[0])
    setEditingId(null)
    setShowForm(false)
    setError('')
    setSuccess('')
  }

  const handleEdit = (income: Income) => {
    setEditingId(income.id)
    setAmount(income.amount.toString())
    setDescription(income.description)
    setCategory(income.category)
    setDate(new Date(income.date).toISOString().split('T')[0])
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus pemasukan ini?')) return

    try {
      const res = await fetch(`/api/admin/cash/income/${id}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        setSuccess('Pemasukan berhasil dihapus')
        fetchIncomes()
        setTimeout(() => setSuccess(''), 3000)
      } else {
        const data = await res.json()
        setError(data.error || 'Gagal menghapus pemasukan')
      }
    } catch (err) {
      setError('Terjadi kesalahan')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!amount || parseInt(amount) <= 0) {
      setError('Jumlah harus lebih dari 0')
      return
    }

    setSubmitting(true)

    try {
      const url = editingId 
        ? `/api/admin/cash/income/${editingId}`
        : '/api/admin/cash/income'

      const res = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseInt(amount),
          description,
          category,
          date: new Date(date)
        })
      })

      const data = await res.json()

      if (res.ok) {
        setSuccess(data.message || (editingId ? 'Pemasukan berhasil diupdate' : 'Pemasukan berhasil ditambahkan'))
        resetForm()
        fetchIncomes()
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError(data.error || 'Gagal menyimpan pemasukan')
      }
    } catch (err) {
      setError('Terjadi kesalahan')
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
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link 
            href="/dashboard/admin/cash" 
            className="inline-flex items-center gap-2 mb-4" 
            style={{ color: 'var(--color-primary)', fontSize: '0.875rem' }}
          >
            <ArrowLeft size={16} /> Kembali ke Pengelolaan Kas
          </Link>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold" style={{ color: 'var(--color-text)' }}>
                Kelola Pemasukan
              </h1>
              <p style={{ color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>
                Catat semua pemasukan kas kelas
              </p>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <Plus size={18} /> {showForm ? 'Tutup Form' : 'Tambah Pemasukan'}
            </button>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div style={{ padding: '1rem', marginBottom: '1.5rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', borderRadius: '0.5rem', color: '#ef4444' }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{ padding: '1rem', marginBottom: '1.5rem', background: 'rgba(34, 197, 94, 0.1)', border: '1px solid #22c55e', borderRadius: '0.5rem', color: '#22c55e' }}>
            {success}
          </div>
        )}

        {/* Form */}
        {showForm && (
          <form onSubmit={handleSubmit} className="surface mb-6" style={{ padding: '1.5rem' }}>
            <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--color-text)' }}>
              {editingId ? 'Edit Pemasukan' : 'Tambah Pemasukan Baru'}
            </h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', color: 'var(--color-text)', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                  Jumlah (Rp) *
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  min="0"
                  step="1000"
                  style={{ width: '100%', padding: '0.75rem', background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: '0.5rem', color: 'var(--color-text)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', color: 'var(--color-text)', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                  Tanggal *
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  style={{ width: '100%', padding: '0.75rem', background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: '0.5rem', color: 'var(--color-text)' }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', color: 'var(--color-text)', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                Kategori *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
                style={{ width: '100%', padding: '0.75rem', background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: '0.5rem', color: 'var(--color-text)' }}
              >
                <option value="KAS_MINGGUAN">Kas Mingguan</option>
                <option value="DONASI">Donasi</option>
                <option value="KEGIATAN">Kegiatan</option>
                <option value="LAINNYA">Lainnya</option>
              </select>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', color: 'var(--color-text)', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                Deskripsi *
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={3}
                placeholder="Detail pemasukan"
                style={{ width: '100%', padding: '0.75rem', background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: '0.5rem', color: 'var(--color-text)', resize: 'vertical' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={resetForm}
                className="btn-secondary"
                disabled={submitting}
              >
                Batal
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={submitting}
              >
                {submitting ? 'Menyimpan...' : (editingId ? 'Update' : 'Simpan')}
              </button>
            </div>
          </form>
        )}

        {/* Income List */}
        <div className="surface" style={{ padding: '1.5rem' }}>
          <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--color-text)' }}>
            Daftar Pemasukan ({incomes.length})
          </h2>

          {incomes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
              <TrendingUp size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
              <p>Belum ada data pemasukan</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <th className="text-left p-3" style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', fontWeight: 600 }}>Tanggal</th>
                    <th className="text-left p-3" style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', fontWeight: 600 }}>Deskripsi</th>
                    <th className="text-left p-3" style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', fontWeight: 600 }}>Kategori</th>
                    <th className="text-right p-3" style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', fontWeight: 600 }}>Jumlah</th>
                    <th className="text-center p-3" style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', fontWeight: 600 }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {incomes.map((income) => (
                    <tr key={income.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                      <td className="p-3" style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                        {formatDate(income.date, 'dd MMM yyyy')}
                      </td>
                      <td className="p-3" style={{ color: 'var(--color-text)' }}>
                        {income.description}
                      </td>
                      <td className="p-3" style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                        {income.category.replace('_', ' ')}
                      </td>
                      <td className="p-3 text-right" style={{ color: '#22c55e', fontWeight: 600 }}>
                        +{formatCurrency(income.amount)}
                      </td>
                      <td className="p-3">
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                          <button
                            onClick={() => handleEdit(income)}
                            style={{ padding: '0.5rem', color: 'var(--color-primary)', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '0.375rem', border: 'none', cursor: 'pointer' }}
                            title="Edit"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(income.id)}
                            style={{ padding: '0.5rem', color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '0.375rem', border: 'none', cursor: 'pointer' }}
                            title="Hapus"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
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
