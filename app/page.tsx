'use client'

import Image from 'next/image'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { FormEvent, useState } from 'react'
import { ArrowUpRight, Check, LockKeyhole } from 'lucide-react'
import { PasswordField } from '@/components/ui/password-field'

export default function HomePage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await signIn('credentials', { email, password, redirect: false })
      if (result?.error) {
        setError('Email, NIM, atau password belum tepat.')
        return
      }
      router.push('/dashboard')
      router.refresh()
    } catch {
      setError('Terjadi kesalahan. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="simple-login-page">
      <div className="login-shell">
        <section className="login-story" aria-label="Tentang KAS TI26A3">
          <Link href="/" className="login-wordmark">
            <span className="login-wordmark-icon"><Image src="/assets/logo-udb.png" alt="" width={38} height={38} priority /></span>
            <span><strong>KAS TI26A3</strong><small>Teknik Informatika · UDB</small></span>
          </Link>
          <div className="login-story-copy">
            <p className="login-overline">Administrasi kelas</p>
            <h1>Catatan kas yang jelas, untuk semua.</h1>
            <p>Iuran, pembayaran, dan saldo kelas tercatat dalam satu tempat yang mudah diikuti.</p>
            <div className="login-receipt" aria-label="Transparansi kas kelas">
              <div className="login-receipt-head"><span>RINGKASAN KELAS</span><span>TI26A3</span></div>
              <div className="login-receipt-line"><span><Check size={15} /> Tagihan tercatat</span><span>01</span></div>
              <div className="login-receipt-line"><span><Check size={15} /> Pembayaran terpantau</span><span>02</span></div>
              <div className="login-receipt-line"><span><Check size={15} /> Laporan dapat dilihat</span><span>03</span></div>
            </div>
          </div>
          <p className="login-story-foot">Universitas Duta Bangsa Surakarta</p>
        </section>

        <section className="login-form-side">
          <div className="simple-login-card">
            <div className="simple-login-heading">
              <p className="login-overline">Selamat datang kembali</p>
              <h2>Masuk ke akunmu</h2>
              <p>Gunakan email atau NIM yang terdaftar.</p>
            </div>

            <form onSubmit={handleSubmit} className="simple-login-form">
              {error && <p className="form-alert" role="alert">{error}</p>}
              <label>
                Email atau NIM
                <input className="input" type="text" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="nama@student.udb.ac.id" autoComplete="username" required disabled={loading} />
              </label>
              <PasswordField
                label="Password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Masukkan password"
                autoComplete="current-password"
                required
                disabled={loading}
              />
              <button className="simple-login-submit" type="submit" disabled={loading}>
                {loading ? 'Memproses...' : <>Masuk <ArrowUpRight size={17} /></>}
              </button>
            </form>

            <p className="simple-login-register">Belum punya akun? <Link href="/auth/register">Daftar</Link></p>
            <p className="login-secure-note"><LockKeyhole size={14} /> Akses akun hanya untuk anggota kelas.</p>
          </div>
          <p className="simple-login-footer">KAS TI26A3 <span>·</span> Universitas Duta Bangsa</p>
        </section>
      </div>
    </main>
  )
}
