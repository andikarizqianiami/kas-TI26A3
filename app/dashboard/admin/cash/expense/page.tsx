'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Plus, TrendingDown, Edit2, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { formatCurrency, formatDate } from '@/lib/utils/format'

interface Expense {
  id: string
  amount: number
  description: string
  category: string
  date: string
}

const CATEGORIES = ['Konsumsi', 'Perlengkapan', 'Event', 'Lainnya']

export default function ExpenseManagementPage() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState(CATEGORIES[0])
  const [date, setDate] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    fetchExpenses()
    setDate(new Date().toISOString().split('T')[0])
  }, [])

  const fetchExpenses = async () => {
    try {
      const res = await fetch('/api/admin/cash/expense')
      if (res.ok) {
        const data = await res.json()
        setExpenses(data.expenses || [])
      }
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setAmount('')
    setDescription('')
    setCategory(CATEGORIES[0])
    setDate(new Date().toISOString().split('T')[0])
    setEditingId(null)
    setShowForm(false)
    setError('')
    setSuccess('')
  }

  const handleEdit = (expense: Expense) => {
    setEditingId(expense.id)
    setAmount(expense.amount.toString())
    setDescription(expense.description)
    setCategory(expense.category)
    setDate(new Date(expense.date).toISOString().split('T')[0])
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus pengeluaran ini?')) return
    try {
      const res = await fetch(`/api/admin/cash/expense/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setSuccess('Pengeluaran berhasil dihapus')
        fetchExpenses()
        setTimeout(() => setSuccess(''), 3000)
      }
    } catch (err) {
      setError('Terjadi kesalahan')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || parseInt(amount) <= 0) {
      setError('Jumlah harus lebih dari 0')
      return
    }
    setSubmitting(true)
    try {
      const url = editingId ? `/api/admin/cash/expense/${editingId}` : '/api/admin/cash/expense'
      const res = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: parseInt(amount), description, category, date: new Date(date) })
      })
      if (res.ok) {
        setSuccess(editingId ? 'Pengeluaran diupdate' : 'Pengeluaran ditambahkan')
        resetForm()
        fetchExpenses()
        setTimeout(() => setSuccess(''), 3000)
      }
    } catch (err) {
      setError('Terjadi kesalahan')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center" style={{background:'var(--color-bg)'}}><p style={{color:'var(--color-text-muted)'}}>Loading...</p></div>

  return (
    <div className="min-h-screen" style={{background:'var(--color-bg)',padding:'2rem'}}>
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <Link href="/dashboard/admin/cash" className="inline-flex items-center gap-2 mb-4" style={{color:'var(--color-primary)',fontSize:'0.875rem'}}>
            <ArrowLeft size={16}/> Kembali
          </Link>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold" style={{color:'var(--color-text)'}}>Kelola Pengeluaran</h1>
              <p style={{color:'var(--color-text-muted)',marginTop:'0.5rem'}}>Catat pengeluaran kas kelas</p>
            </div>
            <button onClick={()=>setShowForm(!showForm)} className="btn-primary" style={{display:'flex',alignItems:'center',gap:'0.5rem'}}>
              <Plus size={18}/> {showForm?'Tutup':'Tambah Pengeluaran'}
            </button>
          </div>
        </div>

        {error && <div style={{padding:'1rem',marginBottom:'1.5rem',background:'rgba(239,68,68,0.1)',border:'1px solid #ef4444',borderRadius:'0.5rem',color:'#ef4444'}}>{error}</div>}
        {success && <div style={{padding:'1rem',marginBottom:'1.5rem',background:'rgba(34,197,94,0.1)',border:'1px solid #22c55e',borderRadius:'0.5rem',color:'#22c55e'}}>{success}</div>}

        {showForm && (
          <form onSubmit={handleSubmit} className="surface mb-6" style={{padding:'1.5rem'}}>
            <h2 className="text-xl font-semibold mb-4" style={{color:'var(--color-text)'}}>{editingId?'Edit':'Tambah'} Pengeluaran</h2>
            <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:'1rem',marginBottom:'1rem'}}>
              <div>
                <label style={{display:'block',color:'var(--color-text)',fontWeight:600,marginBottom:'0.5rem',fontSize:'0.875rem'}}>Jumlah (Rp) *</label>
                <input type="number" value={amount} onChange={(e)=>setAmount(e.target.value)} required min="0" step="1000" style={{width:'100%',padding:'0.75rem',background:'var(--color-bg)',border:'1px solid var(--color-border)',borderRadius:'0.5rem',color:'var(--color-text)'}}/>
              </div>
              <div>
                <label style={{display:'block',color:'var(--color-text)',fontWeight:600,marginBottom:'0.5rem',fontSize:'0.875rem'}}>Tanggal *</label>
                <input type="date" value={date} onChange={(e)=>setDate(e.target.value)} required style={{width:'100%',padding:'0.75rem',background:'var(--color-bg)',border:'1px solid var(--color-border)',borderRadius:'0.5rem',color:'var(--color-text)'}}/>
              </div>
            </div>
            <div style={{marginBottom:'1rem'}}>
              <label style={{display:'block',color:'var(--color-text)',fontWeight:600,marginBottom:'0.5rem',fontSize:'0.875rem'}}>Kategori *</label>
              <select value={category} onChange={(e)=>setCategory(e.target.value)} required style={{width:'100%',padding:'0.75rem',background:'var(--color-bg)',border:'1px solid var(--color-border)',borderRadius:'0.5rem',color:'var(--color-text)'}}>
                {CATEGORIES.map(cat=><option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            <div style={{marginBottom:'1.5rem'}}>
              <label style={{display:'block',color:'var(--color-text)',fontWeight:600,marginBottom:'0.5rem',fontSize:'0.875rem'}}>Deskripsi *</label>
              <textarea value={description} onChange={(e)=>setDescription(e.target.value)} required rows={3} style={{width:'100%',padding:'0.75rem',background:'var(--color-bg)',border:'1px solid var(--color-border)',borderRadius:'0.5rem',color:'var(--color-text)',resize:'vertical'}}/>
            </div>
            <div style={{display:'flex',gap:'1rem',justifyContent:'flex-end'}}>
              <button type="button" onClick={resetForm} className="btn-secondary" disabled={submitting}>Batal</button>
              <button type="submit" className="btn-primary" disabled={submitting}>{submitting?'Menyimpan...':(editingId?'Update':'Simpan')}</button>
            </div>
          </form>
        )}

        <div className="surface" style={{padding:'1.5rem'}}>
          <h2 className="text-xl font-semibold mb-4" style={{color:'var(--color-text)'}}>Daftar Pengeluaran ({expenses.length})</h2>
          {expenses.length===0?<div style={{textAlign:'center',padding:'3rem',color:'var(--color-text-muted)'}}><TrendingDown size={48} style={{margin:'0 auto 1rem',opacity:0.3}}/><p>Belum ada data</p></div>:(
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{borderBottom:'1px solid var(--color-border)'}}>
                    <th className="text-left p-3" style={{color:'var(--color-text-muted)',fontSize:'0.875rem',fontWeight:600}}>Tanggal</th>
                    <th className="text-left p-3" style={{color:'var(--color-text-muted)',fontSize:'0.875rem',fontWeight:600}}>Deskripsi</th>
                    <th className="text-left p-3" style={{color:'var(--color-text-muted)',fontSize:'0.875rem',fontWeight:600}}>Kategori</th>
                    <th className="text-right p-3" style={{color:'var(--color-text-muted)',fontSize:'0.875rem',fontWeight:600}}>Jumlah</th>
                    <th className="text-center p-3" style={{color:'var(--color-text-muted)',fontSize:'0.875rem',fontWeight:600}}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map(exp=>(
                    <tr key={exp.id} style={{borderBottom:'1px solid var(--color-border)'}}>
                      <td className="p-3" style={{color:'var(--color-text-muted)',fontSize:'0.875rem'}}>{formatDate(exp.date,'dd MMM yyyy')}</td>
                      <td className="p-3" style={{color:'var(--color-text)'}}>{exp.description}</td>
                      <td className="p-3" style={{color:'var(--color-text-muted)',fontSize:'0.875rem'}}>{exp.category}</td>
                      <td className="p-3 text-right" style={{color:'#ef4444',fontWeight:600}}>-{formatCurrency(exp.amount)}</td>
                      <td className="p-3"><div style={{display:'flex',justifyContent:'center',gap:'0.5rem'}}>
                        <button onClick={()=>handleEdit(exp)} style={{padding:'0.5rem',color:'var(--color-primary)',background:'rgba(59,130,246,0.1)',borderRadius:'0.375rem',border:'none',cursor:'pointer'}}><Edit2 size={16}/></button>
                        <button onClick={()=>handleDelete(exp.id)} style={{padding:'0.5rem',color:'#ef4444',background:'rgba(239,68,68,0.1)',borderRadius:'0.375rem',border:'none',cursor:'pointer'}}><Trash2 size={16}/></button>
                      </div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
