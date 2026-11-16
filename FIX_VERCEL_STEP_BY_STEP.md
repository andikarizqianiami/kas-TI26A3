# 🔧 Fix Vercel Error 500 - Step by Step dengan Screenshot Guide

## ⚠️ Masalah: 
`NEXTAUTH_URL` typo: `ttps://kas-ti26a3.vercel.app` (hilang huruf `h`)

## ✅ Solusi: Fix dalam 5 Menit!

---

## 📋 **STEP 1: Buka Vercel Dashboard**

1. Buka browser (Chrome/Safari/Firefox)
2. Pergi ke: **https://vercel.com**
3. Klik **"Login"** di kanan atas
4. Login dengan akun GitHub Anda (username: andikarizqianiami)

---

## 📋 **STEP 2: Pilih Project**

1. Setelah login, Anda akan lihat dashboard
2. Cari project: **"kas-ti26a3"**
3. **Klik** project tersebut

---

## 📋 **STEP 3: Masuk ke Settings**

1. Di halaman project, lihat menu atas
2. Klik tab **"Settings"** (ikon gear ⚙️)

---

## 📋 **STEP 4: Buka Environment Variables**

1. Di sidebar kiri, klik **"Environment Variables"**
2. Anda akan lihat list semua environment variables

---

## 📋 **STEP 5: Edit NEXTAUTH_URL** ⭐ PENTING!

1. **Cari variable:** `NEXTAUTH_URL`
2. Lihat value-nya, harusnya ada: `ttps://kas-ti26a3.vercel.app` ❌
3. Klik **icon pensil (Edit)** di sebelah kanan variable tersebut
4. **Ubah value menjadi:** `https://kas-ti26a3.vercel.app` ✅
   - **PENTING:** Pastikan ada huruf `h` di depan! Jadi `https://` bukan `ttps://`
5. Pastikan checked untuk:
   - ✅ Production
   - ✅ Preview  
   - ✅ Development
6. Klik **"Save"**

---

## 📋 **STEP 6: Verifikasi Variable Lainnya** (Optional tapi Recommended)

Pastikan variable lain juga ada dan benar:

### **NEXTAUTH_SECRET:**
- Status: ✅ Harus ada
- Panjang: Minimal 32 karakter
- Kalau belum ada atau terlalu pendek, generate baru:
  ```bash
  openssl rand -base64 32
  ```
  Copy hasilnya dan paste sebagai value

### **DATABASE_URL:**
- Status: ✅ Harus ada
- Format: `postgresql://user:pass@host:5432/database`
- Kalau belum ada, ambil dari provider database Anda (Neon/Supabase/Railway)

---

## 📋 **STEP 7: Redeploy Project**

Setelah save environment variables, **WAJIB REDEPLOY!**

**Cara 1 (Paling Mudah):**
1. Klik tab **"Deployments"** di menu atas
2. Lihat deployment paling atas (yang terbaru)
3. Klik **"..." (titik tiga)** di sebelah kanan
4. Klik **"Redeploy"**
5. Confirm dengan klik **"Redeploy"** lagi
6. Tunggu 2-3 menit

**Cara 2 (Alternatif):**
1. Push commit baru ke GitHub (kosong juga gpp)
2. Vercel otomatis deploy

---

## 📋 **STEP 8: Test Aplikasi!**

Setelah deployment selesai (status: Ready ✅):

1. Buka: **https://kas-ti26a3.vercel.app**
2. Klik **"Masuk ke Akun"**
3. Coba login:
   - Email: `admin@ti26a3.udb.ac.id`
   - Password: `admin123456789` (atau password yang Anda set saat seeding)

---

## ✅ **Checklist - Pastikan Semua Ini:**

- [ ] Login ke Vercel
- [ ] Buka project kas-ti26a3
- [ ] Masuk ke Settings → Environment Variables
- [ ] Edit `NEXTAUTH_URL` menjadi `https://kas-ti26a3.vercel.app` (dengan `https://`)
- [ ] Cek `NEXTAUTH_SECRET` ada dan panjangnya >= 32 karakter
- [ ] Cek `DATABASE_URL` ada
- [ ] Save semua changes
- [ ] Redeploy project
- [ ] Tunggu deployment selesai (2-3 menit)
- [ ] Test buka https://kas-ti26a3.vercel.app
- [ ] Test login

---

## 🎯 **Expected Result:**

**Sebelum:**
- ❌ Error 500 di `/api/auth/error`
- ❌ Tidak bisa login

**Setelah:**
- ✅ Homepage buka normal
- ✅ Login page buka normal  
- ✅ Bisa login dengan admin credentials
- ✅ Redirect ke dashboard setelah login

---

## 🆘 **Troubleshooting:**

### Masalah 1: "Masih error 500 setelah redeploy"

**Solusi:**
1. Clear browser cache: Tekan `Ctrl + Shift + R` (Windows) atau `Cmd + Shift + R` (Mac)
2. Atau buka di Incognito/Private window
3. Tunggu 5 menit lagi (propagasi DNS)

### Masalah 2: "Tidak bisa login setelah fix"

**Kemungkinan:** Database production belum ada user admin

**Solusi:**
```bash
# Get DATABASE_URL dari Vercel Environment Variables
# Copy valuenya, lalu:

export DATABASE_URL="paste-database-url-di-sini"

# Seed database
ADMIN_DEFAULT_PASSWORD='admin123456789' \
BENDAHARA_DEFAULT_PASSWORD='bendahara123456789' \
npx prisma db seed
```

### Masalah 3: "Lupa password admin"

**Solusi:**
```bash
# Set DATABASE_URL production
export DATABASE_URL="your-production-url"

# Run reset script
npx tsx scripts/quick-reset-admin.ts
```

---

## 📞 **Masih Bingung?**

Kalau masih bingung di step mana, kasih tau step nomor berapa dan saya bantu lebih detail! 😊

---

## 🎬 **Video Tutorial (Alternative):**

Kalau mau lebih jelas, saya bisa buatin:
1. Screen recording tutorial
2. Atau step-by-step dengan gambar/diagram

---

**Good luck! Dalam 5 menit error Anda akan hilang!** 🚀✨
