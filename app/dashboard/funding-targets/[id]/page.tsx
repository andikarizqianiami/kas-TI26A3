'use client'

import { useState, useEffect, use } from 'react'
import { ArrowLeft, Upload, CheckCircle, Clock, QrCode, CreditCard, Users, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { formatCurrency, formatDate } from '@/lib/utils/format'
import Image from 'next/image'

interface FundingTarget {
  id: string
  title: string
  description: string
  targetAmount: number
  currentAmount: number
  deadline: string | null
  status: string
  progressPercentage: number
  contributorsCount: number
  myContributions: Array<{
    id: string
    amount: number
    status: string
    paymentDate: string
    createdAt: string
  }>
}

interface Settings {
  qris_enabled?: boolean
  qris_image_url?: string
  qris_name?: string
  manual_transfer_enabled?: boolean
  bank_name?: string
  account_number?: string
  account_holder?: string
  payment_instructions?: string
}

export default function StudentContributePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [target, setTarget] = useState<FundingTarget | null>(null)
  const [settings, setSettings] = useState<Settings>({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  // Form state
  const [paymentMethod, setPaymentMethod] = useState<'QRIS' | 'MANUAL_TRANSFER'>('QRIS')
  const [amount, setAmount] = useState('')
  const [proofImage, setProofImage] = useState<File | null>(null)
  const [proofImagePreview, setProofImagePreview] = useState('')
  const [paymentNotes, setPaymentNotes] = useState('')

  useEffect(() => {
    fetchTarget()
    fetchSettings()
  }, [])

  const fetchTarget = async () => {
    try {
      const res = await fetch(`/api/funding-targets/${resolvedParams.id}`)
      if (res.ok) {
        const data = await res.json()
        setTarget(data.target)
      } else {
        setError('Target urunan tidak ditemukan')
      }
    } catch (err) {
      setError('Gagal memuat data')
    } finally {
      setLoading(false)
    }
  }

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings')
      if (res.ok) {
        const data = await res.json()
        setSettings(data.settings || {})
        
        if (data.settings?.qris_enabled) {
          setPaymentMethod('QRIS')
        } else if (data.settings?.manual_transfer_enabled) {
          setPaymentMethod('MANUAL_TRANSFER')
        }
      }
    } catch (err) {
      console.error('Failed to fetch settings')
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Ukuran file maksimal 5MB')
        return
      }

      setProofImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setProofImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!proofImage) {
      setError('Upload bukti pembayaran terlebih dahulu')
      return
    }

    setSubmitting(true)
    setError('')

    try {
      const reader = new FileReader()
      reader.onloadend = async () => {
        const proofImageUrl = reader.result as string

        const res = await fetch(`/api/funding-targets/${resolvedParams.id}/contribute`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: parseInt(amount),
            method: paymentMethod,
            proofImageUrl,
            paymentNotes
          })
        })

        const data = await res.json()

        if (res.ok) {
          setSuccess(true)
          setTimeout(() => {
            router.push('/dashboard/funding-targets')
          }, 2000)
        } else {
          setError(data.error || 'Gagal mengirim kontribusi')
          setSubmitting(false)
        }
      }

      reader.readAsDataURL(proofImage)
    } catch (err) {
      setError('Terjadi kesalahan')
      setSubmitting(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const badges = {
      PENDING_VERIFICATION: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Menunggu Verifikasi', icon: Clock },
      VERIFIED: { bg: 'bg-green-100', text: 'text-green-700', label: 'Terverifikasi', icon: CheckCircle }
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
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
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            Target urunan tidak ditemukan
          </div>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Kontribusi Berhasil Dikirim!</h2>
          <p className="text-gray-600 mb-6">
            Kontribusi Anda sedang menunggu verifikasi bendahara. Anda akan mendapat notifikasi setelah diverifikasi.
          </p>
          <Link href="/dashboard/funding-targets">
            <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              Kembali ke Daftar Target
            </button>
          </Link>
        </div>
      </div>
    )
  }

  const myTotal = target.myContributions
    .filter(c => c.status === 'VERIFIED')
    .reduce((sum, c) => sum + c.amount, 0)

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/dashboard/funding-targets">
            <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Berkontribusi</h1>
            <p className="text-sm text-gray-600">{target.title}</p>
          </div>
        </div>

        {/* Target Info */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-gray-700 mb-4">{target.description}</p>
          
          {/* Progress */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">
                {formatCurrency(target.currentAmount)} dari {formatCurrency(target.targetAmount)}
              </span>
              <span className="text-sm font-bold text-blue-600">{target.progressPercentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-blue-600 h-3 rounded-full transition-all"
                style={{ width: `${target.progressPercentage}%` }}
              />
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{target.contributorsCount} kontributor</span>
            </div>
            {myTotal > 0 && (
              <div className="flex items-center gap-1">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-green-600 font-medium">Kontribusi Anda: {formatCurrency(myTotal)}</span>
              </div>
            )}
          </div>
        </div>

        {/* My Contributions History */}
        {target.myContributions.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Riwayat Kontribusi Anda</h3>
            <div className="space-y-3">
              {target.myContributions.map((contribution) => (
                <div key={contribution.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{formatCurrency(contribution.amount)}</p>
                    <p className="text-sm text-gray-600">{formatDate(contribution.paymentDate || contribution.createdAt)}</p>
                  </div>
                  {getStatusBadge(contribution.status)}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Payment Form */}
        {target.status === 'ACTIVE' && (
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-6">
            <h3 className="text-lg font-semibold">Form Kontribusi</h3>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nominal Kontribusi *
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Masukkan nominal (Rp)"
                min="1000"
                required
              />
            </div>

            {/* Payment Method Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Metode Pembayaran *
              </label>
              <div className="grid grid-cols-2 gap-4">
                {settings.qris_enabled && (
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('QRIS')}
                    className={`p-4 border-2 rounded-lg transition-all ${
                      paymentMethod === 'QRIS'
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <QrCode className={`w-8 h-8 mx-auto mb-2 ${paymentMethod === 'QRIS' ? 'text-blue-600' : 'text-gray-400'}`} />
                    <p className={`text-sm font-medium ${paymentMethod === 'QRIS' ? 'text-blue-600' : 'text-gray-700'}`}>
                      QRIS
                    </p>
                  </button>
                )}

                {settings.manual_transfer_enabled && (
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('MANUAL_TRANSFER')}
                    className={`p-4 border-2 rounded-lg transition-all ${
                      paymentMethod === 'MANUAL_TRANSFER'
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <CreditCard className={`w-8 h-8 mx-auto mb-2 ${paymentMethod === 'MANUAL_TRANSFER' ? 'text-blue-600' : 'text-gray-400'}`} />
                    <p className={`text-sm font-medium ${paymentMethod === 'MANUAL_TRANSFER' ? 'text-blue-600' : 'text-gray-700'}`}>
                      Transfer Manual
                    </p>
                  </button>
                )}
              </div>
            </div>

            {/* Payment Details */}
            {paymentMethod === 'QRIS' && settings.qris_image_url && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Scan QRIS untuk Pembayaran</h4>
                <div className="relative w-full max-w-sm mx-auto aspect-square bg-white rounded-lg p-4">
                  <Image
                    src={settings.qris_image_url}
                    alt="QRIS Code"
                    fill
                    className="object-contain"
                  />
                </div>
                <p className="text-sm text-gray-600 text-center mt-3">
                  {settings.qris_name || 'Scan kode QR di atas'}
                </p>
              </div>
            )}

            {paymentMethod === 'MANUAL_TRANSFER' && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Informasi Transfer</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Bank:</span>
                    <span className="font-medium text-gray-900">{settings.bank_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">No. Rekening:</span>
                    <span className="font-medium text-gray-900">{settings.account_number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Atas Nama:</span>
                    <span className="font-medium text-gray-900">{settings.account_holder}</span>
                  </div>
                </div>
                {settings.payment_instructions && (
                  <p className="text-sm text-gray-600 mt-3 p-3 bg-blue-50 rounded">
                    {settings.payment_instructions}
                  </p>
                )}
              </div>
            )}

            {/* Upload Proof */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bukti Pembayaran *
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors cursor-pointer">
                <input
                  type="file"
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="hidden"
                  id="proof-upload"
                  required
                />
                <label htmlFor="proof-upload" className="cursor-pointer">
                  {proofImagePreview ? (
                    <div className="relative w-full h-64">
                      <Image
                        src={proofImagePreview}
                        alt="Preview"
                        fill
                        className="object-contain"
                      />
                    </div>
                  ) : (
                    <>
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Klik untuk upload bukti transfer</p>
                      <p className="text-xs text-gray-500 mt-1">PNG, JPG maksimal 5MB</p>
                    </>
                  )}
                </label>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Catatan (Opsional)
              </label>
              <textarea
                value={paymentNotes}
                onChange={(e) => setPaymentNotes(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Tambahkan catatan jika diperlukan..."
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting || !proofImage}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {submitting ? 'Mengirim...' : 'Kirim Kontribusi'}
            </button>
          </form>
        )}

        {target.status === 'COMPLETED' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
            <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-green-900 mb-2">Target Tercapai!</h3>
            <p className="text-green-700">Target urunan ini sudah selesai. Terima kasih atas kontribusi Anda!</p>
          </div>
        )}
      </div>
    </div>
  )
}
