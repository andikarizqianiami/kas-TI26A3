import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import AdminStudentsClient from './client'

export default async function AdminStudentsPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/auth/login')
  }

  if (session.user.role !== 'ADMIN') {
    redirect('/dashboard')
  }

  return <AdminStudentsClient />
}
