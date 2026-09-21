'use client'

import { useState, useEffect } from 'react'
import { Calendar, Plus, Edit2, Trash2, AlertCircle, CheckCircle } from 'lucide-react'

type Schedule = {
  id: string
  weekStartDate: string
  weekEndDate: string
  billDay: string
  billDate: string
  amount: number
  isGenerated: boolean
  notes?: string
  createdAt: string
}

const DAYS = [
  { value: 'MONDAY', label: 'Senin' },
  { value: 'TUESDAY', label: 'Selasa' },
  { value: 'WEDNESDAY', label: 'Rabu' },
  { value: 'THURSDAY', label: 'Kamis' },
  { value: 'FRIDAY', label: 'Jumat' },
  { value: 'SATURDAY', label: 'Sabtu' },
  { value: 'SUNDAY', label: 'Minggu' }
]

export default function ScheduleClient() {
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    weekStartDate: '',
    weekEndDate: '',
    billDay: 'WEDNESDAY',
    amount: 5000,
    notes: ''
  })

  useEffect(() => {
    fetchSchedules()
  }, [])

  async function fetchSchedules() {
    try {
      const res = await fetch('/api/admin/bill-schedule')
      const data = await res.json()
      setSchedules(data.schedules || [])
    } catch (error) {
      console.error('Failed to fetch schedules:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      const res = await fetch('/api/admin/bill-schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })

      if (res.ok) {
        alert('Jadwal kas berhasil ditambahkan!')
        setShowForm(false)
        setForm({
          weekStartDate: '',
          weekEndDate: '',
          billDay: 'WEDNESDAY',
          amount: 5000,
          notes: ''
        })
        fetchSchedules()
      } else {
        const error = await res.json()
        alert(`Error: ${error.error}`)
      }
    } catch (error) {
      alert('Gagal menambahkan jadwal kas')
    }
  }

  function autoFillWeekDates(startDate: string) {
    if (!startDate) return
    
    const start = new Date(startDate)
    const end = new Date(start)
    end.setDate(end.getDate() + 6) // 7 hari dari start
    
    setForm({
      ...form,
      weekStartDate: startDate,
      weekEndDate: end.toISOString().split('T')[0]
    })
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getDayLabel = (dayValue: string) => {
    return DAYS.find(d => d.value === dayValue)?.label || dayValue
  }

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div>
          <h1><Calendar size={28} /> Jadwal Kas Mingguan</h1>
          <p>Atur hari dan tanggal pembayaran kas untuk setiap minggu</p>
        </div>
        <button
          className="button button-primary"
          onClick={() => setShowForm(!showForm)}
        >
          <Plus size={18} />
          {showForm ? 'Batal' : 'Tambah Jadwal'}
        </button>
      </div>

      {/* Quick Access Menu */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1.5rem' }}>Menu Cepat</h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem'
        }}>
          <a href="/dashboard/admin/students" style={{ textDecoration: 'none' }}>
            <div style={{
              padding: '1.5rem',
              border: '2px solid #e0e0e0',
              borderRadius: '8px',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s',
              background: '#fff'
            }} onMouseOver={(e) => {
              e.currentTarget.style.borderColor = '#3b82f6'
              e.currentTarget.style.background = '#eff6ff'
            }} onMouseOut={(e) => {
              e.currentTarget.style.borderColor = '#e0e0e0'
              e.currentTarget.style.background = '#fff'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>👥</div>
              <div style={{ fontWeight: '600', color: '#1e293b' }}>Manajemen Mahasiswa</div>
            </div>
          </a>

          <a href="/dashboard/admin/bills" style={{ textDecoration: 'none' }}>
            <div style={{
              padding: '1.5rem',
              border: '2px solid #e0e0e0',
              borderRadius: '8px',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s',
              background: '#fff'
            }} onMouseOver={(e) => {
              e.currentTarget.style.borderColor = '#3b82f6'
              e.currentTarget.style.background = '#eff6ff'
            }} onMouseOut={(e) => {
              e.currentTarget.style.borderColor = '#e0e0e0'
              e.currentTarget.style.background = '#fff'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📄</div>
              <div style={{ fontWeight: '600', color: '#1e293b' }}>Manajemen Tagihan</div>
            </div>
          </a>

          <a href="/dashboard/admin/payments" style={{ textDecoration: 'none' }}>
            <div style={{
              padding: '1.5rem',
              border: '2px solid #e0e0e0',
              borderRadius: '8px',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s',
              background: '#fff'
            }} onMouseOver={(e) => {
              e.currentTarget.style.borderColor = '#3b82f6'
              e.currentTarget.style.background = '#eff6ff'
            }} onMouseOut={(e) => {
              e.currentTarget.style.borderColor = '#e0e0e0'
              e.currentTarget.style.background = '#fff'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💵</div>
              <div style={{ fontWeight: '600', color: '#1e293b' }}>Verifikasi Pembayaran</div>
            </div>
          </a>

          <a href="/dashboard/admin/cash" style={{ textDecoration: 'none' }}>
            <div style={{
              padding: '1.5rem',
              border: '2px solid #e0e0e0',
              borderRadius: '8px',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s',
              background: '#fff'
            }} onMouseOver={(e) => {
              e.currentTarget.style.borderColor = '#3b82f6'
              e.currentTarget.style.background = '#eff6ff'
            }} onMouseOut={(e) => {
              e.currentTarget.style.borderColor = '#e0e0e0'
              e.currentTarget.style.background = '#fff'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📊</div>
              <div style={{ fontWeight: '600', color: '#1e293b' }}>Pengelolaan Kas</div>
            </div>
          </a>

          <a href="/dashboard/admin/reports" style={{ textDecoration: 'none' }}>
            <div style={{
              padding: '1.5rem',
              border: '2px solid #e0e0e0',
              borderRadius: '8px',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s',
              background: '#fff'
            }} onMouseOver={(e) => {
              e.currentTarget.style.borderColor = '#3b82f6'
              e.currentTarget.style.background = '#eff6ff'
            }} onMouseOut={(e) => {
              e.currentTarget.style.borderColor = '#e0e0e0'
              e.currentTarget.style.background = '#fff'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📈</div>
              <div style={{ fontWeight: '600', color: '#1e293b' }}>Laporan</div>
            </div>
          </a>

          <a href="/dashboard/admin/announcements" style={{ textDecoration: 'none' }}>
            <div style={{
              padding: '1.5rem',
              border: '2px solid #e0e0e0',
              borderRadius: '8px',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s',
              background: '#fff'
            }} onMouseOver={(e) => {
              e.currentTarget.style.borderColor = '#3b82f6'
              e.currentTarget.style.background = '#eff6ff'
            }} onMouseOut={(e) => {
              e.currentTarget.style.borderColor = '#e0e0e0'
              e.currentTarget.style.background = '#fff'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📢</div>
              <div style={{ fontWeight: '600', color: '#1e293b' }}>Pengumuman</div>
            </div>
          </a>

          <a href="/dashboard/admin/settings" style={{ textDecoration: 'none' }}>
            <div style={{
              padding: '1.5rem',
              border: '2px solid #e0e0e0',
              borderRadius: '8px',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s',
              background: '#fff'
            }} onMouseOver={(e) => {
              e.currentTarget.style.borderColor = '#3b82f6'
              e.currentTarget.style.background = '#eff6ff'
            }} onMouseOut={(e) => {
              e.currentTarget.style.borderColor = '#e0e0e0'
              e.currentTarget.style.background = '#fff'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⚙️</div>
              <div style={{ fontWeight: '600', color: '#1e293b' }}>Pengaturan</div>
            </div>
          </a>

          <a href="/dashboard" style={{ textDecoration: 'none' }}>
            <div style={{
              padding: '1.5rem',
              border: '2px solid #e0e0e0',
              borderRadius: '8px',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s',
              background: '#fff'
            }} onMouseOver={(e) => {
              e.currentTarget.style.borderColor = '#3b82f6'
              e.currentTarget.style.background = '#eff6ff'
            }} onMouseOut={(e) => {
              e.currentTarget.style.borderColor = '#e0e0e0'
              e.currentTarget.style.background = '#fff'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🏠</div>
              <div style={{ fontWeight: '600', color: '#1e293b' }}>Dashboard</div>
            </div>
          </a>
        </div>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h3>Tambah Jadwal Kas Baru</h3>
          <form onSubmit={handleSubmit} style={{ marginTop: '1rem' }}>
            <div className="form-row">
              <label>
                Tanggal Mulai Minggu *
                <input
                  type="date"
                  className="input"
                  value={form.weekStartDate}
                  onChange={(e) => autoFillWeekDates(e.target.value)}
                  required
                />
                <small style={{ color: '#666' }}>Pilih hari Senin untuk mulai minggu</small>
              </label>
              <label>
                Tanggal Akhir Minggu *
                <input
                  type="date"
                  className="input"
                  value={form.weekEndDate}
                  onChange={(e) => setForm({ ...form, weekEndDate: e.target.value })}
                  required
                />
                <small style={{ color: '#666' }}>Otomatis terisi (Minggu)</small>
              </label>
            </div>

            <div className="form-row">
              <label>
                Hari Pembayaran *
                <select
                  className="input"
                  value={form.billDay}
                  onChange={(e) => setForm({ ...form, billDay: e.target.value })}
                  required
                >
                  {DAYS.map(day => (
                    <option key={day.value} value={day.value}>
                      {day.label}
                    </option>
                  ))}
                </select>
                <small style={{ color: '#666' }}>Pilih hari deadline pembayaran</small>
              </label>

              <label>
                Nominal Kas (Rp) *
                <input
                  type="number"
                  className="input"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: parseInt(e.target.value) })}
                  min="1000"
                  step="1000"
                  required
                />
                <small style={{ color: '#666' }}>Default: Rp 5.000</small>
              </label>
            </div>

            <label>
              Catatan (opsional)
              <input
                type="text"
                className="input"
                placeholder="Contoh: Minggu UTS, kas dikurangi"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </label>

            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
              <button type="submit" className="button button-primary">
                Simpan Jadwal
              </button>
              <button
                type="button"
                className="button"
                onClick={() => {
                  setShowForm(false)
                  setForm({
                    weekStartDate: '',
                    weekEndDate: '',
                    billDay: 'WEDNESDAY',
                    amount: 5000,
                    notes: ''
                  })
                }}
              >
                Batal
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <h3>Daftar Jadwal Kas</h3>
        {loading ? (
          <p>Memuat data...</p>
        ) : schedules.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
            <AlertCircle size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
            <p>Belum ada jadwal kas terdaftar.</p>
            <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
              Tambahkan jadwal untuk mengatur hari pembayaran kas per minggu.
            </p>
          </div>
        ) : (
          <div className="table-container" style={{ marginTop: '1rem' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Periode Minggu</th>
                  <th>Hari Pembayaran</th>
                  <th>Tanggal Deadline</th>
                  <th>Nominal</th>
                  <th>Status</th>
                  <th>Catatan</th>
                </tr>
              </thead>
              <tbody>
                {schedules.map((schedule) => (
                  <tr key={schedule.id}>
                    <td>
                      <div style={{ fontSize: '0.9rem' }}>
                        <div><strong>{formatDate(schedule.weekStartDate)}</strong></div>
                        <div style={{ color: '#666' }}>s/d {formatDate(schedule.weekEndDate)}</div>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-info">
                        {getDayLabel(schedule.billDay)}
                      </span>
                    </td>
                    <td>
                      <strong>{formatDate(schedule.billDate)}</strong>
                    </td>
                    <td>
                      <strong>Rp {schedule.amount.toLocaleString('id-ID')}</strong>
                    </td>
                    <td>
                      {schedule.isGenerated ? (
                        <span className="badge badge-success">
                          <CheckCircle size={14} /> Sudah Generate
                        </span>
                      ) : (
                        <span className="badge badge-warning">
                          Belum Generate
                        </span>
                      )}
                    </td>
                    <td style={{ fontSize: '0.9rem', color: '#666' }}>
                      {schedule.notes || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="card" style={{ marginTop: '2rem', background: '#f8f9fa' }}>
        <h4 style={{ marginBottom: '1rem' }}>💡 Cara Menggunakan</h4>
        <ol style={{ lineHeight: '1.8', color: '#666' }}>
          <li>Klik <strong>"Tambah Jadwal"</strong> untuk membuat jadwal baru</li>
          <li>Pilih <strong>tanggal mulai minggu</strong> (biasanya hari Senin)</li>
          <li>Tanggal akhir akan otomatis terisi (7 hari dari tanggal mulai)</li>
          <li>Pilih <strong>hari pembayaran</strong> yang diinginkan (Senin-Minggu)</li>
          <li>Atur nominal kas sesuai kebutuhan</li>
          <li>Sistem akan otomatis menghitung tanggal deadline</li>
          <li>Setelah generate bill, status akan berubah menjadi "Sudah Generate"</li>
        </ol>
      </div>
    </div>
  )
}
