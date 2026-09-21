# KAS TI26A3 - Testing Checklist

## ✅ Server Status
- **URL:** http://localhost:3000
- **Status:** Running (No errors)
- **Database:** Seeded with 30 students + demo data

---

## 🧪 TESTING PROCEDURES

### 1. AUTHENTICATION TEST

#### Test Login Mahasiswa
- [ ] Go to `/auth/login`
- [ ] Enter NIM: `2026010001`
- [ ] Enter Password: `mahasiswa123`
- [ ] Click "Login"
- [ ] **Expected:** Redirect to `/dashboard` (Student Dashboard)

#### Test Login Admin
- [ ] Logout from current account
- [ ] Go to `/auth/login`
- [ ] Enter Email: `admin@kas-ti26a3.test`
- [ ] Enter Password: `admin123`
- [ ] Click "Login"
- [ ] **Expected:** Redirect to `/dashboard` (Admin Dashboard)

#### Test Login Bendahara
- [ ] Logout from current account
- [ ] Go to `/auth/login`
- [ ] Enter Email: `bendahara@kas-ti26a3.test`
- [ ] Enter Password: `bendahara123`
- [ ] Click "Login"
- [ ] **Expected:** Redirect to `/dashboard` (Admin Dashboard - same as admin)

---

### 2. MAHASISWA DASHBOARD TEST

**Login as:** `2026010001` / `mahasiswa123`

#### Dashboard Features
- [ ] See greeting: "Halo, Ahmad" (first name)
- [ ] View NIM and Class (TI26A3 · 2026010001)
- [ ] View current date
- [ ] See "Tagihan minggu ini" card
- [ ] Check if status shows "Belum dibayar" (UNPAID bill exists)
- [ ] See "Bayar sekarang" button (if UNPAID)
- [ ] View class balance (Saldo kas kelas)
- [ ] See payment statistics (Total pembayaran, Perlu diperhatikan, Total tagihan)
- [ ] View payment history (Riwayat pembayaran)
- [ ] View announcements (Pengumuman kelas)

#### Payment Flow Test
- [ ] Click "Bayar sekarang" button
- [ ] **Expected:** Navigate to `/dashboard/payment/[billId]`
- [ ] See payment form with:
  - Bill name and amount
  - Payment date and time (pre-filled)
  - Payment method selection (QRIS/Transfer)
  - QRIS QR Code display (if QRIS selected)
  - File upload for proof (JPG/PNG, max 5MB)
  - Notes textarea
  - Submit button
- [ ] Upload a screenshot/image as payment proof
- [ ] Fill optional notes
- [ ] Click "Submit Pembayaran"
- [ ] **Expected:** Success message, redirect to dashboard, status = PENDING_VERIFICATION

#### Navigation Test
- [ ] Click notification badge (if exists)
- [ ] Click profile avatar
- [ ] Click "Keluar" button
- [ ] **Expected:** Logout and redirect to login page

---

### 3. ADMIN/BENDAHARA DASHBOARD TEST

**Login as:** `admin@kas-ti26a3.test` / `admin123`

#### Main Dashboard
- [ ] See "Dashboard Admin" header
- [ ] View 4 statistics cards:
  - **Total Mahasiswa** (Active students count)
  - **Sudah Bayar** (Paid bills count)
  - **Belum Bayar** (Unpaid + Overdue count)
  - **Saldo Kas** (Real-time balance from income - expense)
- [ ] Statistics should show **real data** from database
- [ ] See 6 menu buttons:
  1. Manajemen Mahasiswa
  2. Manajemen Tagihan
  3. Verifikasi Pembayaran
  4. Pengelolaan Kas
  5. Laporan
  6. Pengumuman

---

### 4. MANAJEMEN MAHASISWA TEST

- [ ] Click "Manajemen Mahasiswa" button
- [ ] **Expected:** Navigate to `/dashboard/admin/students`
- [ ] See page title "Manage Students"
- [ ] View student count "(30)" or actual count
- [ ] See search box
- [ ] View Active/Inactive count badges
- [ ] See table with columns: NIM, Name, Email, WhatsApp, Class, Status
- [ ] **Expected:** 30 students displayed
- [ ] Test search by typing a name (e.g., "Ahmad")
- [ ] **Expected:** Filtered results
- [ ] Test search by NIM (e.g., "2026010001")
- [ ] **Expected:** Single student match
- [ ] Click "Kembali ke Dashboard"
- [ ] **Expected:** Return to main dashboard

---

### 5. MANAJEMEN TAGIHAN TEST

- [ ] Click "Manajemen Tagihan" button
- [ ] **Expected:** Navigate to `/dashboard/admin/bills`
- [ ] See page title "Manajemen Tagihan"
- [ ] View 4 statistics cards:
  - Total Tagihan
  - Lunas (Green)
  - Belum Bayar (Yellow)
  - Terlambat (Red)
- [ ] See search box
- [ ] See filter dropdown (Semua Status / Lunas / Belum Bayar / Terlambat)
- [ ] See table with columns: Mahasiswa (NIM + Name), Tagihan, Jumlah, Periode, Deadline, Status
- [ ] Test filter by status
- [ ] Test search by student name or NIM
- [ ] Click "Kembali ke Dashboard"

---

### 6. VERIFIKASI PEMBAYARAN TEST

- [ ] Click "Verifikasi Pembayaran" button
- [ ] **Expected:** Navigate to `/dashboard/admin/payments`
- [ ] See pending payments list (if mahasiswa submitted payment)
- [ ] Each payment should show:
  - Student info (NIM, Name)
  - Bill name
  - Amount
  - Payment method
  - Upload date
  - Payment proof image
  - "Lihat Bukti" button
  - "Verifikasi" button (green)
  - "Tolak" button (red)
- [ ] Click "Lihat Bukti" to view payment proof image
- [ ] Click "Verifikasi" to approve payment
- [ ] **Expected:** Confirmation dialog
- [ ] Confirm approval
- [ ] **Expected:** Payment status → PAID, removed from pending list
- [ ] Test rejection: Click "Tolak"
- [ ] **Expected:** Show rejection reason textarea
- [ ] Enter rejection reason
- [ ] Submit rejection
- [ ] **Expected:** Payment status → REJECTED, mahasiswa can re-upload

---

### 7. PENGELOLAAN KAS TEST

- [ ] Click "Pengelolaan Kas" button
- [ ] **Expected:** Navigate to `/dashboard/admin/cash`
- [ ] See page title "Pengelolaan Kas"
- [ ] View 3 main cards:
  - **Saldo Kas** (Balance = Income - Expense)
  - **Total Pemasukan** (Green, TrendingUp icon)
  - **Total Pengeluaran** (Red, TrendingDown icon)
- [ ] See "Pemasukan Terakhir" section
- [ ] See "Pengeluaran Terakhir" section
- [ ] Each transaction should show:
  - Description
  - Amount (+ for income, - for expense)
  - Source/Category
  - Date
- [ ] **Expected:** Real data from database (cashIncome + cashExpense)
- [ ] Click "Kembali ke Dashboard"

---

### 8. LAPORAN TEST

- [ ] Click "Laporan" button
- [ ] **Expected:** Navigate to `/dashboard/admin/reports`
- [ ] See page title "Laporan Keuangan"
- [ ] See placeholder message: "Under Development"
- [ ] **Expected:** This page is a placeholder for future feature
- [ ] Click "Kembali ke Dashboard"

---

### 9. PENGUMUMAN TEST

- [ ] Click "Pengumuman" button
- [ ] **Expected:** Navigate to `/dashboard/admin/announcements`
- [ ] See page title "Pengumuman Kelas"
- [ ] See placeholder message: "Under Development"
- [ ] **Expected:** This page is a placeholder for future feature
- [ ] Click "Kembali ke Dashboard"

---

### 10. SETTINGS TEST

- [ ] Click Settings icon (gear) in header
- [ ] **Expected:** Navigate to `/dashboard/admin/settings`
- [ ] See page title "Pengaturan Sistem"
- [ ] **Note:** Only ADMIN can access (not BENDAHARA)
- [ ] See placeholder message: "Under Development"
- [ ] Click "Kembali ke Dashboard"

---

### 11. ROLE AUTHORIZATION TEST

#### Test Mahasiswa Access Restrictions
- [ ] Login as mahasiswa
- [ ] Try to access `/dashboard/admin/students` directly
- [ ] **Expected:** Redirect to `/dashboard` (student dashboard)
- [ ] Try to access `/dashboard/admin/bills`
- [ ] **Expected:** Redirect to `/dashboard`
- [ ] Try to access `/dashboard/admin/payments`
- [ ] **Expected:** Redirect to `/dashboard`

#### Test Bendahara Access
- [ ] Login as bendahara
- [ ] Access `/dashboard/admin/students`
- [ ] **Expected:** Success (200 OK)
- [ ] Access `/dashboard/admin/bills`
- [ ] **Expected:** Success (200 OK)
- [ ] Access `/dashboard/admin/settings`
- [ ] **Expected:** Redirect to `/dashboard` (only ADMIN)

---

## 📊 API ENDPOINTS STATUS

### Authentication
- ✅ `POST /api/auth/register` - Register new student (hardcoded MAHASISWA role)
- ✅ `POST /api/auth/callback/credentials` - Login (NextAuth)
- ✅ `GET /api/auth/me` - Get current user

### Student Dashboard
- ✅ `GET /api/dashboard/student` - Get student dashboard data

### Admin Endpoints
- ✅ `GET /api/admin/students` - List all students (ADMIN only)
- ✅ `GET /api/admin/bills` - List all bills with stats (ADMIN/BENDAHARA)
- ✅ `GET /api/admin/cash` - Get cash balance + transactions (ADMIN/BENDAHARA)

### Bills
- ✅ `GET /api/bills/[billId]` - Get single bill details

### Payments
- ✅ `GET /api/payments/pending` - List pending payments (ADMIN/BENDAHARA)
- ✅ `POST /api/payments/[id]/verify` - Approve payment (ADMIN/BENDAHARA)
- ✅ `POST /api/payments/[id]/reject` - Reject payment (ADMIN/BENDAHARA)
- ✅ `POST /api/payments/upload-proof` - Student upload payment proof

### Settings
- ✅ `GET /api/settings/qris` - Get QRIS configuration

---

## 🔧 KNOWN ISSUES / INCOMPLETE FEATURES

### Completed Features ✅
1. 3 Role system (ADMIN, BENDAHARA, MAHASISWA)
2. Student dashboard with real-time data
3. Payment upload flow (QRIS + Transfer)
4. Admin dashboard with statistics
5. Manage students (view, search, filter)
6. Manage bills (view, search, filter by status)
7. Verify payments (approve/reject with image proof)
8. Cash management (view income/expense + balance)

### Placeholder Features (Under Development) ⏳
1. Reports page (Export PDF/Excel)
2. Announcements management (Create/Edit/Delete)
3. Settings page (QRIS config, system settings)
4. Create new bills (currently only from seed data)
5. Add income/expense transactions (UI not built yet)

### Not Implemented ❌
1. Email notifications
2. Bulk operations (mass bills creation, mass approve)
3. User profile editing
4. Password change
5. Forgot password
6. Dashboard charts/graphs

---

## 🎯 SUCCESS CRITERIA

All features marked ✅ above should work without errors. Placeholder features should show "Under Development" message without crashing.

---

## 📝 DEMO ACCOUNTS

| Role | Email/NIM | Password |
|------|-----------|----------|
| **Admin** | admin@kas-ti26a3.test | admin123 |
| **Bendahara** | bendahara@kas-ti26a3.test | bendahara123 |
| **Mahasiswa** | 2026010001 | mahasiswa123 |
| **Mahasiswa** | 2026010002 | mahasiswa123 |
| ... | ... | ... |
| **Mahasiswa** | 2026010030 | mahasiswa123 |

---

## 🚀 SERVER INFO

- **Development Server:** `npm run dev`
- **URL:** http://localhost:3000
- **Database:** PostgreSQL (via Prisma)
- **Seed Command:** `npx prisma db seed`
- **Prisma Studio:** `npx prisma studio` (port 5555)

---

**Last Updated:** 2026-09-20
**Status:** All core features working ✅
