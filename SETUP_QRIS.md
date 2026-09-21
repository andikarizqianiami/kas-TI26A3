# 🔧 Setup QRIS DANA - Panduan Lengkap

## 📋 Yang Dibutuhkan

1. **QRIS DANA Bendahara** - QR Code untuk menerima pembayaran
2. **File QRIS** - Format PNG/JPG dari QRIS DANA
3. **Akses Prisma Studio** - Untuk upload QRIS ke database

## 🚀 Cara Setup QRIS

### Option 1: Via Prisma Studio (Recommended)

#### Step 1: Dapatkan QRIS DANA

1. Buka aplikasi DANA
2. Masuk ke menu "QRIS Saya" atau "Terima Uang"
3. Screenshot QRIS Code
4. Crop image hanya bagian QR Code
5. Save sebagai file: `qris-dana-ti26a3.png`

#### Step 2: Upload File QRIS

```bash
# Masuk ke folder project
cd /Users/otr1/Documents/kas-ti26a3

# Buat folder untuk QRIS jika belum ada
mkdir -p public/uploads/qris

# Copy file QRIS ke folder
cp ~/Downloads/qris-dana-ti26a3.png public/uploads/qris/
```

#### Step 3: Konfigurasi di Database

```bash
# Jalankan Prisma Studio
npx prisma studio
```

Buka browser: **http://localhost:5555**

1. **Buka table: `payment_accounts`**

2. **Klik tombol "Add record"**

3. **Isi form:**
   ```
   name: QRIS DANA - Bendahara TI26A3
   type: QRIS_DANA
   accountName: [Nama Bendahara Anda]
   qrisImageUrl: /uploads/qris/qris-dana-ti26a3.png
   description: Scan QRIS untuk pembayaran kas kelas. Nominal Rp5.000 per minggu.
   isActive: true (checkbox dicentang)
   ```

4. **Klik "Save 1 change"**

#### Step 4: Verifikasi

1. Restart development server: `npm run dev`
2. Login sebagai mahasiswa
3. Klik "Bayar Sekarang"
4. QRIS DANA harus muncul!

---

### Option 2: Manual SQL (Advanced)

```bash
# Masuk ke PostgreSQL
psql -U postgres -d kas_ti26a3

# Insert QRIS configuration
INSERT INTO payment_accounts (
  id,
  name,
  type,
  "accountName",
  "qrisImageUrl",
  description,
  "isActive",
  "createdAt",
  "updatedAt"
) VALUES (
  gen_random_uuid(),
  'QRIS DANA - Bendahara TI26A3',
  'QRIS_DANA',
  'Nama Bendahara Anda',
  '/uploads/qris/qris-dana-ti26a3.png',
  'Scan QRIS untuk pembayaran kas kelas',
  true,
  NOW(),
  NOW()
);

# Keluar
\q
```

---

## ✅ Testing QRIS

### Test 1: Akses Mahasiswa

1. **Login sebagai mahasiswa:**
   - NIM: `2026010001`
   - Password: `mahasiswa123`

2. **Klik "Bayar Sekarang"**

3. **Verifikasi yang muncul:**
   - ✅ QRIS image terlihat jelas
   - ✅ Nama penerima benar
   - ✅ Deskripsi muncul
   - ✅ Nominal Rp5.000
   - ✅ Form upload bukti ada

### Test 2: Upload Bukti (Dummy)

1. Gunakan image random sebagai bukti test
2. Isi form:
   - Nominal: 5000
   - Tanggal: Hari ini
   - Waktu: Sekarang
   - Upload file test
3. Submit
4. Cek status: "Menunggu Verifikasi"

### Test 3: Verifikasi (Admin)

1. **Login sebagai bendahara:**
   - Email: `bendahara@kas-ti26a3.test`
   - Password: `bendahara123`

2. **Akses: Dashboard → Verifikasi Pembayaran**

3. **Verifikasi yang muncul:**
   - ✅ List pembayaran pending
   - ✅ Detail mahasiswa
   - ✅ Bukti pembayaran terlihat
   - ✅ Tombol Verify & Reject

4. **Klik "Verifikasi & Setujui"**

5. **Cek hasil:**
   - ✅ Status berubah PAID
   - ✅ Cash income bertambah
   - ✅ Saldo kas update
   - ✅ Mahasiswa dapat notifikasi

---

## 🐛 Troubleshooting

### QRIS Tidak Muncul

**Problem:** Halaman payment menampilkan "QRIS belum dikonfigurasi"

**Solusi:**

1. Cek database via Prisma Studio
2. Pastikan ada record di `payment_accounts` dengan:
   - `type = 'QRIS_DANA'`
   - `isActive = true`
   - `qrisImageUrl` terisi

3. Jika belum ada, buat record baru

### Gambar QRIS Tidak Terlihat

**Problem:** QRIS image broken/tidak load

**Solusi:**

1. **Cek file ada:**
   ```bash
   ls -la public/uploads/qris/
   ```

2. **Cek path benar:**
   - Database: `/uploads/qris/filename.png`
   - File fisik: `public/uploads/qris/filename.png`

3. **Cek permission:**
   ```bash
   chmod 644 public/uploads/qris/*.png
   ```

4. **Restart server:**
   ```bash
   npm run dev
   ```

### Error Upload Bukti Pembayaran

**Problem:** Error saat upload file

**Solusi:**

1. **Cek folder exists:**
   ```bash
   mkdir -p public/uploads/payment-proofs
   chmod 755 public/uploads/payment-proofs
   ```

2. **Cek file size:** Max 5MB

3. **Cek file type:** Hanya JPG, PNG, WebP

4. **Cek console error di browser**

---

## 📝 Notes Penting

### ⚠️ QRIS adalah STATIS

- QRIS tidak generate otomatis per transaksi
- Semua mahasiswa scan QRIS yang SAMA
- Nominal TIDAK ter-embed di QRIS
- Mahasiswa harus input nominal manual (Rp5.000)
- Verifikasi MANUAL oleh bendahara

### ✅ Best Practices

1. **QRIS Image Quality:**
   - Resolusi minimal 500x500px
   - Clear, tidak blur
   - Background kontras

2. **File Naming:**
   - Gunakan nama descriptive
   - Lowercase, no spaces
   - Example: `qris-dana-ti26a3.png`

3. **Backup QRIS:**
   - Save QRIS image di cloud
   - Jangan hanya simpan di app
   - Siapkan backup jika device hilang

4. **Security:**
   - Jangan share QRIS di public
   - Only admin yang dapat upload
   - Monitor unauthorized uploads

---

## 🔄 Update QRIS

Jika QRIS perlu diganti (misal ganti bendahara):

### Via Prisma Studio:

1. Buka `npx prisma studio`
2. Table: `payment_accounts`
3. Cari record QRIS_DANA
4. Update field:
   - `accountName` - nama bendahara baru
   - `qrisImageUrl` - path file QRIS baru
5. Save changes

### Via SQL:

```sql
UPDATE payment_accounts
SET 
  "accountName" = 'Nama Bendahara Baru',
  "qrisImageUrl" = '/uploads/qris/qris-new.png',
  "updatedAt" = NOW()
WHERE type = 'QRIS_DANA';
```

---

## 📊 Monitoring

### Check QRIS Usage

```sql
-- Total payments via QRIS
SELECT COUNT(*) as total_qris_payments
FROM payments
WHERE method = 'QRIS_DANA';

-- Pending verification
SELECT COUNT(*) as pending
FROM payments
WHERE method = 'QRIS_DANA'
AND status = 'PENDING_VERIFICATION';

-- Success rate
SELECT 
  status,
  COUNT(*) as count
FROM payments
WHERE method = 'QRIS_DANA'
GROUP BY status;
```

---

## 🎯 Checklist Setup

- [ ] QRIS DANA sudah didapat dari bendahara
- [ ] File QRIS saved di `public/uploads/qris/`
- [ ] Record created di table `payment_accounts`
- [ ] `qrisImageUrl` path benar
- [ ] `isActive = true`
- [ ] Test login mahasiswa - QRIS muncul
- [ ] Test upload bukti dummy - berhasil
- [ ] Test verifikasi admin - berhasil
- [ ] Notification works (optional)
- [ ] Documentation dibaca oleh bendahara

---

**Setup Complete! 🎉**

Mahasiswa sekarang bisa bayar kas via QRIS DANA!

---

**Need Help?**
- Check console errors
- Check Prisma Studio data
- Check file permissions
- Restart dev server
- Read QRIS_PAYMENT_GUIDE.md
