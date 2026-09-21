# ROLE SYSTEM — KAS TI26A3

## 3 Tipe Akun

### 1. MAHASISWA (Anggota)
**Cara daftar:** Self-registration via /auth/register
**Batasan:** Otomatis jadi MAHASISWA, tidak bisa pilih role
**Fitur:**
- ✅ Login
- ✅ Lihat dashboard pribadi
- ✅ Lihat tagihan kas mingguan
- ✅ Bayar iuran (QRIS / Transfer Manual)
- ✅ Upload bukti pembayaran
- ✅ Lihat riwayat pembayaran pribadi
- ✅ Lihat status pembayaran (PAID, PENDING, REJECTED)
- ✅ Notifikasi pembayaran
- ✅ Update profile (WhatsApp, email)
- ❌ Tidak bisa akses dashboard admin
- ❌ Tidak bisa verifikasi pembayaran
- ❌ Tidak bisa lihat data mahasiswa lain
- ❌ Tidak bisa manage kas kelas

### 2. BENDAHARA
**Cara daftar:** Dibuat manual oleh ADMIN (tidak bisa self-register)
**Batasan:** Hanya ADMIN yang bisa create/promote ke BENDAHARA
**Fitur:**
- ✅ Semua fitur MAHASISWA
- ✅ Dashboard bendahara (summary kas kelas)
- ✅ Verifikasi pembayaran manual (approve/reject)
- ✅ Lihat semua transaksi pembayaran
- ✅ Lihat daftar mahasiswa & status bayar
- ✅ Input pemasukan kas (selain iuran)
- ✅ Input pengeluaran kas
- ✅ Generate laporan kas (weekly/monthly)
- ✅ Lihat saldo kas
- ✅ Export data pembayaran
- ❌ Tidak bisa create/delete user
- ❌ Tidak bisa promote/demote role
- ❌ Tidak bisa delete transaksi yang sudah verified

### 3. ADMIN
**Cara daftar:** Dibuat manual (seed/migration awal)
**Batasan:** Super user, hanya 1-2 akun
**Fitur:**
- ✅ Semua fitur BENDAHARA
- ✅ Dashboard admin (full control)
- ✅ Create akun BENDAHARA
- ✅ Manage user (activate/deactivate)
- ✅ Promote/demote role (MAHASISWA ↔ BENDAHARA)
- ✅ Delete transaksi (jika ada kesalahan)
- ✅ Edit tagihan
- ✅ System settings (QRIS config, payment method)
- ✅ Audit logs (siapa melakukan apa)
- ✅ Backup data
- ⚠️ Tidak bisa demote ADMIN lain (safety)

## Batasan Keamanan

### Register Endpoint
```ts
// app/api/auth/register/route.ts
role: 'MAHASISWA' // hardcoded, tidak bisa diubah dari frontend
```

### Middleware Protection
```ts
// middleware.ts
if (role === 'MAHASISWA' && path.startsWith('/admin')) {
  return redirect('/dashboard')
}
if (role === 'MAHASISWA' && path.startsWith('/bendahara')) {
  return redirect('/dashboard')
}
```

### API Authorization
```ts
// Setiap API endpoint cek role
if (session.user.role !== 'ADMIN' && session.user.role !== 'BENDAHARA') {
  return 403 Forbidden
}
```

## Route Structure

```
/dashboard           → MAHASISWA (student dashboard)
/bendahara           → BENDAHARA only
/admin               → ADMIN only
/admin/users         → ADMIN only
/admin/settings      → ADMIN only
```

## Cara Buat ADMIN/BENDAHARA

### Metode 1: Seed Database (Awal)
```ts
// prisma/seed.ts
await prisma.user.create({
  data: {
    email: 'admin@kas-ti26a3.test',
    password: await hashPassword('admin123'),
    role: 'ADMIN',
    isActive: true
  }
})
```

### Metode 2: Via Admin Dashboard
Admin login → Users → Pilih user → Promote to BENDAHARA

### Metode 3: Manual via Database
Update role di database langsung (emergency only)

## Implementation Priority

### P0 — Critical
1. ✅ Register API (hardcode MAHASISWA) — DONE
2. ⏳ Middleware role-based redirect
3. ⏳ Dashboard routing (/dashboard, /bendahara, /admin)

### P1 — High
4. ⏳ Student dashboard (view bills, pay, history)
5. ⏳ Bendahara dashboard (verify payments, cash management)
6. ⏳ Admin dashboard (user management)

### P2 — Medium
7. ⏳ API authorization guards
8. ⏳ Audit logging
9. ⏳ User management UI

## Next Steps
1. Create middleware.ts untuk role-based redirect
2. Buat 3 dashboard layouts
3. Implement authorization guards di API
4. Seed admin account untuk testing
