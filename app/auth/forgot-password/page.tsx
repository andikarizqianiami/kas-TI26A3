'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, CheckCircle2, LoaderCircle } from 'lucide-react'
import { FormEvent, useState } from 'react'
import styles from './forgot-password.module.css'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      if (response.ok) {
        setSuccess(true)
        setEmail('')
      } else {
        const data = await response.json()
        setError(data.error || 'Terjadi kesalahan. Silakan coba lagi.')
      }
    } catch {
      setError('Terjadi kesalahan. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        {/* Logo UDB */}
        <div className={styles.logoContainer}>
          <Image
            src="/assets/logo-udb.png"
            alt="Logo Universitas Duta Bangsa"
            width={80}
            height={80}
            priority
          />
        </div>

        {/* Heading */}
        <div className={styles.heading}>
          <h1>Reset Password</h1>
          <p>Masukkan email Anda untuk menerima instruksi reset password</p>
        </div>

        {/* Success Message */}
        {success && (
          <div className={styles.successMessage}>
            <CheckCircle2 size={17} />
            Link reset password telah dikirim ke email Anda. Silakan cek inbox atau folder spam.
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className={styles.errorMessage} role="alert">
            {error}
          </div>
        )}

        {!success && (
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                placeholder="Masukkan email Anda"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className={styles.input}
              />
            </div>

            <button
              type="submit"
              className={styles.submitButton}
              disabled={loading}
            >
              {loading ? (
                <>
                  <LoaderCircle className={styles.spinner} size={18} />
                  Mengirim...
                </>
              ) : (
                'Kirim Link Reset'
              )}
            </button>
          </form>
        )}

        {/* Footer Links */}
        <div className={styles.footer}>
          <Link href="/auth/login" className={styles.backLink}>
            <ArrowLeft size={16} />
            Kembali ke Login
          </Link>
        </div>
      </div>
    </div>
  )
}
