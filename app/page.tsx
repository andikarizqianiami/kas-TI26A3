'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Check, ArrowRight } from 'lucide-react'

export default function HomePage() {
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
            <h1>CATATAN KAS UNTUK SENANG-SENANG</h1>
            <p>BILA TIDAK MEMBAYAR AKAN KAMI HAJAR DITEMPAT</p>
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
              <p className="login-overline">Selamat datang</p>
              <h2>Sistem Kas Kelas Digital</h2>
              <p>Kelola iuran dan pembayaran kelas dengan mudah dan transparan.</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '24px' }}>
              <Link href="/auth/login" className="simple-login-submit" style={{ textAlign: 'center', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                Masuk ke Akun <ArrowRight size={17} />
              </Link>
              
              <Link href="/auth/register" style={{ 
                textAlign: 'center', 
                padding: '12px', 
                border: '1.5px solid #2d5a45', 
                borderRadius: '8px', 
                color: '#2d5a45', 
                textDecoration: 'none',
                fontWeight: '600',
                transition: 'all 0.2s ease'
              }}>
                Daftar Akun Baru
              </Link>
            </div>

            <p className="simple-login-register" style={{ marginTop: '24px', textAlign: 'center' }}>
              <Link href="/auth/forgot-password" style={{ color: '#666', fontSize: '14px' }}>
                Lupa Password?
              </Link>
            </p>
          </div>
          <p className="simple-login-footer">KAS TI26A3 <span>·</span> Universitas Duta Bangsa</p>
        </section>
      </div>
    </main>
  )
}
