'use client'

import Image from 'next/image'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CheckCircle2, LoaderCircle, Eye, EyeOff } from 'lucide-react'
import { FormEvent, useState, Suspense } from 'react'

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
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #1e3a2e 0%, #2d5a45 100%)',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '48px 40px',
        width: '100%',
        maxWidth: '440px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
      }}>
        {/* Logo UDB */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '32px' }}>
          <Image
            src="/assets/logo-udb.png"
            alt="Logo Universitas Duta Bangsa"
            width={80}
            height={80}
            priority
          />
        </div>

        {/* Heading */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#1a1a1a', margin: '0 0 8px 0' }}>
            Masuk ke Akun
          </h1>
          <p style={{ fontSize: '15px', color: '#666', margin: 0 }}>
            Sistem Kas Kelas TI26A3 - UDB
          </p>
        </div>

        {/* Success Message */}
        {searchParams.get('registered') === 'true' && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 16px',
            background: '#d4edda',
            color: '#155724',
            borderRadius: '8px',
            fontSize: '14px',
            marginBottom: '24px'
          }}>
            <CheckCircle2 size={17} />
            Akun berhasil dibuat. Silakan masuk.
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div style={{
            padding: '12px 16px',
            background: '#f8d7da',
            color: '#721c24',
            borderRadius: '8px',
            fontSize: '14px',
            marginBottom: '24px',
            border: '1px solid #f5c6cb'
          }} role="alert">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Email atau NIM */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label htmlFor="email" style={{ fontSize: '14px', fontWeight: '600', color: '#333' }}>
              Email atau NIM
            </label>
            <input
              id="email"
              type="text"
              placeholder="Masukkan email atau NIM"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              autoComplete="username"
              style={{
                padding: '12px 16px',
                fontSize: '15px',
                border: '1.5px solid #ddd',
                borderRadius: '8px',
                width: '100%',
                transition: 'all 0.2s ease'
              }}
            />
          </div>

          {/* Password */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label htmlFor="password" style={{ fontSize: '14px', fontWeight: '600', color: '#333' }}>
              Password
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Masukkan password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                autoComplete="current-password"
                style={{
                  padding: '12px 48px 12px 16px',
                  fontSize: '15px',
                  border: '1.5px solid #ddd',
                  borderRadius: '8px',
                  width: '100%',
                  transition: 'all 0.2s ease'
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  background: 'none',
                  border: 'none',
                  color: '#666',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Tombol Masuk */}
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '14px 24px',
              fontSize: '16px',
              fontWeight: '600',
              color: 'white',
              background: loading ? '#999' : '#2d5a45',
              border: 'none',
              borderRadius: '8px',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              marginTop: '8px',
              transition: 'all 0.2s ease'
            }}
          >
            {loading ? (
              <>
                <LoaderCircle style={{ animation: 'spin 1s linear infinite' }} size={18} />
                Memproses...
              </>
            ) : (
              'Masuk'
            )}
          </button>
        </form>

        {/* Footer Links */}
        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <Link
            href="/auth/forgot-password"
            style={{
              display: 'inline-block',
              fontSize: '14px',
              color: '#2d5a45',
              textDecoration: 'none',
              fontWeight: '500',
              marginBottom: '16px'
            }}
          >
            Lupa Password / Reset Password
          </Link>
          
          <p style={{ fontSize: '14px', color: '#666', margin: '16px 0 0 0' }}>
            Belum punya akun?{' '}
            <Link
              href="/auth/register"
              style={{
                color: '#2d5a45',
                textDecoration: 'none',
                fontWeight: '600'
              }}
            >
              Daftar
            </Link>
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
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
