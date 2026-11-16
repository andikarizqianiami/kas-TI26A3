'use client'

import Image from 'next/image'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CheckCircle2, LoaderCircle, Eye, EyeOff } from 'lucide-react'
import { FormEvent, useState, Suspense } from 'react'
import styles from './login.module.css'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false
      })

      if (result?.error) {
        setError('Email, NIM, atau password belum tepat.')
      } else {
        router.push('/dashboard')
        router.refresh()
      }
    } catch {
      setError('Terjadi kesalahan. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginCard}>
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
          <h1>Masuk ke Akun</h1>
          <p>Sistem Kas Kelas TI26A3</p>
        </div>

        {/* Success Message */}
        {searchParams.get('registered') === 'true' && (
          <div className={styles.successMessage}>
            <CheckCircle2 size={17} />
            Akun berhasil dibuat. Silakan masuk.
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className={styles.errorMessage} role="alert">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Email atau NIM */}
          <div className={styles.formGroup}>
            <label htmlFor="email">Email atau NIM</label>
            <input
              id="email"
              type="text"
              placeholder="Masukkan email atau NIM"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              autoComplete="username"
              className={styles.input}
            />
          </div>

          {/* Password */}
          <div className={styles.formGroup}>
            <label htmlFor="password">Password</label>
            <div className={styles.passwordWrapper}>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Masukkan password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                autoComplete="current-password"
                className={styles.input}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={styles.togglePassword}
                aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Tombol Masuk */}
          <button
            type="submit"
            className={styles.submitButton}
            disabled={loading}
          >
            {loading ? (
              <>
                <LoaderCircle className={styles.spinner} size={18} />
                Memproses...
              </>
            ) : (
              'Masuk'
            )}
          </button>
        </form>

        {/* Footer Links */}
        <div className={styles.footer}>
          <Link href="/auth/forgot-password" className={styles.forgotPassword}>
            Lupa Password / Reset Password
          </Link>
          
          <p className={styles.registerLink}>
            Belum punya akun? <Link href="/auth/register">Daftar</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginForm />
    </Suspense>
  )
}
