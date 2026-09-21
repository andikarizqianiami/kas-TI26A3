'use client'

import { useState, useEffect, use } from 'react'
import { ArrowLeft, CheckCircle, XCircle, Clock, Image as ImageIcon, User, Calendar } from 'lucide-react'
import Link from 'next/link'
import { formatCurrency, formatDate } from '@/lib/utils/format'
import Image from 'next/image'

interface Contribution {
  id: string
  amount: number
  method: string
  status: string
  proofImageUrl: string | null
  paymentDate: string | null
  paymentNotes: string | null
  createdAt: string
  student: {
    id: string
    name: string
    nim: string
    whatsapp: string
  }
}

interface FundingTarget {
  id: string
  title: string
  description: string
  targetAmount: number
  currentAmount: number
  deadline: string | null
  status: string
  contributions: Contribution[]
}

export default function FundingTargetDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const [target, setTarget] = useState<FundingTarget | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [verifying, setVerifying] = useState<string | null>(null)
  const [filter, setFilter] = useState<string>('ALL')

  useEffect(() => {
    fetchTarget()
  }, [])

  const fetchTarget = async () => {
    try {
      const res = await fetch(`/api/admin/funding-targets/${resolvedParams.id}`)
      if (res.ok) {
        const data = await res.json()
        setTarget(data.target)
      } else {
        setError('Gagal memuat data')
      }
    } catch (err) {
      setError('Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async (contributionId: string, action: 'approve' | 'reject') => {
    const reason = action === 'reject' ? prompt('Alasan penolakan:') : null
    if (action === 'reject' && !reason) return

    setVerifying(contributionId)
    setError('')
    setSuccess('')

    try {
      const res = await fetch(`/api/admin/contributions/${contributionId}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, rejectionReason: reason })
      })

      const data = await res.json()

      if (res.ok) {
        setSuccess(action === 'approve' ? 'Kontribusi berhasil diverifikasi' : 'Kontribusi ditolak')
        fetchTarget()
      } else {
        setError(data.error || 'Gagal memverifikasi')
      }
    } catch (err) {
      setError('Terjadi kesalahan')
    } finally {
      setVerifying(null)
    }
  }

  const getStatusBadge = (status: string) => {
    const badges = {
      PENDING_VERIFICATION: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Menunggu Verifikasi', icon: Clock },
      VERIFIED: { bg: 'bg-green-100', text: 'text-green-700', label: 'Terverifikasi', icon: CheckCircle },
      REJECTED: { bg: 'bg-red-100', text: 'text-red-700', label: 'Ditolak', icon: XCircle }
    }
    const badge = badges[status as keyof typeof badges] || badges.PENDING_VERIFICATION
    const Icon = badge.icon
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
        <Icon className="w-3 h-3" />
        {badge.label}
      </span>
    )
  }

  const filteredContributions = target?.contributions.filter(c => 
    filter === 'ALL' || c.status === filter
  ) || []

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

  if (!target) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            Target urunan tidak ditemukan
          </div>
        </div>
      </div>
    )
  }

  const progress = Math.min(100, Math.round((target.currentAmount / target.targetAmount) * 100))
  const pending = target.contributions.filter(c => c.status === 'PENDING_VERIFICATION').length
  const verified = target.contributions.filter(c => c.status === 'VERIFIED').length
  const rejected = target.contributions.filter(c => c.status === 'REJECTED').length

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/dashboard/admin/funding-targets">
            <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{target.title}</h1>
            <p className="text-sm text-gray-600">Detail Target Urunan & Kontribusi</p>
          </div>
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

        {/* Target Info */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-gray-700 mb-4">{target.description}</p>
          
          {/* Progress */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-lg font-semibold text-gray-900">
                {formatCurrency(target.currentAmount)} dari {formatCurrency(target.targetAmount)}
              </span>
              <span className="text-lg font-bold text-blue-600">{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className="bg-blue-600 h-4 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-yellow-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-yellow-700">{pending}</p>
              <p className="text-sm text-yellow-600">Menunggu</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-green-700">{verified}</p>
              <p className="text-sm text-green-600">Terverifikasi</p>
            </div>
            <div className="bg-red-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-red-700">{rejected}</p>
              <p className="text-sm text-red-600">Ditolak</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-blue-700">{target.contributions.length}</p>
              <p className="text-sm text-blue-600">Total</p>
            </div>
          </div>
        </div>

        {/* Filter */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex gap-2">
            {['ALL', 'PENDING_VERIFICATION', 'VERIFIED', 'REJECTED'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg transition-colors text-sm ${
                  filter === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status === 'ALL' ? 'Semua' : 
                 status === 'PENDING_VERIFICATION' ? 'Menunggu' :
                 status === 'VERIFIED' ? 'Terverifikasi' : 'Ditolak'}
              </button>
            ))}
          </div>
        </div>

        {/* Contributions List */}
        <div className="space-y-4">
          {filteredContributions.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Belum Ada Kontribusi</h3>
              <p className="text-gray-600">Kontribusi akan muncul di sini setelah mahasiswa berkontribusi</p>
            </div>
          ) : (
            filteredContributions.map((contribution) => (
              <div key={contribution.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {contribution.student.name}
                      </h3>
                      {getStatusBadge(contribution.status)}
                    </div>
                    <p className="text-sm text-gray-600">NIM: {contribution.student.nim}</p>
                    <p className="text-sm text-gray-600">WhatsApp: {contribution.student.whatsapp}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-600">{formatCurrency(contribution.amount)}</p>
                    <p className="text-xs text-gray-500">{contribution.method}</p>
                  </div>
                </div>

                {/* Proof Image */}
                {contribution.proofImageUrl && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Bukti Pembayaran:</p>
                    <div className="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden">
                      <Image
                        src={contribution.proofImageUrl}
                        alt="Bukti pembayaran"
                        fill
                        className="object-contain"
                      />
                    </div>
                  </div>
                )}

                {/* Notes */}
                {contribution.paymentNotes && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-1">Catatan:</p>
                    <p className="text-sm text-gray-600">{contribution.paymentNotes}</p>
                  </div>
                )}

                {/* Date */}
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>Tanggal: {formatDate(contribution.paymentDate || contribution.createdAt)}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                {contribution.status === 'PENDING_VERIFICATION' && (
                  <div className="flex gap-2 pt-4 border-t">
                    <button
                      onClick={() => handleVerify(contribution.id, 'approve')}
                      disabled={verifying === contribution.id}
                      className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-5 h-5" />
                      Verifikasi
                    </button>
                    <button
                      onClick={() => handleVerify(contribution.id, 'reject')}
                      disabled={verifying === contribution.id}
                      className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <XCircle className="w-5 h-5" />
                      Tolak
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
