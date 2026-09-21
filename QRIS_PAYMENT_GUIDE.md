# 📱 QRIS DANA Payment Implementation Guide

## 🎯 Overview

Aplikasi KAS TI26A3 menggunakan **QRIS DANA STATIS** sebagai metode pembayaran utama. Ini adalah QRIS milik bendahara kelas yang digunakan untuk menerima pembayaran kas.

## ⚠️ PENTING

- ✅ QRIS adalah QRIS STATIS milik bendahara
- ✅ TIDAK menggunakan payment gateway otomatis
- ✅ TIDAK membuat QRIS baru secara dinamis
- ✅ Pembayaran diverifikasi MANUAL oleh bendahara
- ✅ Mahasiswa upload bukti pembayaran

## 🔄 Alur Pembayaran

### 1. Mahasiswa Login
```
Mahasiswa masuk ke dashboard
Lihat tagihan mingguan: Rp5.000
Deadline: Rabu
```

### 2. Klik "Bayar Sekarang"
```
Redirect ke halaman pembayaran
/dashboard/payment/[billId]
```

### 3. Sistem Menampilkan QRIS
```
- Gambar QRIS DANA (dikonfigurasi admin)
- Nama penerima
- Nominal yang harus dibayar
- Instruksi pembayaran
```

### 4. Mahasiswa Melakukan Pembayaran
```
- Buka aplikasi DANA/OVO/GoPay/dll
- Scan QRIS yang ditampilkan
- Transfer sesuai nominal (Rp5.000)
- Screenshot bukti pembayaran
```

### 5. Upload Bukti Pembayaran
```
Form input:
- Nominal pembayaran (auto-filled dari tagihan)
- Tanggal pembayaran
- Waktu pembayaran
- Catatan (opsional)
- Upload file bukti (JPG/PNG/WebP, max 5MB)
```

### 6. Status: Menunggu Verifikasi
```
Payment status = PENDING_VERIFICATION
Bill status = tetap UNPAID
Mahasiswa mendapat notifikasi
```

### 7. Bendahara Verifikasi
```
Bendahara login
Lihat daftar pembayaran pending
Review bukti pembayaran
```

### 8. Approve atau Reject

#### Jika APPROVE:
```
Payment status = PAID
Bill status = PAID
Tambah ke cash income
Kirim notifikasi ke mahasiswa
Log audit
```

#### Jika REJECT:
```
Payment status = REJECTED
Bendahara wajib isi alasan
Kirim notifikasi ke mahasiswa
Mahasiswa bisa upload ulang
```

## 📊 Database Flow

### Payment Record
```typescript
{
  id: "cuid",
  billId: "bill_id",
  studentId: "student_id",
  amount: 5000,
  method: "QRIS_DANA",
  status: "PENDING_VERIFICATION",
  proofImageUrl: "/uploads/payment-proofs/xxx.jpg",
  paymentDate: "2026-09-17T10:30:00",
  paymentNotes: "Bayar via DANA",
  verifiedBy: null,
  verifiedAt: null,
  rejectionReason: null,
  createdAt: "2026-09-17T10:35:00"
}
```

### Setelah Verifikasi
```typescript
{
  // ... fields sebelumnya
  status: "PAID",
  verifiedBy: "admin_user_id",
  verifiedAt: "2026-09-17T11:00:00",
  paidAt: "2026-09-17T11:00:00"
}
```

### Cash Income (Auto-created saat verify)
```typescript
{
  category: "KAS_MINGGUAN",
  description: "Pembayaran kas dari [Nama Mahasiswa]",
  amount: 5000,
  date: "2026-09-17",
  paymentId: "payment_id",
  createdBy: "admin_user_id"
}
```

## 🔧 Setup QRIS (Admin)

### 1. Upload QRIS Image

Admin perlu:
1. Scan QRIS DANA bendahara
2. Save sebagai image file
3. Upload via admin settings

**Cara Manual (Sementara):**
```bash
# Via Prisma Studio
npx prisma studio

# Buka table: payment_accounts
# Create new record:
{
  name: "QRIS DANA - Bendahara TI26A3",
  type: "QRIS_DANA",
  accountName: "Nama Bendahara",
  qrisImageUrl: "/uploads/qris/dana-qris.jpg",
  description: "Scan QRIS untuk pembayaran kas kelas",
  isActive: true
}
```

### 2. Upload File QRIS

**Manual Upload:**
```bash
# 1. Siapkan file QRIS (PNG/JPG)
# 2. Copy ke folder:
cp qris-dana.jpg /Users/otr1/Documents/kas-ti26a3/public/uploads/qris/

# 3. Update path di database
qrisImageUrl: "/uploads/qris/qris-dana.jpg"
```

**Via API (Future):**
Admin dashboard akan memiliki form upload QRIS.

## 📱 API Endpoints

### Get QRIS Configuration
```
GET /api/settings/qris

Response:
{
  "configured": true,
  "qris": {
    "id": "xxx",
    "name": "QRIS DANA - Bendahara TI26A3",
    "accountName": "Nama Bendahara",
    "qrisImageUrl": "/uploads/qris/dana-qris.jpg",
    "description": "Scan QRIS untuk pembayaran kas"
  }
}
```

### Upload Payment Proof
```
POST /api/payments/upload-proof
Content-Type: multipart/form-data

Body:
- billId: string
- amount: number
- paymentDate: ISO datetime string
- paymentNotes: string (optional)
- proofFile: File

Response:
{
  "success": true,
  "payment": { ... }
}
```

### Verify Payment (Admin only)
```
POST /api/payments/[id]/verify

Response:
{
  "success": true,
  "payment": { ... }
}
```

### Reject Payment (Admin only)
```
POST /api/payments/[id]/reject
Content-Type: application/json

Body:
{
  "reason": "Bukti transfer tidak jelas"
}

Response:
{
  "success": true,
  "payment": { ... }
}
```

## 🔐 Security

### File Upload
- ✅ Validate file type (image only)
- ✅ Max file size: 5MB
- ✅ Generate unique filename
- ✅ Save to secure directory
- ✅ No executable files allowed

### Authorization
- ✅ Only student can upload their own payment
- ✅ Only admin/bendahara can verify
- ✅ Amount must match bill amount
- ✅ Bill must belong to student

### Audit Trail
- ✅ Log payment upload
- ✅ Log verification
- ✅ Log rejection
- ✅ Include user, timestamp, details

## 💰 Cash Income Logic

**PENTING:** Pembayaran hanya masuk ke cash income setelah diverifikasi!

```typescript
// ❌ SALAH: Langsung tambah saat upload
cashIncome.create() // JANGAN!

// ✅ BENAR: Tambah saat verify
if (status === 'PAID') {
  cashIncome.create({
    amount: payment.amount,
    category: 'KAS_MINGGUAN',
    paymentId: payment.id
  })
}
```

**Status yang TIDAK dihitung:**
- PENDING_VERIFICATION
- REJECTED
- CANCELLED

**Status yang DIHITUNG:**
- PAID (setelah verify)

## 📊 Reporting

### Saldo Kas
```typescript
const income = cashIncome.aggregate({ _sum: { amount } })
const expense = cashExpense.aggregate({ _sum: { amount } })
const balance = income - expense
```

### Pembayaran Terverifikasi
```sql
SELECT * FROM payments
WHERE status = 'PAID'
AND verifiedAt IS NOT NULL
```

### Pending Verification
```sql
SELECT * FROM payments
WHERE status = 'PENDING_VERIFICATION'
ORDER BY createdAt DESC
```

## 🔔 Notifications

### After Upload
```
Title: "Bukti Pembayaran Diterima"
Message: "Bukti pembayaran Anda telah diterima dan menunggu verifikasi bendahara."
```

### After Verify (Approved)
```
Title: "Pembayaran Diverifikasi"
Message: "Pembayaran kas sebesar Rp5.000 telah diverifikasi dan dinyatakan LUNAS. Terima kasih!"

WhatsApp (jika configured):
"Halo [Nama], pembayaran kas TI26A3 sebesar Rp5.000 telah diverifikasi dan dinyatakan LUNAS. Terima kasih!"
```

### After Reject
```
Title: "Pembayaran Ditolak"
Message: "Pembayaran Anda ditolak oleh bendahara. Alasan: [reason]. Silakan upload bukti pembayaran yang benar."

WhatsApp (jika configured):
"Halo [Nama], pembayaran kas TI26A3 Anda ditolak. Alasan: [reason]. Silakan upload bukti yang benar."
```

## 🧪 Testing

### Test Flow

1. **Login as Student:**
   ```
   NIM: 2026010001
   Password: mahasiswa123
   ```

2. **View Dashboard:**
   - See current week bill
   - Status: UNPAID
   - Click "Bayar Sekarang"

3. **Payment Page:**
   - View QRIS (if configured)
   - Fill payment date/time
   - Upload dummy image
   - Submit

4. **Check Status:**
   - Status should be PENDING_VERIFICATION
   - Check notification

5. **Login as Bendahara:**
   ```
   Email: bendahara@kas-ti26a3.test
   Password: bendahara123
   ```

6. **Verify Payment:**
   - View pending payments
   - Review proof image
   - Approve or reject

7. **Check Result:**
   - If approved: status = PAID, balance increased
   - If rejected: status = REJECTED, student notified

## 📝 Notes

- QRIS image HARUS di-upload manual oleh admin (via Prisma Studio atau future admin UI)
- Jangan gunakan QRIS dummy/fake
- Jangan claim auto-detection jika tidak ada API
- Semua verifikasi MANUAL by bendahara
- Sistem hanya tracking dan reporting

## 🎯 Future Enhancements

- [ ] Admin UI untuk upload QRIS
- [ ] Bulk verify payments
- [ ] Payment reminders (if not uploaded)
- [ ] Statistics dashboard
- [ ] Export payment reports

---

**Last Updated:** September 2026
**Implementation:** QRIS DANA Statis + Manual Verification
