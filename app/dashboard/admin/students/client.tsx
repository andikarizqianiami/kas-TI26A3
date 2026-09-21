'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Search, UserCheck, UserX, Plus, Edit2, Trash2, Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'

interface Student {
  id: string
  nim: string
  name: string
  email: string
  whatsapp: string
  class: string
  isActive: boolean
  user?: {
    id: string
    email: string
  }
  bills?: any[]
}

export default function AdminStudentsClient() {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Form state
  const [nim, setNim] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [studentClass, setStudentClass] = useState('TI26A3')
  const [isActive, setIsActive] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    fetchStudents()
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

  const resetForm = () => {
    setNim('')
    setName('')
    setEmail('')
    setWhatsapp('')
    setStudentClass('TI26A3')
    setIsActive(true)
    setEditingId(null)
    setShowForm(false)
    setError('')
    setSuccess('')
  }

  const handleEdit = (student: Student) => {
    setEditingId(student.id)
    setNim(student.nim)
    setName(student.name)
    setEmail(student.email)
    setWhatsapp(student.whatsapp || '')
    setStudentClass(student.class)
    setIsActive(student.isActive)
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menonaktifkan mahasiswa ini? Data pembayaran tidak akan terhapus.')) return

    try {
      const res = await fetch(`/api/admin/students/${id}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        setSuccess('Mahasiswa berhasil dinonaktifkan')
        fetchStudents()
        setTimeout(() => setSuccess(''), 3000)
      } else {
        const data = await res.json()
        setError(data.error || 'Gagal menonaktifkan mahasiswa')
      }
    } catch (err) {
      setError('Terjadi kesalahan')
    }
  }

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const student = students.find(s => s.id === id)
      if (!student) return

      const res = await fetch(`/api/admin/students/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...student,
          isActive: !currentStatus
        })
      })

      if (res.ok) {
        setSuccess(`Mahasiswa ${!currentStatus ? 'diaktifkan' : 'dinonaktifkan'}`)
        fetchStudents()
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

    if (!nim.trim() || !name.trim() || !email.trim()) {
      setError('NIM, Nama, dan Email harus diisi')
      return
    }

    setSubmitting(true)

    try {
      const url = editingId 
        ? `/api/admin/students/${editingId}`
        : '/api/admin/students'

      const res = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nim: nim.trim(),
          name: name.trim(),
          email: email.trim(),
          whatsapp: whatsapp.trim() || null,
          class: studentClass,
          isActive
        })
      })

      const data = await res.json()

      if (res.ok) {
        setSuccess(data.message || (editingId ? 'Mahasiswa berhasil diupdate' : 'Mahasiswa berhasil ditambahkan'))
        if (data.defaultPassword) {
          alert(`Mahasiswa berhasil dibuat!\n\nEmail: ${data.student.email}\nPassword Default: ${data.defaultPassword}\n\nSimpan informasi ini dan bagikan ke mahasiswa.`)
        }
        resetForm()
        fetchStudents()
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError(data.error || 'Gagal menyimpan mahasiswa')
      }
    } catch (err) {
      setError('Terjadi kesalahan')
    } finally {
      setSubmitting(false)
    }
  }

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.nim.includes(search) ||
    s.email.toLowerCase().includes(search.toLowerCase())
  )

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
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 className="text-3xl font-bold" style={{ color: 'var(--color-text)' }}>
                Manajemen Mahasiswa
              </h1>
              <p style={{ color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>
                Kelola data mahasiswa kelas TI26A3
              </p>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <Plus size={18} /> {showForm ? 'Tutup Form' : 'Tambah Mahasiswa'}
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
              {editingId ? 'Edit Mahasiswa' : 'Tambah Mahasiswa Baru'}
            </h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', color: 'var(--color-text)', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                  NIM *
                </label>
                <input
                  type="text"
                  value={nim}
                  onChange={(e) => setNim(e.target.value)}
                  required
                  disabled={!!editingId}
                  placeholder="Contoh: 2026010001"
                  style={{ width: '100%', padding: '0.75rem', background: editingId ? '#f3f4f6' : 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: '0.5rem', color: 'var(--color-text)' }}
                />
                {!editingId && (
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
                    NIM akan digunakan sebagai password default
                  </p>
                )}
              </div>

              <div>
                <label style={{ display: 'block', color: 'var(--color-text)', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                  Nama Lengkap *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Nama mahasiswa"
                  style={{ width: '100%', padding: '0.75rem', background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: '0.5rem', color: 'var(--color-text)' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', color: 'var(--color-text)', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                  Email *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="email@example.com"
                  style={{ width: '100%', padding: '0.75rem', background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: '0.5rem', color: 'var(--color-text)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', color: 'var(--color-text)', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                  WhatsApp
                </label>
                <input
                  type="tel"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="081234567890"
                  style={{ width: '100%', padding: '0.75rem', background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: '0.5rem', color: 'var(--color-text)' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', color: 'var(--color-text)', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                  Kelas
                </label>
                <input
                  type="text"
                  value={studentClass}
                  onChange={(e) => setStudentClass(e.target.value)}
                  placeholder="TI26A3"
                  style={{ width: '100%', padding: '0.75rem', background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: '0.5rem', color: 'var(--color-text)' }}
                />
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
                  <span style={{ color: 'var(--color-text)' }}>Aktif</span>
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
                {submitting ? 'Menyimpan...' : (editingId ? 'Update' : 'Tambah Mahasiswa')}
              </button>
            </div>
          </form>
        )}

        {/* Search */}
        <div className="surface mb-6" style={{ padding: '1rem' }}>
          <div style={{ position: 'relative' }}>
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
              placeholder="Cari berdasarkan nama, NIM, atau email..."
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
        </div>

        {/* Students Table */}
        <div className="surface" style={{ padding: '1.5rem' }}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold" style={{ color: 'var(--color-text)' }}>
              Daftar Mahasiswa ({filteredStudents.length})
            </h2>
            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.875rem' }}>
              <span style={{ color: 'var(--color-text-muted)' }}>
                <UserCheck size={16} style={{ display: 'inline', marginRight: '0.25rem' }} />
                Aktif: {students.filter(s => s.isActive).length}
              </span>
              <span style={{ color: 'var(--color-text-muted)' }}>
                <UserX size={16} style={{ display: 'inline', marginRight: '0.25rem' }} />
                Nonaktif: {students.filter(s => !s.isActive).length}
              </span>
            </div>
          </div>

          {filteredStudents.length === 0 ? (
            <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: '2rem' }}>
              {search ? 'Tidak ada mahasiswa yang cocok dengan pencarian.' : 'Tidak ada data mahasiswa.'}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
                    <th className="text-left p-3" style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', fontWeight: 600 }}>
                      NIM
                    </th>
                    <th className="text-left p-3" style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', fontWeight: 600 }}>
                      Nama
                    </th>
                    <th className="text-left p-3" style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', fontWeight: 600 }}>
                      Email
                    </th>
                    <th className="text-left p-3" style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', fontWeight: 600 }}>
                      WhatsApp
                    </th>
                    <th className="text-center p-3" style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', fontWeight: 600 }}>
                      Status
                    </th>
                    <th className="text-center p-3" style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', fontWeight: 600 }}>
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student) => (
                    <tr key={student.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                      <td className="p-3" style={{ color: 'var(--color-text)', fontWeight: 500 }}>
                        {student.nim}
                      </td>
                      <td className="p-3" style={{ color: 'var(--color-text)' }}>
                        {student.name}
                      </td>
                      <td className="p-3" style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                        {student.email}
                      </td>
                      <td className="p-3" style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                        {student.whatsapp || '-'}
                      </td>
                      <td className="p-3">
                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                          <span
                            style={{
                              padding: '0.25rem 0.75rem',
                              borderRadius: '9999px',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              background: student.isActive ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                              color: student.isActive ? '#22c55e' : '#ef4444'
                            }}
                          >
                            {student.isActive ? 'Aktif' : 'Nonaktif'}
                          </span>
                        </div>
                      </td>
                      <td className="p-3">
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                          <button
                            onClick={() => handleToggleActive(student.id, student.isActive)}
                            style={{ 
                              padding: '0.5rem', 
                              color: student.isActive ? '#9ca3af' : '#22c55e', 
                              background: student.isActive ? 'rgba(156, 163, 175, 0.1)' : 'rgba(34, 197, 94, 0.1)', 
                              borderRadius: '0.375rem', 
                              border: 'none', 
                              cursor: 'pointer' 
                            }}
                            title={student.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                          >
                            {student.isActive ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>

                          <button
                            onClick={() => handleEdit(student)}
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
                            onClick={() => handleDelete(student.id)}
                            style={{ 
                              padding: '0.5rem', 
                              color: '#ef4444', 
                              background: 'rgba(239, 68, 68, 0.1)', 
                              borderRadius: '0.375rem', 
                              border: 'none', 
                              cursor: 'pointer' 
                            }}
                            title="Nonaktifkan"
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
