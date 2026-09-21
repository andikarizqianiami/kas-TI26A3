'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Target, TrendingUp, Users, Calendar, CheckCircle, Clock } from 'lucide-react'
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
  progressPercentage: number
  contributorsCount: number
  myContributions: Array<{
    id: string
    amount: number
    status: string
    createdAt: string
  }>
}

export default function StudentFundingTargetsPage() {
  const router = useRouter()
  const [targets, setTargets] = useState<FundingTarget[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchTargets()
  }, [])

  const fetchTargets = async () => {
    try {
      const res = await fetch('/api/funding-targets')
      if (res.ok) {
        const data = await res.json()
        setTargets(data.targets)
      } else {
        setError('Gagal memuat data')
      }
    } catch (err) {
      setError('Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const badges = {
      ACTIVE: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Aktif', icon: Clock },
      COMPLETED: { bg: 'bg-green-100', text: 'text-green-700', label: 'Selesai', icon: CheckCircle }
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

  const getTotalMyContributions = (target: FundingTarget) => {
    return target.myContributions
      .filter(c => c.status === 'VERIFIED')
      .reduce((sum, c) => sum + c.amount, 0)
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
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Target Urunan</h1>
            <p className="text-sm text-gray-600">Lihat dan berkontribusi untuk target urunan kelas</p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Targets List */}
        <div className="space-y-6">
          {targets.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Belum Ada Target Urunan</h3>
              <p className="text-gray-600">Target urunan akan muncul di sini ketika bendahara membuatnya</p>
            </div>
          ) : (
            targets.map((target) => {
              const myTotal = getTotalMyContributions(target)
              const hasPending = target.myContributions.some(c => c.status === 'PENDING_VERIFICATION')

              return (
                <div key={target.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-gray-900">{target.title}</h3>
                          {getStatusBadge(target.status)}
                        </div>
                        <p className="text-gray-600 mb-3">{target.description}</p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">
                          {formatCurrency(target.currentAmount)} dari {formatCurrency(target.targetAmount)}
                        </span>
                        <span className="text-sm font-bold text-gray-900">{target.progressPercentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full transition-all ${getProgressColor(target.progressPercentage)}`}
                          style={{ width: `${target.progressPercentage}%` }}
                        />
                      </div>
                    </div>

                    {/* My Contribution Status */}
                    {myTotal > 0 && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            <span className="text-sm font-medium text-green-700">
                              Kontribusi Anda: {formatCurrency(myTotal)}
                            </span>
                          </div>
                          {hasPending && (
                            <span className="text-xs text-yellow-600 bg-yellow-100 px-2 py-1 rounded-full">
                              Ada kontribusi pending
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Stats & CTA */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          <span>{target.contributorsCount} kontributor</span>
                        </div>
                        {target.deadline && (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>Deadline: {formatDate(target.deadline)}</span>
                          </div>
                        )}
                      </div>

                      {target.status === 'ACTIVE' && (
                        <Link href={`/dashboard/funding-targets/${target.id}`}>
                          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                            {myTotal > 0 ? 'Tambah Kontribusi' : 'Berkontribusi'}
                          </button>
                        </Link>
                      )}
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
