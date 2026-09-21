'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Save, QrCode, CreditCard, Upload, X } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

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

export default function AdminSettingsPage() {
  const router = useRouter()
  const [settings, setSettings] = useState<Settings>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Form states
  const [qrisEnabled, setQrisEnabled] = useState(false)
  const [qrisImageUrl, setQrisImageUrl] = useState('')
  const [qrisName, setQrisName] = useState('')
  const [manualEnabled, setManualEnabled] = useState(false)
  const [bankName, setBankName] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const [accountHolder, setAccountHolder] = useState('')
  const [instructions, setInstructions] = useState('')
  const [imagePreview, setImagePreview] = useState('')

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings')
      if (res.ok) {
        const data = await res.json()
        setSettings(data.settings || {})
        
        // Populate form
        setQrisEnabled(data.settings?.qris_enabled || false)
        setQrisImageUrl(data.settings?.qris_image_url || '')
        setQrisName(data.settings?.qris_name || '')
        setManualEnabled(data.settings?.manual_transfer_enabled || false)
        setBankName(data.settings?.bank_name || '')
        setAccountNumber(data.settings?.account_number || '')
        setAccountHolder(data.settings?.account_holder || '')
        setInstructions(data.settings?.payment_instructions || '')
        setImagePreview(data.settings?.qris_image_url || '')
      }
    } catch (err) {
      console.error('Failed to fetch settings')
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // In production, upload to cloud storage
      // For now, use data URL
      const reader = new FileReader()
      reader.onloadend = () => {
        const dataUrl = reader.result as string
        setQrisImageUrl(dataUrl)
        setImagePreview(dataUrl)
      }
      reader.readAsDataURL(file)
    }
  }

  const saveSetting = async (key: string, value: any) => {
    const res = await fetch('/api/admin/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, value })
    })
    return res.ok
  }

  const handleSave = async () => {
    setError('')
    setSuccess('')
    setSaving(true)

    try {
      // Validate
      if (qrisEnabled && !qrisImageUrl) {
        setError('QRIS image is required when QRIS is enabled')
        setSaving(false)
        return
      }

      if (manualEnabled && (!bankName || !accountNumber || !accountHolder)) {
        setError('Bank details are required when manual transfer is enabled')
        setSaving(false)
        return
      }

      if (!qrisEnabled && !manualEnabled) {
        setError('At least one payment method must be enabled')
        setSaving(false)
        return
      }

      // Save all settings
      const savePromises = [
        saveSetting('qris_enabled', qrisEnabled),
        saveSetting('qris_image_url', qrisImageUrl),
        saveSetting('qris_name', qrisName),
        saveSetting('manual_transfer_enabled', manualEnabled),
        saveSetting('bank_name', bankName),
        saveSetting('account_number', accountNumber),
        saveSetting('account_holder', accountHolder),
        saveSetting('payment_instructions', instructions)
      ]

      const results = await Promise.all(savePromises)

      if (results.every(r => r)) {
        setSuccess('Settings saved successfully!')
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError('Some settings failed to save')
      }
    } catch (err) {
      setError('Failed to save settings')
    } finally {
      setSaving(false)
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
            Pengaturan Sistem
          </h1>
          <p style={{ color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>
            Kelola metode pembayaran dan konfigurasi sistem
          </p>
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

        {/* QRIS Settings */}
        <div className="surface mb-6" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <QrCode size={24} style={{ color: 'var(--color-primary)' }} />
            <h2 className="text-xl font-semibold" style={{ color: 'var(--color-text)' }}>
              QRIS Payment
            </h2>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={qrisEnabled}
                onChange={(e) => setQrisEnabled(e.target.checked)}
                style={{ width: '1.25rem', height: '1.25rem' }}
              />
              <span style={{ color: 'var(--color-text)', fontWeight: 600 }}>
                Aktifkan pembayaran via QRIS
              </span>
            </label>
          </div>

          {qrisEnabled && (
            <>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', color: 'var(--color-text)', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                  Nama Akun QRIS
                </label>
                <input
                  type="text"
                  value={qrisName}
                  onChange={(e) => setQrisName(e.target.value)}
                  placeholder="Contoh: Kas TI26A3"
                  style={{ width: '100%', padding: '0.75rem', background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: '0.5rem', color: 'var(--color-text)' }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', color: 'var(--color-text)', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                  Upload QRIS Image *
                </label>
                
                {imagePreview ? (
                  <div style={{ position: 'relative', maxWidth: '300px' }}>
                    <img 
                      src={imagePreview} 
                      alt="QRIS Preview" 
                      style={{ width: '100%', border: '2px solid var(--color-border)', borderRadius: '0.5rem' }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setQrisImageUrl('')
                        setImagePreview('')
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
                      <X size={16} />
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
                      Click to upload QRIS image
                    </span>
                    <span style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                      PNG, JPG up to 5MB
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      style={{ display: 'none' }}
                    />
                  </label>
                )}
              </div>
            </>
          )}
        </div>

        {/* Manual Transfer Settings */}
        <div className="surface mb-6" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <CreditCard size={24} style={{ color: 'var(--color-primary)' }} />
            <h2 className="text-xl font-semibold" style={{ color: 'var(--color-text)' }}>
              Manual Transfer
            </h2>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={manualEnabled}
                onChange={(e) => setManualEnabled(e.target.checked)}
                style={{ width: '1.25rem', height: '1.25rem' }}
              />
              <span style={{ color: 'var(--color-text)', fontWeight: 600 }}>
                Aktifkan transfer bank manual
              </span>
            </label>
          </div>

          {manualEnabled && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', color: 'var(--color-text)', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                    Nama Bank *
                  </label>
                  <input
                    type="text"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="Contoh: BCA"
                    style={{ width: '100%', padding: '0.75rem', background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: '0.5rem', color: 'var(--color-text)' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', color: 'var(--color-text)', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                    Nomor Rekening *
                  </label>
                  <input
                    type="text"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder="1234567890"
                    style={{ width: '100%', padding: '0.75rem', background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: '0.5rem', color: 'var(--color-text)' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', color: 'var(--color-text)', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                  Nama Pemilik Rekening *
                </label>
                <input
                  type="text"
                  value={accountHolder}
                  onChange={(e) => setAccountHolder(e.target.value)}
                  placeholder="Nama sesuai rekening"
                  style={{ width: '100%', padding: '0.75rem', background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: '0.5rem', color: 'var(--color-text)' }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', color: 'var(--color-text)', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                  Instruksi Pembayaran
                </label>
                <textarea
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  rows={4}
                  placeholder="Contoh: Transfer ke rekening di atas, lalu upload bukti transfer..."
                  style={{ width: '100%', padding: '0.75rem', background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: '0.5rem', color: 'var(--color-text)', resize: 'vertical' }}
                />
              </div>
            </>
          )}
        </div>

        {/* Save Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
          <Link href="/dashboard">
            <button className="btn-secondary" disabled={saving}>
              Batal
            </button>
          </Link>
          <button
            onClick={handleSave}
            className="btn-primary"
            disabled={saving}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Save size={18} />
            {saving ? 'Menyimpan...' : 'Simpan Pengaturan'}
          </button>
        </div>

        {/* Info Box */}
        <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '0.5rem' }}>
          <p style={{ color: 'var(--color-text)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
            <strong>💡 Tips:</strong>
          </p>
          <ul style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', paddingLeft: '1.5rem' }}>
            <li>Aktifkan minimal 1 metode pembayaran</li>
            <li>QRIS image akan ditampilkan ke mahasiswa saat pembayaran</li>
            <li>Nomor rekening manual akan ditampilkan untuk transfer bank</li>
            <li>Mahasiswa dapat memilih metode pembayaran yang diaktifkan</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
