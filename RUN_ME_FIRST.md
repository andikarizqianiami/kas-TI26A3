# 🚀 CARA MENJALANKAN APLIKASI - BACA INI DULU!

## ⚡ Quick Start (Ikuti Step by Step)

### 1️⃣ Masuk ke Folder Project

```bash
cd /Users/otr1/Documents/kas-ti26a3
```

### 2️⃣ Cek PostgreSQL

Pastikan PostgreSQL sudah running:

```bash
# macOS
brew services list | grep postgresql

# Jika belum running:
brew services start postgresql
```

### 3️⃣ Buat Database

```bash
createdb kas_ti26a3
```

Jika error "command not found", coba:

```bash
psql -U postgres -c "CREATE DATABASE kas_ti26a3;"
```

### 4️⃣ Generate Prisma Client

```bash
npx prisma generate
```

### 5️⃣ Run Migrations

```bash
npx prisma migrate dev --name init
```

Jika ditanya "Are you sure?", ketik: **yes**

### 6️⃣ Seed Database

```bash
npm run db:seed
```

Tunggu sampai muncul:
```
✨ Seeding completed successfully!
📝 Demo Accounts: ...
```

### 7️⃣ Jalankan Aplikasi

```bash
npm run dev
```

Tunggu sampai muncul:
```
✓ Ready in xxxms
○ Local: http://localhost:3000
```

### 8️⃣ Buka Browser

Klik atau buka: **http://localhost:3000**

## 🎯 LOGIN DENGAN AKUN DEMO

### Mahasiswa
- **Email/NIM**: `2026010001`
- **Password**: `mahasiswa123`

### Admin
- **Email**: `admin@kas-ti26a3.test`
- **Password**: `admin123`

### Bendahara
- **Email**: `bendahara@kas-ti26a3.test`
- **Password**: `bendahara123`

## ✅ APA YANG BISA DICOBA

### Login Sebagai Mahasiswa:
1. Login dengan NIM `2026010001`
2. Lihat dashboard dengan:
   - Tagihan minggu ini (Rp5.000)
   - Total pembayaran
   - Saldo kas kelas
   - Riwayat pembayaran
   - Pengumuman

### Login Sebagai Admin:
1. Login dengan email `admin@kas-ti26a3.test`
2. Lihat dashboard admin
3. Akses menu management (basic)

## 🛠️ Tools Tambahan

### Prisma Studio (Database GUI)

Buka terminal baru, jalankan:

```bash
cd /Users/otr1/Documents/kas-ti26a3
npx prisma studio
```

Buka: **http://localhost:5555**

Di sini Anda bisa:
- Lihat semua data di database
- Edit data secara visual
- Browse 30 mahasiswa
- Lihat bills, payments, dll

## 🐛 Jika Ada Error

### Error: "Can't reach database"

```bash
# Check PostgreSQL status
brew services list

# Restart PostgreSQL
brew services restart postgresql

# Coba lagi dari step 3
```

### Error: "Prisma Client not found"

```bash
npx prisma generate
npm run dev
```

### Error: "Port 3000 already in use"

```bash
# Kill process di port 3000
lsof -ti:3000 | xargs kill -9

# Atau run di port lain
PORT=3001 npm run dev
```

### Database Already Exists

```bash
# Reset database (HAPUS SEMUA DATA!)
npm run db:reset
```

## 📚 Dokumentasi Lengkap

Setelah aplikasi berjalan, baca:

1. **QUICK_START.md** - Setup guide lengkap
2. **FINAL_NOTES.md** - Apa yang sudah selesai & belum
3. **PROJECT_SUMMARY.md** - Architecture & overview
4. **README.md** - Full documentation
5. **IMPLEMENTATION_STATUS.md** - Development progress

## 🎉 Selamat!

Jika aplikasi sudah running, Anda berhasil! 🎊

Sistem kas TI26A3 siap digunakan untuk development.

---

**Need Help?**
Check FINAL_NOTES.md atau QUICK_START.md untuk troubleshooting lengkap.
