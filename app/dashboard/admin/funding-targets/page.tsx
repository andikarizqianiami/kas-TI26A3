'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Plus, Target, TrendingUp, CheckCircle, XCircle, Clock, Edit, Trash2, Users } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { formatCurrency, formatDate } from '@/lib/utils/format'

interface FundingTarget {
  id: string
  title: string
  description: string
  targetAmount: number
  currentAmount: number
  deadline: string | null
  status: string
  imageUrl: string | null
  createdAt: string
  _count: {
    contributions: number
  }
  contributions: any[]
}

interface Stats {
  total: number
  active: number
  completed: number
  cancelled: number
  totalCollected: number
  totalTarget: number
}

export default function AdminFundingTargetsPage() {
  const router = useRouter()
  const [targets, setTargets] = useState<FundingTarget[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState<string>('ALL')

  // Form states
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    targetAmount: '',
    deadline: '',
    imageUrl: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState('')

  useEffect(() => {
    fetchTargets()
  }, [filter])

  const fetchTargets = async () => {
    try {
      setLoading(true)
      const url = filter === 'ALL' 
        ? '/api/admin/funding-targets'
        : `/api/admin/funding-targets?status=${filter}`
      
      const res = await fetch(url)
      if (res.ok) {
        const data = await res.json()
        setTargets(data.targets)
        setStats(data.stats)
      } else {
        setError('Gagal memuat data')
      }
    } catch (err) {
      setError('Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    setSuccess('')

    try {
      const res = await fetch('/api/admin/funding-targets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await res.json()

      if (res.ok) {
        setSuccess('Target urunan berhasil dibuat!')
        setFormData({
          title: '',
          description: '',
          targetAmount: '',
          deadline: '',
          imageUrl: ''
        })
        setShowForm(false)
        fetchTargets()
      } else {
        setError(data.error || 'Gagal membuat target urunan')
      }
    } catch (err) {
      setError('Terjadi kesalahan')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Yakin ingin membatalkan target urunan "${title}"?`)) return

    try {
      const res = await fetch(`/api/admin/funding-targets/${id}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        setSuccess('Target urunan dibatalkan')
        fetchTargets()
      } else {
        const data = await res.json()
        setError(data.error || 'Gagal membatalkan')
      }
    } catch (err) {
      setError('Terjadi kesalahan')
    }
  }

  const getStatusBadge = (status: string) => {
    const badges = {
      ACTIVE: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Aktif', icon: Clock },
      COMPLETED: { bg: 'bg-green-100', text: 'text-green-700', label: 'Selesai', icon: CheckCircle },
      CANCELLED: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Dibatalkan', icon: XCircle },
      EXPIRED: { bg: 'bg-red-100', text: 'text-red-700', label: 'Kadaluarsa', icon: Clock }
    }
    const badge = badges[status as keyof typeof badges] || badges.ACTIVE
    const Icon = badge.icon
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
        <Icon className="w-3 h-3" />
        {badge.label}
      </span>
    )
  }

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-green-600'
    if (percentage >= 75) return 'bg-blue-600'
    if (percentage >= 50) return 'bg-yellow-600'
    return 'bg-gray-600'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Target Urunan</h1>
              <p className="text-sm text-gray-600">Kelola target urunan kelas</p>
            </div>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Buat Target Baru
          </button>
        </div>

        {/* Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            {success}
          </div>
        )}

        {/* Form */}
        {showForm && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">Buat Target Urunan Baru</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Judul Target *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Contoh: Urunan Workshop Web Development"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Deskripsi *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Jelaskan tujuan urunan ini..."
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Target Nominal (Rp) *
                  </label>
                  <input
                    type="number"
                    value={formData.targetAmount}
                    onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="500000"
                    min="1"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Deadline (Opsional)
                  </label>
                  <input
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL Gambar Banner (Opsional)
                </label>
                <input
                  type="text"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Membuat...' : 'Buat Target'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Target</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <Target className="w-8 h-8 text-blue-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Aktif</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.active}</p>
                </div>
                <Clock className="w-8 h-8 text-blue-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Selesai</p>
                  <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Terkumpul</p>
                  <p className="text-xl font-bold text-green-600">{formatCurrency(stats.totalCollected)}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>
        )}

        {/* Filter */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex gap-2">
            {['ALL', 'ACTIVE', 'COMPLETED', 'CANCELLED'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filter === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status === 'ALL' ? 'Semua' : status === 'ACTIVE' ? 'Aktif' : status === 'COMPLETED' ? 'Selesai' : 'Dibatalkan'}
              </button>
            ))}
          </div>
        </div>

        {/* Targets List */}
        <div className="space-y-4">
          {targets.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Belum Ada Target Urunan</h3>
              <p className="text-gray-600">Buat target urunan baru untuk memulai pengumpulan dana kelas</p>
            </div>
          ) : (
            targets.map((target) => {
              const progress = Math.min(100, Math.round((target.currentAmount / target.targetAmount) * 100))
              
              return (
                <div key={target.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-gray-900">{target.title}</h3>
                          {getStatusBadge(target.status)}
                        </div>
                        <p className="text-gray-600 mb-3">{target.description}</p>
                        {target.deadline && (
                          <p className="text-sm text-gray-500">
                            Deadline: {formatDate(target.deadline)}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        <Link href={`/dashboard/admin/funding-targets/${target.id}`}>
                          <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                            <Edit className="w-5 h-5" />
                          </button>
                        </Link>
                        {target.status === 'ACTIVE' && (
                          <button
                            onClick={() => handleDelete(target.id, target.title)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">
                          {formatCurrency(target.currentAmount)} dari {formatCurrency(target.targetAmount)}
                        </span>
                        <span className="text-sm font-bold text-gray-900">{progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full transition-all ${getProgressColor(progress)}`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{target._count.contributions} kontributor</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>Dibuat {formatDate(target.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
