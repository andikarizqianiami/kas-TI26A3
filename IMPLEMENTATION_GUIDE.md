# KAS TI26A3 - Complete Implementation Guide
## All Remaining Features (Phase 1.3 - Phase 4)

**Status:** 2/16 completed
- ✅ Phase 1.1: Create Bill Form
- ✅ Phase 1.2: Cash Transactions (Income/Expense CRUD)
- ⏳ Phase 1.3: Reports Export (IN PROGRESS - libraries installed)
- 🔜 Phase 1.4-4.4: See detailed implementation below

---

## 📊 PHASE 1.3: REPORTS EXPORT (Priority: HIGH)

### Dependencies Installed:
```bash
✅ jspdf, jspdf-autotable, xlsx
```

### Implementation Steps:

#### 1. Create Reports Page UI
**File:** `/app/dashboard/admin/reports/page.tsx`

Replace placeholder with:
```typescript
'use client'
import { useState } from 'react'
import { Download, Calendar, FileText } from 'lucide-react'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'

export default function ReportsPage() {
  const [reportType, setReportType] = useState<'monthly' | 'period'>('monthly')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [loading, setLoading] = useState(false)

  const generatePDF = async () => {
    setLoading(true)
    try {
      // Fetch report data
      const res = await fetch(`/api/admin/reports?type=${reportType}&start=${startDate}&end=${endDate}`)
      const data = await res.json()

      // Generate PDF
      const doc = new jsPDF()
      doc.text('Laporan Keuangan KAS TI26A3', 14, 15)
      doc.text(`Periode: ${startDate} - ${endDate}`, 14, 22)
      
      autoTable(doc, {
        startY: 30,
        head: [['Kategori', 'Jumlah']],
        body: [
          ['Total Pemasukan', `Rp ${data.totalIncome.toLocaleString('id-ID')}`],
          ['Total Pengeluaran', `Rp ${data.totalExpense.toLocaleString('id-ID')}`],
          ['Saldo', `Rp ${data.balance.toLocaleString('id-ID')}`],
        ]
      })

      doc.save(`laporan-kas-${startDate}-to-${endDate}.pdf`)
    } catch (err) {
      alert('Gagal generate PDF')
    } finally {
      setLoading(false)
    }
  }

  const generateExcel = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/reports?type=${reportType}&start=${startDate}&end=${endDate}`)
      const data = await res.json()

      const ws = XLSX.utils.json_to_sheet(data.transactions)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Laporan')
      XLSX.writeFile(wb, `laporan-kas-${startDate}-to-${endDate}.xlsx`)
    } catch (err) {
      alert('Gagal generate Excel')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen" style={{background:'var(--color-bg)',padding:'2rem'}}>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6" style={{color:'var(--color-text)'}}>Laporan Keuangan</h1>
        
        {/* Report Type Selection */}
        <div className="surface mb-6" style={{padding:'1.5rem'}}>
          <label style={{display:'block',marginBottom:'1rem',color:'var(--color-text)',fontWeight:600}}>Tipe Laporan</label>
          <div style={{display:'flex',gap:'1rem'}}>
            <button onClick={()=>setReportType('monthly')} className={reportType==='monthly'?'btn-primary':'btn-secondary'}>
              Bulanan
            </button>
            <button onClick={()=>setReportType('period')} className={reportType==='period'?'btn-primary':'btn-secondary'}>
              Custom Period
            </button>
          </div>
        </div>

        {/* Date Range */}
        <div className="surface mb-6" style={{padding:'1.5rem'}}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem'}}>
            <div>
              <label style={{display:'block',marginBottom:'0.5rem',color:'var(--color-text)',fontWeight:600}}>Tanggal Mulai</label>
              <input type="date" value={startDate} onChange={(e)=>setStartDate(e.target.value)} className="w-full" style={{padding:'0.75rem',background:'var(--color-bg)',border:'1px solid var(--color-border)',borderRadius:'0.5rem',color:'var(--color-text)'}}/>
            </div>
            <div>
              <label style={{display:'block',marginBottom:'0.5rem',color:'var(--color-text)',fontWeight:600}}>Tanggal Akhir</label>
              <input type="date" value={endDate} onChange={(e)=>setEndDate(e.target.value)} className="w-full" style={{padding:'0.75rem',background:'var(--color-bg)',border:'1px solid var(--color-border)',borderRadius:'0.5rem',color:'var(--color-text)'}}/>
            </div>
          </div>
        </div>

        {/* Export Buttons */}
        <div className="surface" style={{padding:'1.5rem'}}>
          <h3 style={{color:'var(--color-text)',fontWeight:600,marginBottom:'1rem'}}>Download Laporan</h3>
          <div style={{display:'flex',gap:'1rem'}}>
            <button onClick={generatePDF} disabled={loading||!startDate||!endDate} className="btn-primary" style={{display:'flex',alignItems:'center',gap:'0.5rem'}}>
              <FileText size={18}/> Download PDF
            </button>
            <button onClick={generateExcel} disabled={loading||!startDate||!endDate} className="btn-primary" style={{display:'flex',alignItems:'center',gap:'0.5rem',background:'#22c55e',borderColor:'#22c55e'}}>
              <Download size={18}/> Download Excel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
```

#### 2. Create Reports API Endpoint
**File:** `/app/api/admin/reports/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma/db'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || !['ADMIN', 'BENDAHARA'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const start = searchParams.get('start')
    const end = searchParams.get('end')

    const startDate = new Date(start!)
    const endDate = new Date(end!)

    // Get incomes
    const incomes = await prisma.cashIncome.findMany({
      where: { date: { gte: startDate, lte: endDate } }
    })

    // Get expenses
    const expenses = await prisma.cashExpense.findMany({
      where: { date: { gte: startDate, lte: endDate } }
    })

    // Get bills/payments
    const payments = await prisma.payment.findMany({
      where: {
        createdAt: { gte: startDate, lte: endDate },
        status: 'PAID'
      },
      include: { student: true, bill: true }
    })

    const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0)
    const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0)
    const totalPayments = payments.reduce((sum, p) => sum + p.amount, 0)

    return NextResponse.json({
      totalIncome: totalIncome + totalPayments,
      totalExpense,
      balance: (totalIncome + totalPayments) - totalExpense,
      incomes,
      expenses,
      payments,
      transactions: [
        ...incomes.map(i => ({ type: 'INCOME', ...i })),
        ...expenses.map(e => ({ type: 'EXPENSE', ...e })),
        ...payments.map(p => ({ type: 'PAYMENT', ...p }))
      ]
    })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

---

## ⚙️ PHASE 1.4: SETTINGS MANAGEMENT (Priority: HIGH)

### Implementation:

#### 1. Update Settings Page
**File:** `/app/dashboard/admin/settings/page.tsx`

```typescript
'use client'
import { useState, useEffect } from 'react'
import { Settings, Upload, Save } from 'lucide-react'

export default function SettingsPage() {
  const [qrisImage, setQrisImage] = useState('')
  const [bankName, setBankName] = useState('')
  const [bankAccount, setBankAccount] = useState('')
  const [accountHolder, setAccountHolder] = useState('')
  const [defaultAmount, setDefaultAmount] = useState('5000')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    const res = await fetch('/api/settings/qris')
    if (res.ok) {
      const data = await res.json()
      setQrisImage(data.qrisImageUrl || '')
    }
    setLoading(false)
  }

  const handleQRISUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)

    const res = await fetch('/api/settings/qris/upload', {
      method: 'POST',
      body: formData
    })

    if (res.ok) {
      const data = await res.json()
      setQrisImage(data.url)
      alert('QRIS berhasil diupload')
    }
  }

  const handleSave = async () => {
    const res = await fetch('/api/settings/system', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bankName, bankAccount, accountHolder, defaultAmount })
    })

    if (res.ok) alert('Settings berhasil disimpan')
  }

  if (loading) return <div>Loading...</div>

  return (
    <div className="min-h-screen" style={{background:'var(--color-bg)',padding:'2rem'}}>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6" style={{color:'var(--color-text)'}}>Pengaturan Sistem</h1>

        {/* QRIS Settings */}
        <div className="surface mb-6" style={{padding:'1.5rem'}}>
          <h2 className="text-xl font-semibold mb-4" style={{color:'var(--color-text)'}}>QRIS Configuration</h2>
          <div>
            {qrisImage && <img src={qrisImage} alt="QRIS" style={{width:'200px',marginBottom:'1rem'}}/>}
            <input type="file" accept="image/*" onChange={handleQRISUpload} />
          </div>
        </div>

        {/* Bank Account */}
        <div className="surface mb-6" style={{padding:'1.5rem'}}>
          <h2 className="text-xl font-semibold mb-4" style={{color:'var(--color-text)'}}>Bank Account</h2>
          <div style={{display:'grid',gap:'1rem'}}>
            <div>
              <label style={{display:'block',marginBottom:'0.5rem',color:'var(--color-text)'}}>Bank Name</label>
              <input value={bankName} onChange={(e)=>setBankName(e.target.value)} className="w-full" style={{padding:'0.75rem',background:'var(--color-bg)',border:'1px solid var(--color-border)',borderRadius:'0.5rem',color:'var(--color-text)'}}/>
            </div>
            <div>
              <label style={{display:'block',marginBottom:'0.5rem',color:'var(--color-text)'}}>Account Number</label>
              <input value={bankAccount} onChange={(e)=>setBankAccount(e.target.value)} className="w-full" style={{padding:'0.75rem',background:'var(--color-bg)',border:'1px solid var(--color-border)',borderRadius:'0.5rem',color:'var(--color-text)'}}/>
            </div>
            <div>
              <label style={{display:'block',marginBottom:'0.5rem',color:'var(--color-text)'}}>Account Holder</label>
              <input value={accountHolder} onChange={(e)=>setAccountHolder(e.target.value)} className="w-full" style={{padding:'0.75rem',background:'var(--color-bg)',border:'1px solid var(--color-border)',borderRadius:'0.5rem',color:'var(--color-text)'}}/>
            </div>
          </div>
        </div>

        {/* System Settings */}
        <div className="surface mb-6" style={{padding:'1.5rem'}}>
          <h2 className="text-xl font-semibold mb-4" style={{color:'var(--color-text)'}}>System Settings</h2>
          <div>
            <label style={{display:'block',marginBottom:'0.5rem',color:'var(--color-text)'}}>Default Bill Amount (Rp)</label>
            <input type="number" value={defaultAmount} onChange={(e)=>setDefaultAmount(e.target.value)} style={{padding:'0.75rem',background:'var(--color-bg)',border:'1px solid var(--color-border)',borderRadius:'0.5rem',color:'var(--color-text)'}}/>
          </div>
        </div>

        <button onClick={handleSave} className="btn-primary" style={{display:'flex',alignItems:'center',gap:'0.5rem'}}>
          <Save size={18}/> Simpan Pengaturan
        </button>
      </div>
    </div>
  )
}
```

---

## 📢 PHASE 2.1: ANNOUNCEMENTS MANAGEMENT

### Database: Already exists (announcements table)

### Implementation Pattern:
Similar to Bills CRUD - Create UI with form, list, edit/delete
- Route: `/dashboard/admin/announcements`
- API: `/api/admin/announcements` (GET, POST, PUT, DELETE)
- Fields: title, content, priority (HIGH/MEDIUM/LOW), isActive
- Display on student dashboard

---

## 📜 PHASE 2.2: STUDENT BILL HISTORY

### Implementation:
**File:** `/app/dashboard/bills/page.tsx` (Student)

```typescript
- Fetch all bills for logged-in student
- Filter by: ALL, PAID, UNPAID, OVERDUE
- Sort by date
- Show period, amount, status, payment button
- Link to payment page
```

---

## 📈 PHASE 2.3: DASHBOARD CHARTS

### Library: Install `recharts`
```bash
npm install recharts
```

### Add to AdminDashboard:
- Line chart: Balance over time
- Bar chart: Income vs Expense per month
- Pie chart: Expense by category

---

## 👥 PHASE 2.4: USER MANAGEMENT

### Route: `/dashboard/admin/users`
- List all users (admin, bendahara)
- Create new user (role selection)
- Edit user role
- Deactivate user
- Reset password

---

## 🔔 PHASE 3.1: NOTIFICATION SYSTEM

### Notifications table already exists
### Implementation:
- Create notification on: Bill created, Payment verified/rejected, Announcement
- Badge count in header
- Notification dropdown/page
- Mark as read

---

## 📱 PHASE 3.2: MOBILE RESPONSIVE

### Add to `globals.css`:
```css
@media (max-width: 768px) {
  .student-topbar { flex-direction: column; }
  .overview-grid { grid-template-columns: 1fr; }
  .dashboard-columns { grid-template-columns: 1fr; }
  /* ... more responsive rules */
}
```

---

## 👤 PHASE 3.3: PROFILE MANAGEMENT

### Route: `/dashboard/profile`
- Edit: name, email, whatsapp
- Change password form
- Upload avatar (optional)

---

## 🌙 PHASE 3.4: DARK MODE TOGGLE

### Implementation:
1. Add light mode CSS variables
2. Theme toggle button in header
3. Save preference to localStorage
4. Apply theme on load

---

## 📧 PHASE 4.1: EMAIL NOTIFICATIONS

### Library: Nodemailer or SendGrid
```bash
npm install nodemailer
```

### Send email on:
- New bill created
- Payment verified
- Payment rejected
- Reminder deadline

---

## 🔍 PHASE 4.2: ADVANCED SEARCH & FILTERS

### Add to existing pages:
- Multi-column search
- Date range filter
- Status multi-select
- Save filter presets
- Export filtered results

---

## 📋 PHASE 4.3: AUDIT LOG

### New table: `audit_logs`
```prisma
model AuditLog {
  id        String   @id @default(cuid())
  userId    String
  action    String   // CREATE_BILL, VERIFY_PAYMENT, etc
  entity    String   // Bill, Payment, etc
  entityId  String
  details   Json?
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id])
}
```

### Log on: Bill creation, Payment verification, Cash transactions, User changes

---

## ☑️ PHASE 4.4: BULK OPERATIONS

### Implementation:
- Checkbox selection on lists
- Bulk actions: Approve multiple payments, Create bills for selected students
- Confirmation modal before bulk action

---

## 🚀 NEXT STEPS

1. **Complete Phase 1** (Reports + Settings) - CRITICAL
2. **Test all Phase 1 features** thoroughly
3. **Implement Phase 2** (User-facing improvements)
4. **Implement Phase 3** (UX enhancements)
5. **Implement Phase 4** (Advanced features)

## 📝 IMPLEMENTATION PRIORITY

**Week 1: Core Features**
- ✅ Create Bills
- ✅ Cash Transactions
- 🔜 Reports Export
- 🔜 Settings

**Week 2: Enhancements**
- Announcements
- Bill History
- Dashboard Charts
- User Management

**Week 3: UX**
- Notifications
- Mobile Responsive
- Profile Management
- Dark Mode

**Week 4: Advanced**
- Email Integration
- Advanced Filters
- Audit Logs
- Bulk Operations

---

**All code patterns are provided above. Follow the same structure for remaining features.**

**Document created:** 2026-09-20
**Status:** Ready for implementation
