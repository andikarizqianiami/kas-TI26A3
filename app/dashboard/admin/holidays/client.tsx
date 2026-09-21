'use client'

import { useState, useEffect } from 'react'
import { Calendar, Plus, Trash2, Edit2, AlertCircle } from 'lucide-react'

type Holiday = {
  id: string
  date: string
  name: string
  description?: string
  isRecurring: boolean
}

export default function HolidaysClient() {
  const [holidays, setHolidays] = useState<Holiday[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    date: '',
    name: '',
    description: '',
    isRecurring: false
  })

  useEffect(() => {
    fetchHolidays()
  }, [])

  async function fetchHolidays() {
    try {
      const res = await fetch('/api/admin/holidays')
      const data = await res.json()
      setHolidays(data.holidays || [])
    } catch (error) {
      console.error('Failed to fetch holidays:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      const res = await fetch('/api/admin/holidays', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })

      if (res.ok) {
        alert('Hari libur berhasil ditambahkan!')
        setShowForm(false)
        setForm({ date: '', name: '', description: '', isRecurring: false })
        fetchHolidays()
      } else {
        const error = await res.json()
        alert(`Error: ${error.error}`)
      }
    } catch (error) {
      alert('Gagal menambahkan hari libur')
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Hapus hari libur "${name}"?`)) return

    try {
      const res = await fetch(`/api/admin/holidays/${id}`, { method: 'DELETE' })
      if (res.ok) {
        alert('Hari libur berhasil dihapus!')
        fetchHolidays()
      }
    } catch (error) {
      alert('Gagal menghapus hari libur')
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div>
          <h1><Calendar size={28} /> Kelola Hari Libur</h1>
          <p>Atur tanggal merah dan hari libur untuk penjadwalan kas otomatis</p>
        </div>
        <button
          className="button button-primary"
          onClick={() => setShowForm(!showForm)}
        >
          <Plus size={18} />
          {showForm ? 'Batal' : 'Tambah Hari Libur'}
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h3>Tambah Hari Libur Baru</h3>
          <form onSubmit={handleSubmit} style={{ marginTop: '1rem' }}>
            <div className="form-row">
              <label>
                Tanggal Libur *
                <input
                  type="date"
                  className="input"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  required
                />
              </label>
              <label>
                Nama Hari Libur *
                <input
                  type="text"
                  className="input"
                  placeholder="Contoh: Hari Kemerdekaan RI"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </label>
            </div>
            <label>
              Keterangan (opsional)
              <input
                type="text"
                className="input"
                placeholder="Keterangan tambahan"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="checkbox"
                checked={form.isRecurring}
                onChange={(e) => setForm({ ...form, isRecurring: e.target.checked })}
              />
              <span>Berulang setiap tahun (contoh: Tahun Baru, Hari Raya)</span>
            </label>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
              <button type="submit" className="button button-primary">
                Simpan Hari Libur
              </button>
              <button
                type="button"
                className="button"
                onClick={() => {
                  setShowForm(false)
                  setForm({ date: '', name: '', description: '', isRecurring: false })
                }}
              >
                Batal
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        {loading ? (
          <p>Memuat data...</p>
        ) : holidays.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
            <AlertCircle size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
            <p>Belum ada hari libur terdaftar.</p>
            <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
              Tambahkan hari libur agar sistem bisa menyesuaikan jadwal kas otomatis.
            </p>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Tanggal</th>
                  <th>Nama Hari Libur</th>
                  <th>Keterangan</th>
                  <th>Berulang</th>
                  <th style={{ width: '120px' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {holidays.map((holiday) => (
                  <tr key={holiday.id}>
                    <td>{formatDate(holiday.date)}</td>
                    <td><strong>{holiday.name}</strong></td>
                    <td>{holiday.description || '-'}</td>
                    <td>
                      {holiday.isRecurring ? (
                        <span className="badge badge-info">Ya</span>
                      ) : (
                        <span className="badge">Tidak</span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          className="button-icon"
                          title="Hapus"
                          onClick={() => handleDelete(holiday.id, holiday.name)}
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
  )
}
