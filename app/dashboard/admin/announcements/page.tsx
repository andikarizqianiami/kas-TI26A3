'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Plus, Bell, Edit2, Trash2, Eye, EyeOff, AlertCircle, AlertTriangle, Info } from 'lucide-react'
import Link from 'next/link'
import { formatDateTime } from '@/lib/utils/format'

interface Announcement {
  id: string
  title: string
  content: string
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'
  isActive: boolean
  createdAt: string
  updatedAt: string
}

const PRIORITY_COLORS = {
  LOW: { bg: 'rgba(156, 163, 175, 0.1)', text: '#9ca3af', icon: Info },
  NORMAL: { bg: 'rgba(59, 130, 246, 0.1)', text: '#3b82f6', icon: Info },
  HIGH: { bg: 'rgba(251, 146, 60, 0.1)', text: '#fb923c', icon: AlertCircle },
  URGENT: { bg: 'rgba(239, 68, 68, 0.1)', text: '#ef4444', icon: AlertTriangle }
}

const PRIORITY_LABELS = {
  LOW: 'Rendah',
  NORMAL: 'Normal',
  HIGH: 'Tinggi',
  URGENT: 'Urgent'
}

export default function AnnouncementsManagementPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Form state
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [priority, setPriority] = useState<'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'>('NORMAL')
  const [isActive, setIsActive] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    fetchAnnouncements()
  }, [])

  const fetchAnnouncements = async () => {
    try {
      const res = await fetch('/api/admin/announcements')
      if (res.ok) {
        const data = await res.json()
        setAnnouncements(data.announcements || [])
      }
    } catch (err) {
      console.error('Failed to fetch announcements')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setTitle('')
    setContent('')
    setPriority('NORMAL')
    setIsActive(true)
    setEditingId(null)
    setShowForm(false)
    setError('')
    setSuccess('')
  }

  const handleEdit = (announcement: Announcement) => {
    setEditingId(announcement.id)
    setTitle(announcement.title)
    setContent(announcement.content)
    setPriority(announcement.priority)
    setIsActive(announcement.isActive)
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus pengumuman ini?')) return

    try {
      const res = await fetch(`/api/admin/announcements/${id}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        setSuccess('Pengumuman berhasil dihapus')
        fetchAnnouncements()
        setTimeout(() => setSuccess(''), 3000)
      } else {
        const data = await res.json()
        setError(data.error || 'Gagal menghapus pengumuman')
      }
    } catch (err) {
      setError('Terjadi kesalahan')
    }
  }

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const announcement = announcements.find(a => a.id === id)
      if (!announcement) return

      const res = await fetch(`/api/admin/announcements/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...announcement,
          isActive: !currentStatus
        })
      })

      if (res.ok) {
        setSuccess(`Pengumuman ${!currentStatus ? 'diaktifkan' : 'dinonaktifkan'}`)
        fetchAnnouncements()
        setTimeout(() => setSuccess(''), 3000)
      }
    } catch (err) {
      setError('Terjadi kesalahan')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!title.trim() || !content.trim()) {
      setError('Judul dan konten harus diisi')
      return
    }

    setSubmitting(true)

    try {
      const url = editingId 
        ? `/api/admin/announcements/${editingId}`
        : '/api/admin/announcements'

      const res = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          priority,
          isActive
        })
      })

      const data = await res.json()

      if (res.ok) {
        setSuccess(data.message || (editingId ? 'Pengumuman berhasil diupdate' : 'Pengumuman berhasil dibuat'))
        resetForm()
        fetchAnnouncements()
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError(data.error || 'Gagal menyimpan pengumuman')
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
            href="/dashboard" 
            className="inline-flex items-center gap-2 mb-4" 
            style={{ color: 'var(--color-primary)', fontSize: '0.875rem' }}
          >
            <ArrowLeft size={16} /> Kembali ke Dashboard
          </Link>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold" style={{ color: 'var(--color-text)' }}>
                Pengumuman Kelas
              </h1>
              <p style={{ color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>
                Kelola pengumuman untuk mahasiswa TI26A3
              </p>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <Plus size={18} /> {showForm ? 'Tutup Form' : 'Buat Pengumuman'}
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
              {editingId ? 'Edit Pengumuman' : 'Buat Pengumuman Baru'}
            </h2>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', color: 'var(--color-text)', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                Judul *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="Contoh: Pengumpulan Kas Minggu Ini"
                style={{ width: '100%', padding: '0.75rem', background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: '0.5rem', color: 'var(--color-text)' }}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', color: 'var(--color-text)', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                Konten *
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                rows={6}
                placeholder="Tulis pengumuman di sini..."
                style={{ width: '100%', padding: '0.75rem', background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: '0.5rem', color: 'var(--color-text)', resize: 'vertical' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', color: 'var(--color-text)', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                  Prioritas *
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  required
                  style={{ width: '100%', padding: '0.75rem', background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: '0.5rem', color: 'var(--color-text)' }}
                >
                  <option value="LOW">Rendah</option>
                  <option value="NORMAL">Normal</option>
                  <option value="HIGH">Tinggi</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', color: 'var(--color-text)', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                  Status
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    style={{ width: '1.25rem', height: '1.25rem' }}
                  />
                  <span style={{ color: 'var(--color-text)' }}>Aktif (terlihat oleh mahasiswa)</span>
                </label>
              </div>
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
                {submitting ? 'Menyimpan...' : (editingId ? 'Update' : 'Buat Pengumuman')}
              </button>
            </div>
          </form>
        )}

        {/* Announcements List */}
        <div className="surface" style={{ padding: '1.5rem' }}>
          <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--color-text)' }}>
            Daftar Pengumuman ({announcements.length})
          </h2>

          {announcements.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
              <Bell size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
              <p>Belum ada pengumuman</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {announcements.map((announcement) => {
                const priorityStyle = PRIORITY_COLORS[announcement.priority]
                const PriorityIcon = priorityStyle.icon

                return (
                  <div
                    key={announcement.id}
                    className="surface"
                    style={{ 
                      padding: '1.5rem', 
                      border: '1px solid var(--color-border)',
                      opacity: announcement.isActive ? 1 : 0.6
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                          <h3 className="text-lg font-semibold" style={{ color: 'var(--color-text)' }}>
                            {announcement.title}
                          </h3>
                          
                          <span 
                            style={{ 
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                              padding: '0.25rem 0.75rem', 
                              background: priorityStyle.bg, 
                              color: priorityStyle.text, 
                              borderRadius: '9999px', 
                              fontSize: '0.75rem',
                              fontWeight: 600
                            }}
                          >
                            <PriorityIcon size={12} />
                            {PRIORITY_LABELS[announcement.priority]}
                          </span>

                          {!announcement.isActive && (
                            <span style={{ 
                              padding: '0.25rem 0.75rem', 
                              background: 'rgba(156, 163, 175, 0.1)', 
                              color: '#9ca3af', 
                              borderRadius: '9999px', 
                              fontSize: '0.75rem',
                              fontWeight: 600
                            }}>
                              Nonaktif
                            </span>
                          )}
                        </div>

                        <p style={{ color: 'var(--color-text)', whiteSpace: 'pre-wrap', marginBottom: '0.75rem' }}>
                          {announcement.content}
                        </p>

                        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                          Dibuat: {formatDateTime(announcement.createdAt)}
                        </p>
                      </div>

                      <div style={{ display: 'flex', gap: '0.5rem', marginLeft: '1rem' }}>
                        <button
                          onClick={() => handleToggleActive(announcement.id, announcement.isActive)}
                          style={{ 
                            padding: '0.5rem', 
                            color: announcement.isActive ? '#9ca3af' : '#22c55e', 
                            background: announcement.isActive ? 'rgba(156, 163, 175, 0.1)' : 'rgba(34, 197, 94, 0.1)', 
                            borderRadius: '0.375rem', 
                            border: 'none', 
                            cursor: 'pointer' 
                          }}
                          title={announcement.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                        >
                          {announcement.isActive ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>

                        <button
                          onClick={() => handleEdit(announcement)}
                          style={{ 
                            padding: '0.5rem', 
                            color: 'var(--color-primary)', 
                            background: 'rgba(59, 130, 246, 0.1)', 
                            borderRadius: '0.375rem', 
                            border: 'none', 
                            cursor: 'pointer' 
                          }}
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>

                        <button
                          onClick={() => handleDelete(announcement.id)}
                          style={{ 
                            padding: '0.5rem', 
                            color: '#ef4444', 
                            background: 'rgba(239, 68, 68, 0.1)', 
                            borderRadius: '0.375rem', 
                            border: 'none', 
                            cursor: 'pointer' 
                          }}
                          title="Hapus"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
