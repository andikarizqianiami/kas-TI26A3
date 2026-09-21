'use client'

import Image from 'next/image'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { FormEvent, useState } from 'react'

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
      <section className="simple-login-card">
        <div className="simple-login-brand">
          <Image src="/assets/logo-udb.png" alt="Logo Universitas Duta Bangsa" width={54} height={54} priority />
          <div>
            <h1>KAS TI26A3</h1>
            <p>Sistem Kas Kelas</p>
          </div>
        </div>

        <div className="simple-login-heading">
          <h2>Masuk</h2>
          <p>Gunakan akun yang sudah terdaftar.</p>
        </div>

        <form onSubmit={handleSubmit} className="simple-login-form">
          {error && <p className="form-alert" role="alert">{error}</p>}
          <label>
            Email atau NIM
            <input className="input" type="text" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email atau NIM" autoComplete="username" required disabled={loading} />
          </label>
          <label>
            Password
            <input className="input" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Password" autoComplete="current-password" required disabled={loading} />
          </label>
          <button className="simple-login-submit" type="submit" disabled={loading}>
            {loading ? 'Memproses...' : 'Masuk'}
          </button>
        </form>

        <p className="simple-login-register">Belum punya akun? <Link href="/auth/register">Daftar</Link></p>
      </section>
      <p className="simple-login-footer">Teknik Informatika · Universitas Duta Bangsa Surakarta</p>
    </main>
  )
}
