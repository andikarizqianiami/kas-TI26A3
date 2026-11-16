'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { AlertCircle, ArrowLeft } from 'lucide-react'
import { Suspense } from 'react'

function ErrorContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  const errorMessages: { [key: string]: string } = {
    Configuration: 'Ada masalah dengan konfigurasi server.',
    AccessDenied: 'Akses ditolak. Anda tidak memiliki izin untuk mengakses halaman ini.',
    Verification: 'Link verifikasi tidak valid atau sudah kadaluarsa.',
    OAuthSignin: 'Gagal memulai proses signin.',
    OAuthCallback: 'Gagal memproses callback OAuth.',
    OAuthCreateAccount: 'Gagal membuat akun OAuth.',
    EmailCreateAccount: 'Gagal membuat akun dengan email.',
    Callback: 'Gagal memproses callback.',
    OAuthAccountNotLinked: 'Email sudah terdaftar dengan metode login lain.',
    EmailSignin: 'Gagal mengirim email signin.',
    CredentialsSignin: 'Email/NIM atau password salah. Silakan coba lagi.',
    SessionRequired: 'Silakan login untuk mengakses halaman ini.',
    Default: 'Terjadi kesalahan. Silakan coba lagi.',
  }

  const message = errorMessages[error || 'Default'] || errorMessages.Default

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
        maxWidth: '500px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        textAlign: 'center'
      }}>
        {/* Logo UDB */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
          <Image
            src="/assets/logo-udb.png"
            alt="Logo Universitas Duta Bangsa"
            width={60}
            height={60}
            priority
          />
        </div>

        {/* Error Icon */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          marginBottom: '24px' 
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: '#fee',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <AlertCircle size={40} style={{ color: '#dc3545' }} />
          </div>
        </div>

        {/* Heading */}
        <h1 style={{ 
          fontSize: '24px', 
          fontWeight: '700', 
          color: '#1a1a1a', 
          margin: '0 0 12px 0' 
        }}>
          Gagal Masuk
        </h1>

        {/* Error Message */}
        <p style={{ 
          fontSize: '15px', 
          color: '#666', 
          margin: '0 0 32px 0',
          lineHeight: '1.6'
        }}>
          {message}
        </p>

        {/* Debug Info (hanya untuk development) */}
        {process.env.NODE_ENV === 'development' && error && (
          <div style={{
            background: '#f8f9fa',
            border: '1px solid #dee2e6',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '24px',
            fontSize: '13px',
            color: '#6c757d',
            textAlign: 'left'
          }}>
            <strong>Error Code:</strong> {error}
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '12px' 
        }}>
          <Link
            href="/auth/login"
            style={{
              padding: '14px 24px',
              fontSize: '16px',
              fontWeight: '600',
              color: 'white',
              background: '#2d5a45',
              border: 'none',
              borderRadius: '8px',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s ease'
            }}
          >
            <ArrowLeft size={18} />
            Kembali ke Login
          </Link>

          <Link
            href="/"
            style={{
              padding: '14px 24px',
              fontSize: '16px',
              fontWeight: '600',
              color: '#2d5a45',
              background: 'white',
              border: '1.5px solid #2d5a45',
              borderRadius: '8px',
              textDecoration: 'none',
              display: 'block',
              transition: 'all 0.2s ease'
            }}
          >
            Kembali ke Beranda
          </Link>
        </div>

        {/* Help Text */}
        <p style={{ 
          fontSize: '13px', 
          color: '#999', 
          margin: '24px 0 0 0' 
        }}>
          Jika masalah berlanjut, hubungi admin kelas.
        </p>
      </div>
    </div>
  )
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1e3a2e 0%, #2d5a45 100%)'
      }}>
        <div style={{ color: 'white' }}>Loading...</div>
      </div>
    }>
      <ErrorContent />
    </Suspense>
  )
}
