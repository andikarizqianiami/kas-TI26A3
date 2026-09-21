# ⚡ Quick Start Guide - KAS TI26A3

Panduan singkat untuk mulai menggunakan KAS TI26A3 dalam 5 menit.

---

## 🎯 Untuk Yang Buru-Buru

### **Option 1: Deploy Sekarang (No Code)** 🚀

Paling cepat untuk production:

1. **Klik tombol ini:**
   
   [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/kas-ti26a3)

2. **Login dengan GitHub**

3. **Isi environment variables** (wajib):
   ```
   DATABASE_URL=<dapatkan dari Supabase - lihat di bawah>
   NEXTAUTH_URL=https://your-project.vercel.app
   NEXTAUTH_SECRET=<generate: openssl rand -base64 32>
   ```

4. **Deploy** → Tunggu 2 menit → ✅ Done!

**Dapatkan Database URL (Gratis):**
1. Buka https://supabase.com
2. New Project → "kas-ti26a3"
3. Copy Connection String dari Settings → Database
4. Paste ke `DATABASE_URL` di Vercel

---

### **Option 2: Lokal (Development)** 💻

Untuk testing di komputer sendiri:

```bash
# 1. Clone
git clone https://github.com/YOUR_USERNAME/kas-ti26a3.git
cd kas-ti26a3

# 2. Install
npm install

# 3. Setup Database
# Pastikan PostgreSQL running
createdb kas_ti26a3

# 4. Setup Environment
cp .env.example .env
# Edit .env dengan database URL Anda

# 5. Setup Database
npx prisma generate
npx prisma migrate dev
npx prisma db seed

# 6. Run
npm run dev
```

Buka http://localhost:3000 ✅

---

## 👤 Login Pertama Kali

Setelah deploy/run, login dengan akun demo:

### **Admin/Bendahara:**
```
Email: admin@kas-ti26a3.test
Password: admin123
```

### **Mahasiswa:**
```
NIM: 2026010001
Password: mahasiswa123
```

⚠️ **PENTING:** Ganti password setelah login pertama!

---

## 🎓 Langkah Selanjutnya

### **A. Setup Awal (Admin)**

1. **Login sebagai Admin**
2. **Ganti Password:**
   - Profile → Change Password
3. **Setup Payment Method:**
   - Settings → Payment Settings
   - Upload QRIS atau isi nomor rekening
4. **Tambah Mahasiswa:**
   - Users → Add Student
   - Input NIM, nama, email, WhatsApp
5. **Buat Tagihan Pertama:**
   - Bills → Create Bill
   - Pilih periode dan mahasiswa

### **B. Mulai Pakai (Mahasiswa)**

1. **Login dengan NIM**
2. **Ganti Password:**
   - Profile → Change Password
3. **Lihat Tagihan:**
   - Dashboard → Lihat tagihan aktif
4. **Bayar Tagihan:**
   - Klik tagihan → Pay Now
   - Pilih QRIS atau Transfer Manual
   - Upload bukti transfer
5. **Tunggu Verifikasi:**
   - Status: Pending → Verified (by admin)

---

## 📱 Quick Feature Guide

### **1. Tagihan Mingguan**
```
Admin:
1. Bills → Create Bill
2. Set amount & deadline
3. Select students (atau "All")
4. Submit

Mahasiswa:
1. Dashboard → Lihat tagihan
2. Klik Pay Now
3. Upload bukti bayar
4. Done!
```

### **2. Target Urunan**
```
Admin:
1. Funding Targets → Create New
2. Set judul, target amount, deadline
3. Publish

Mahasiswa:
1. Funding Targets → Pilih target
2. Masukkan nominal kontribusi
3. Upload bukti bayar
4. Submit
```

### **3. Laporan**
```
Admin:
1. Reports → Select Period
2. Pilih jenis: Payment/Cash/Full
3. Export PDF atau Excel
4. Download
```

### **4. Kas Kelas**
```
Admin:
1. Cash → Income/Expense
2. Add transaction
3. Set category & amount
4. Save

Lihat saldo:
- Dashboard → Cash Balance widget
```

---

## 🔧 Common Tasks

### **Tambah Mahasiswa Baru**
```
Admin → Users → Add Student
→ Input data → Save
→ Share NIM & password (default: NIM)
```

### **Verifikasi Pembayaran**
```
Admin → Bills → View Bill
→ Lihat pending payments
→ Cek bukti transfer
→ Approve/Reject
```

### **Buat Pengumuman**
```
Admin → Announcements → New
→ Tulis pesan
→ Publish
→ Mahasiswa dapat notif
```

### **Reset Password Mahasiswa**
```
Admin → Users → Find student
→ Edit → Set new password
→ Save → Share password baru
```

---

## 🐛 Troubleshooting Cepat

### **"Cannot connect to database"**
```bash
# Cek PostgreSQL running
pg_isready

# Cek DATABASE_URL di .env
cat .env | grep DATABASE_URL

# Test connection
psql $DATABASE_URL -c "SELECT 1"
```

### **"Prisma Client not generated"**
```bash
npx prisma generate
npm run dev
```

### **"Port 3000 already in use"**
```bash
# Kill process di port 3000
lsof -ti:3000 | xargs kill -9

# Atau pakai port lain
PORT=3001 npm run dev
```

### **"Login failed"**
```bash
# Re-seed database
npx prisma db seed

# Cek user ada
npx prisma studio
# Buka table users → cek ada admin@kas-ti26a3.test
```

---

## 📚 Dokumentasi Lengkap

Butuh info lebih detail?

- 📖 **Full Guide:** [README.md](README.md)
- 🚀 **Deployment:** [DEPLOYMENT.md](DEPLOYMENT.md)
- 🎯 **Funding Targets:** [FITUR_TARGET_URUNAN.md](FITUR_TARGET_URUNAN.md)
- 🧪 **Testing:** [TEST_FUNDING_TARGETS.md](TEST_FUNDING_TARGETS.md)
- 🔌 **API Docs:** Check `/api/*` routes

---

## 💡 Tips

1. **Backup Database:**
   ```bash
   pg_dump kas_ti26a3 > backup.sql
   ```

2. **Update Code:**
   ```bash
   git pull origin main
   npm install
   npx prisma migrate deploy
   npm run build
   ```

3. **Check Logs:**
   ```bash
   # Vercel
   vercel logs
   
   # Local
   tail -f .next/trace
   ```

4. **Performance:**
   - Enable caching di Vercel
   - Use CDN untuk images
   - Optimize database queries

---

## 🎉 Selesai!

Sekarang Anda sudah bisa:
- ✅ Deploy aplikasi
- ✅ Login sebagai admin/mahasiswa
- ✅ Membuat tagihan
- ✅ Memproses pembayaran
- ✅ Membuat target urunan
- ✅ Generate laporan

**Ada pertanyaan?**
- Check FAQ di README.md
- Buka issue di GitHub
- Contact bendahara

**Selamat menggunakan KAS TI26A3! 🚀**
