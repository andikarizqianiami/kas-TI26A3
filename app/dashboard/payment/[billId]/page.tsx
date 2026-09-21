'use client'

import { useState, useEffect, use } from 'react'
import { ArrowLeft, QrCode, CreditCard, Upload, CheckCircle, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { formatCurrency, formatDate } from '@/lib/utils/format'
import Image from 'next/image'

interface Bill {
  id: string
  name: string
  description: string
  amount: number
  deadline: string
  weekPeriod: string
  status: string
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

export default function PaymentPage({ params }: { params: Promise<{ billId: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [bill, setBill] = useState<Bill | null>(null)
  const [settings, setSettings] = useState<Settings>({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  // Form state
  const [paymentMethod, setPaymentMethod] = useState<'QRIS' | 'MANUAL_TRANSFER'>('QRIS')
  const [proofImage, setProofImage] = useState<File | null>(null)
  const [proofImagePreview, setProofImagePreview] = useState('')
  const [paymentNotes, setPaymentNotes] = useState('')

  useEffect(() => {
    fetchBill()
    fetchSettings()
  }, [])

  const fetchBill = async () => {
    try {
      const res = await fetch(`/api/bills/${resolvedParams.billId}`)
      if (res.ok) {
        const data = await res.json()
        setBill(data.bill)
      } else {
        setError('Tagihan tidak ditemukan')
      }
    } catch (err) {
      setError('Gagal memuat tagihan')
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
        
        // Set default payment method based on what's enabled
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
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
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
    setError('')

    if (!proofImage) {
      setError('Bukti pembayaran harus diupload')
      return
    }

    setSubmitting(true)

    try {
      // In production, upload image to cloud storage first
      // For now, use data URL
      const reader = new FileReader()
      reader.onloadend = async () => {
        const proofImageUrl = reader.result as string

        const res = await fetch(`/api/bills/${resolvedParams.billId}/pay`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            method: paymentMethod === 'QRIS' ? 'QRIS_DANA' : 'MANUAL_TRANSFER',
            proofImageUrl,
            paymentNotes
          })
        })

        if (res.ok) {
          setSuccess(true)
          setTimeout(() => {
            router.push('/dashboard')
          }, 2000)
        } else {
          const data = await res.json()
          setError(data.error || 'Gagal mengirim pembayaran')
          setSubmitting(false)
        }
      }
      reader.readAsDataURL(proofImage)
    } catch (err) {
      setError('Terjadi kesalahan')
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

  if (!bill) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-bg)' }}>
        <div style={{ textAlign: 'center' }}>
          <AlertCircle size={48} style={{ color: '#ef4444', margin: '0 auto 1rem' }} />
          <p style={{ color: 'var(--color-text)', marginBottom: '1rem' }}>Tagihan tidak ditemukan</p>
          <Link href="/dashboard">
            <button className="btn-primary">Kembali ke Dashboard</button>
          </Link>
        </div>
      </div>
    )
  }

  if (bill.status === 'PAID') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-bg)' }}>
        <div style={{ textAlign: 'center' }}>
          <CheckCircle size={48} style={{ color: '#22c55e', margin: '0 auto 1rem' }} />
          <p style={{ color: 'var(--color-text)', marginBottom: '1rem' }}>Tagihan ini sudah lunas!</p>
          <Link href="/dashboard">
            <button className="btn-primary">Kembali ke Dashboard</button>
          </Link>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-bg)' }}>
        <div style={{ textAlign: 'center' }}>
          <CheckCircle size={64} style={{ color: '#22c55e', margin: '0 auto 1rem' }} />
          <h2 style={{ color: 'var(--color-text)', marginBottom: '0.5rem', fontSize: '1.5rem', fontWeight: 'bold' }}>
            Pembayaran Berhasil Dikirim!
          </h2>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
            Menunggu verifikasi dari bendahara...
          </p>
          <Link href="/dashboard">
            <button className="btn-primary">Kembali ke Dashboard</button>
          </Link>
        </div>
      </div>
    )
  }

  const hasQRIS = settings.qris_enabled
  const hasManual = settings.manual_transfer_enabled

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg)', padding: '2rem' }}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link 
            href="/dashboard" 
            className="inline-flex items-center gap-2 mb-4" 
            style={{ color: 'var(--color-primary)', fontSize: '0.875rem' }}
          >
            <ArrowLeft size={16} /> Kembali ke Dashboard
          </Link>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--color-text)' }}>
            Bayar Tagihan
          </h1>
          <p style={{ color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>
            Pilih metode pembayaran dan upload bukti transfer
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{ padding: '1rem', marginBottom: '1.5rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', borderRadius: '0.5rem', color: '#ef4444' }}>
            {error}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          {/* Bill Info */}
          <div className="surface" style={{ padding: '1.5rem' }}>
            <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--color-text)' }}>
              Detail Tagihan
            </h2>

            <div style={{ marginBottom: '1rem' }}>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                Nama Tagihan
              </p>
              <p style={{ color: 'var(--color-text)', fontWeight: 600 }}>
                {bill.name}
              </p>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                Periode
              </p>
              <p style={{ color: 'var(--color-text)', fontWeight: 600 }}>
                {bill.weekPeriod}
              </p>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                Deadline
              </p>
              <p style={{ color: 'var(--color-text)', fontWeight: 600 }}>
                {formatDate(bill.deadline, 'dd MMMM yyyy')}
              </p>
            </div>

            <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '2px solid var(--color-border)' }}>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                Total Pembayaran
              </p>
              <p style={{ color: 'var(--color-primary)', fontSize: '2rem', fontWeight: 'bold' }}>
                {formatCurrency(bill.amount)}
              </p>
            </div>
          </div>

          {/* Payment Form */}
          <form onSubmit={handleSubmit} className="surface" style={{ padding: '1.5rem' }}>
            <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--color-text)' }}>
              Metode Pembayaran
            </h2>

            {/* Payment Method Selection */}
            <div style={{ marginBottom: '1.5rem' }}>
              {hasQRIS && (
                <label 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '1rem', 
                    padding: '1rem',
                    border: `2px solid ${paymentMethod === 'QRIS' ? 'var(--color-primary)' : 'var(--color-border)'}`,
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    marginBottom: '1rem',
                    background: paymentMethod === 'QRIS' ? 'rgba(59, 130, 246, 0.05)' : 'transparent'
                  }}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="QRIS"
                    checked={paymentMethod === 'QRIS'}
                    onChange={() => setPaymentMethod('QRIS')}
                    style={{ width: '1.25rem', height: '1.25rem' }}
                  />
                  <QrCode size={24} style={{ color: 'var(--color-primary)' }} />
                  <div style={{ flex: 1 }}>
                    <p style={{ color: 'var(--color-text)', fontWeight: 600 }}>QRIS</p>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                      Scan QR Code untuk bayar
                    </p>
                  </div>
                </label>
              )}

              {hasManual && (
                <label 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '1rem', 
                    padding: '1rem',
                    border: `2px solid ${paymentMethod === 'MANUAL_TRANSFER' ? 'var(--color-primary)' : 'var(--color-border)'}`,
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    background: paymentMethod === 'MANUAL_TRANSFER' ? 'rgba(59, 130, 246, 0.05)' : 'transparent'
                  }}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="MANUAL_TRANSFER"
                    checked={paymentMethod === 'MANUAL_TRANSFER'}
                    onChange={() => setPaymentMethod('MANUAL_TRANSFER')}
                    style={{ width: '1.25rem', height: '1.25rem' }}
                  />
                  <CreditCard size={24} style={{ color: 'var(--color-primary)' }} />
                  <div style={{ flex: 1 }}>
                    <p style={{ color: 'var(--color-text)', fontWeight: 600 }}>Transfer Bank</p>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                      Transfer manual ke rekening
                    </p>
                  </div>
                </label>
              )}
            </div>

            {/* Payment Details */}
            {paymentMethod === 'QRIS' && hasQRIS && settings.qris_image_url && (
              <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'rgba(59, 130, 246, 0.05)', borderRadius: '0.5rem' }}>
                <p style={{ color: 'var(--color-text)', fontWeight: 600, marginBottom: '0.5rem' }}>
                  Scan QR Code ini:
                </p>
                {settings.qris_name && (
                  <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginBottom: '1rem' }}>
                    A/n: {settings.qris_name}
                  </p>
                )}
                <div style={{ maxWidth: '250px', margin: '0 auto' }}>
                  <img 
                    src={settings.qris_image_url} 
                    alt="QRIS Code" 
                    style={{ width: '100%', border: '2px solid var(--color-border)', borderRadius: '0.5rem' }}
                  />
                </div>
              </div>
            )}

            {paymentMethod === 'MANUAL_TRANSFER' && hasManual && (
              <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'rgba(59, 130, 246, 0.05)', borderRadius: '0.5rem' }}>
                <p style={{ color: 'var(--color-text)', fontWeight: 600, marginBottom: '1rem' }}>
                  Transfer ke rekening:
                </p>
                <div style={{ display: 'grid', gap: '0.5rem', fontSize: '0.875rem' }}>
                  <div>
                    <span style={{ color: 'var(--color-text-muted)' }}>Bank: </span>
                    <span style={{ color: 'var(--color-text)', fontWeight: 600 }}>{settings.bank_name}</span>
                  </div>
                  <div>
                    <span style={{ color: 'var(--color-text-muted)' }}>No. Rekening: </span>
                    <span style={{ color: 'var(--color-text)', fontWeight: 600 }}>{settings.account_number}</span>
                  </div>
                  <div>
                    <span style={{ color: 'var(--color-text-muted)' }}>Atas Nama: </span>
                    <span style={{ color: 'var(--color-text)', fontWeight: 600 }}>{settings.account_holder}</span>
                  </div>
                </div>
                {settings.payment_instructions && (
                  <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginTop: '1rem', padding: '0.75rem', background: 'white', borderRadius: '0.375rem' }}>
                    {settings.payment_instructions}
                  </p>
                )}
              </div>
            )}

            {/* Upload Proof */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', color: 'var(--color-text)', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                Upload Bukti Pembayaran *
              </label>
              
              {proofImagePreview ? (
                <div style={{ position: 'relative' }}>
                  <img 
                    src={proofImagePreview} 
                    alt="Proof Preview" 
                    style={{ width: '100%', maxHeight: '200px', objectFit: 'contain', border: '2px solid var(--color-border)', borderRadius: '0.5rem' }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setProofImage(null)
                      setProofImagePreview('')
                    }}
                    style={{
                      position: 'absolute',
                      top: '0.5rem',
                      right: '0.5rem',
                      background: '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '50%',
                      width: '2rem',
                      height: '2rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer'
                    }}
                  >
                    ×
                  </button>
                </div>
              ) : (
                <label 
                  style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    padding: '2rem',
                    border: '2px dashed var(--color-border)',
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    background: 'var(--color-bg)'
                  }}
                >
                  <Upload size={32} style={{ color: 'var(--color-text-muted)', marginBottom: '0.5rem' }} />
                  <span style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                    Click to upload bukti transfer
                  </span>
                  <span style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                    PNG, JPG up to 5MB
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    required
                    style={{ display: 'none' }}
                  />
                </label>
              )}
            </div>

            {/* Notes */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', color: 'var(--color-text)', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                Catatan (Opsional)
              </label>
              <textarea
                value={paymentNotes}
                onChange={(e) => setPaymentNotes(e.target.value)}
                rows={3}
                placeholder="Tambahkan catatan jika perlu..."
                style={{ width: '100%', padding: '0.75rem', background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: '0.5rem', color: 'var(--color-text)', resize: 'vertical' }}
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="btn-primary"
              disabled={submitting || !proofImage}
              style={{ width: '100%', justifyContent: 'center' }}
            >
              {submitting ? 'Mengirim...' : 'Kirim Pembayaran'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
