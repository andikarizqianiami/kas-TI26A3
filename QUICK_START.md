# 🚀 Quick Start Guide - KAS TI26A3

Panduan cepat untuk menjalankan aplikasi KAS TI26A3 dalam 5 menit!

## ✅ Prerequisites

Pastikan sudah terinstall:
- **Node.js** v18 atau lebih tinggi
- **PostgreSQL** v14 atau lebih tinggi
- **npm** atau **yarn**

## 📦 Step 1: Install Dependencies

```bash
cd kas-ti26a3
npm install
```

## 🗄️ Step 2: Setup Database

### Buat Database PostgreSQL

```bash
# Login ke PostgreSQL
psql -U postgres

# Buat database
CREATE DATABASE kas_ti26a3;

# Keluar
\q
```

### Update Connection String

Edit file `.env` dan sesuaikan DATABASE_URL:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/kas_ti26a3?schema=public"
```

Ganti `password` dengan password PostgreSQL Anda.

## 🔧 Step 3: Generate Prisma Client & Migrate

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init
```

Jika muncul error "Prisma Migrate could not create the shadow database", tambahkan `?schema=public` di DATABASE_URL.

## 🌱 Step 4: Seed Database

```bash
npm run db:seed
```

Ini akan membuat:
- ✅ 1 Admin account
- ✅ 1 Bendahara account
- ✅ 30 Mahasiswa accounts (TI26A3)
- ✅ Tagihan kas mingguan
- ✅ Sample payments
- ✅ Sample cash income/expense
- ✅ Announcements

## 🎯 Step 5: Run Development Server

```bash
npm run dev
```

Buka browser di: **http://localhost:3000**

## 👤 Login dengan Akun Demo

### Admin
- **Email**: `admin@kas-ti26a3.test`
- **Password**: `admin123`

### Bendahara
- **Email**: `bendahara@kas-ti26a3.test`
- **Password**: `bendahara123`

### Mahasiswa
- **Email/NIM**: `2026010001` (atau `2026010001@student.udb.ac.id`)
- **Password**: `mahasiswa123`

**Note**: Ada 30 mahasiswa dengan NIM dari `2026010001` sampai `2026010030`, semua menggunakan password `mahasiswa123`.

## 🎉 Selesai!

Aplikasi sudah berjalan! Anda bisa:

1. **Login sebagai Mahasiswa**:
   - Lihat dashboard dengan tagihan
   - Cek status pembayaran
   - Lihat saldo kas kelas
   - Lihat riwayat pembayaran

2. **Login sebagai Admin/Bendahara**:
   - Lihat dashboard statistik
   - Akses menu manajemen (dalam development)

## 🛠️ Tools Berguna

### Prisma Studio (Database GUI)

```bash
npx prisma studio
```

Buka di: **http://localhost:5555**

Dengan Prisma Studio Anda bisa:
- Lihat semua data di database
- Edit data secara visual
- Tambah/hapus data
- Export/import data

### Manual Cron Trigger (Testing)

Untuk testing cron jobs tanpa menunggu schedule:

```bash
# Generate weekly bills manually
curl -X POST http://localhost:3000/api/cron/generate-bills

# Update overdue bills
curl -X POST http://localhost:3000/api/cron/update-overdue

# Send reminders
curl -X POST http://localhost:3000/api/cron/send-reminders
```

## 🐛 Troubleshooting

### Error: "Can't reach database server"

**Solusi**: 
- Pastikan PostgreSQL berjalan
- Cek username/password di DATABASE_URL
- Test koneksi: `psql -U postgres -d kas_ti26a3`

### Error: "Module not found"

**Solusi**:
```bash
rm -rf node_modules package-lock.json
npm install
```

### Error: Prisma Client tidak ter-generate

**Solusi**:
```bash
npx prisma generate
npm run dev
```

### Database sudah ada data lama

**Solusi** (HATI-HATI: ini akan hapus semua data):
```bash
npm run db:reset
```

## 📱 Testing Features

### Test Student Flow:
1. Login sebagai mahasiswa (NIM: 2026010001)
2. Lihat tagihan minggu ini di dashboard
3. Klik "Bayar Sekarang" (fitur payment masih dalam development)
4. Lihat riwayat pembayaran

### Test Admin Flow:
1. Login sebagai admin
2. Dashboard menampilkan statistik
3. Akses Prisma Studio untuk manage data
4. Trigger cron jobs manually untuk testing

### View Database:
1. Jalankan `npx prisma studio`
2. Browse tables: users, students, bills, payments, etc.
3. Check data yang sudah di-seed

## 🔄 Reset Database (Fresh Start)

Jika ingin mulai dari awal:

```bash
# Reset database dan run migrations + seed
npm run db:reset

# Atau manual:
npx prisma migrate reset --force
npm run db:seed
```

## 📚 Next Steps

Setelah aplikasi berjalan, Anda bisa:

1. **Baca Documentation**:
   - `README.md` - Full documentation
   - `IMPLEMENTATION_STATUS.md` - Development progress

2. **Customize Settings**:
   - Edit `.env` untuk konfigurasi
   - Ubah nominal kas di `WEEKLY_BILL_AMOUNT`
   - Ubah hari deadline di `WEEKLY_BILL_DAY`

3. **Develop Features**:
   - Lihat `IMPLEMENTATION_STATUS.md` untuk features yang perlu dilengkapi
   - Priority: Payment flow, Admin management pages

4. **Setup Payment Gateway** (Optional):
   - Daftar di Midtrans/Xendit
   - Update API keys di `.env`
   - Test payment dengan sandbox

5. **Setup WhatsApp** (Optional):
   - Daftar di Fonnte/Wablas
   - Update API keys di `.env`
   - Test notification

## 📞 Need Help?

- Check `README.md` untuk detailed documentation
- Check `IMPLEMENTATION_STATUS.md` untuk development guide
- Use Prisma Studio untuk inspect database
- Check console logs untuk errors

## 🎯 Key Commands Summary

```bash
# Development
npm run dev                    # Start dev server
npm run build                  # Build for production
npm run start                  # Start production server

# Database
npx prisma generate           # Generate Prisma Client
npx prisma migrate dev        # Create migration
npx prisma migrate deploy     # Deploy migrations
npm run db:seed               # Seed database
npm run db:reset              # Reset database
npx prisma studio             # Open Prisma Studio

# Prisma
npx prisma format             # Format schema
npx prisma validate           # Validate schema
npx prisma db push            # Push schema without migration
```

---

**Happy Coding! 🚀**

Aplikasi KAS TI26A3 - Universitas Duta Bangsa
