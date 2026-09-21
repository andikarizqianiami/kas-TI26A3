'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FormEvent, useState } from 'react'
import { ArrowLeft, CheckCircle2, LoaderCircle } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ name: '', nim: '', email: '', whatsapp: '', password: '', confirmPassword: '' })
  const update = (field: keyof typeof form, value: string) => setForm((current) => ({ ...current, [field]: value }))
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError('')
    if (form.password.length < 6) return setError('Password minimal terdiri dari 6 karakter.')
    if (form.password !== form.confirmPassword) return setError('Konfirmasi password belum sesuai.')
    setLoading(true)
    try {
      const response = await fetch('/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      const result = await response.json()
      if (!response.ok) return setError(result.error || 'Pendaftaran belum berhasil. Silakan coba lagi.')
      router.push('/auth/login?registered=true')
    } catch { setError('Tidak dapat terhubung ke server. Silakan coba lagi.') } finally { setLoading(false) }
  }
  return <main className="auth-page"><section className="auth-panel auth-intro"><Link href="/" className="auth-back"><ArrowLeft size={16} /> Kembali ke beranda</Link><div className="auth-intro-content"><span className="auth-logo"><Image src="/assets/logo-udb.png" alt="Logo Universitas Duta Bangsa" width={72} height={72} priority /></span><p className="auth-eyebrow">KAS TI26A3</p><h1>Kelola iuran bersama, dengan lebih mudah.</h1><p>Daftar sebagai mahasiswa TI26A3 untuk melihat tagihan, mengirim bukti pembayaran, dan mengikuti informasi kas kelas.</p><ul><li><CheckCircle2 size={18} /> Status pembayaran yang mudah dipantau</li><li><CheckCircle2 size={18} /> Bukti pembayaran tersimpan rapi</li><li><CheckCircle2 size={18} /> Informasi langsung dari bendahara</li></ul></div></section><section className="auth-form-wrap"><div className="auth-form-card"><div className="auth-mobile-brand"><Image src="/assets/logo-udb.png" alt="" width={38} height={38} /><strong>KAS TI26A3</strong></div><div className="auth-heading"><h2>Buat akun</h2><p>Lengkapi data berikut untuk bergabung.</p></div><form onSubmit={handleSubmit} className="register-form">{error && <div className="form-alert" role="alert">{error}</div>}<label>Nama lengkap<input className="input" value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="Nama sesuai daftar kelas" required disabled={loading} /></label><div className="form-columns"><label>NIM<input className="input" value={form.nim} onChange={(e) => update('nim', e.target.value)} placeholder="Contoh: 2026010001" required disabled={loading} /></label><label>Nomor WhatsApp <span>(opsional)</span><input className="input" value={form.whatsapp} onChange={(e) => update('whatsapp', e.target.value)} placeholder="08xxxxxxxxxx" disabled={loading} /></label></div><label>Email kampus<input type="email" className="input" value={form.email} onChange={(e) => update('email', e.target.value)} placeholder="nama@student.udb.ac.id" required disabled={loading} /></label><div className="form-columns"><label>Password<input type="password" className="input" value={form.password} onChange={(e) => update('password', e.target.value)} placeholder="Minimal 6 karakter" required disabled={loading} /></label><label>Konfirmasi password<input type="password" className="input" value={form.confirmPassword} onChange={(e) => update('confirmPassword', e.target.value)} placeholder="Ulangi password" required disabled={loading} /></label></div><button type="submit" className="button button-primary auth-submit" disabled={loading}>{loading ? <><LoaderCircle className="spin" size={17} /> Membuat akun...</> : 'Buat akun'}</button></form><p className="auth-switch">Sudah punya akun? <Link href="/auth/login">Masuk di sini</Link></p></div></section></main>
}
