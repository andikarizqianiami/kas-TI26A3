import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import StudentDashboard from '@/components/dashboard/StudentDashboard'
import AdminDashboard from '@/components/dashboard/AdminDashboard'

export default async function DashboardPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/auth/login')
  }

  // Redirect based on role
  if (session.user.role === 'MAHASISWA') {
    return <StudentDashboard />
  }

  if (session.user.role === 'ADMIN' || session.user.role === 'BENDAHARA') {
    return <AdminDashboard />
  }

  // Fallback
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Role tidak dikenali</h1>
        <p className="text-gray-600">Silakan hubungi administrator</p>
      </div>
    </div>
  )
}
