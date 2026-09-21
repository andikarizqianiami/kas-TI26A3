import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import Link from 'next/link'
import { ArrowLeft, FileText } from 'lucide-react'

export default async function ReportsPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/auth/login')
  }

  if (!['ADMIN', 'BENDAHARA'].includes(session.user.role)) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg)', padding: '2rem' }}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <Link 
            href="/dashboard" 
            className="inline-flex items-center gap-2 mb-4" 
            style={{ color: 'var(--color-primary)', fontSize: '0.875rem' }}
          >
            <ArrowLeft size={16} /> Kembali ke Dashboard
          </Link>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--color-text)' }}>
            Laporan Keuangan
          </h1>
          <p style={{ color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>
            Lihat dan download laporan keuangan kas kelas
          </p>
        </div>

        <div className="surface" style={{ padding: '2rem', textAlign: 'center' }}>
          <FileText size={48} style={{ margin: '0 auto 1rem', opacity: 0.3, color: 'var(--color-text-muted)' }} />
          <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--color-text)' }}>
            Fitur Laporan
          </h2>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
            Halaman ini akan menampilkan laporan bulanan, tahunan, dan export ke PDF/Excel.
          </p>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
            Status: Under Development
          </p>
        </div>
      </div>
    </div>
  )
}
