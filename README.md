# KAS TI26A3

Sistem Manajemen Kas Kelas - Teknik Informatika 26 A3

## 🚀 Fitur Utama

- **Dashboard Mahasiswa**: Cek tagihan, bayar kas, upload bukti pembayaran
- **Dashboard Admin/Bendahara**: Kelola mahasiswa, tagihan, verifikasi pembayaran, laporan keuangan
- **Sistem Tagihan Otomatis**: Generate tagihan kas mingguan otomatis
- **Target Urunan**: Fitur crowdfunding untuk kegiatan kelas
- **Pembayaran QRIS**: Upload dan tampilkan QRIS untuk pembayaran
- **Notifikasi**: Notifikasi tagihan dan update pembayaran
- **Laporan Keuangan**: Pemasukan, pengeluaran, dan laporan mingguan

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: PostgreSQL (Neon)
- **ORM**: Prisma
- **Authentication**: NextAuth.js
- **Styling**: CSS Modules
- **Deployment**: Vercel

## 📦 Setup

1. Clone repository
```bash
git clone https://github.com/andikarizqianiami/kas-TI26A3.git
cd kas-TI26A3
```

2. Install dependencies
```bash
npm install
```

3. Setup database
```bash
# Copy .env.example to .env.local
cp .env.example .env.local

# Edit .env.local with your database URL
# Then run migrations
npx prisma migrate deploy
npx prisma db seed
```

4. Run development server
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000)

## 🔐 Default Accounts

Setelah seeding database:

- **Admin**: `admin@kas-ti26a3.test` / `admin123`
- **Bendahara**: `bendahara@kas-ti26a3.test` / `bendahara123`

## 📝 License

[MIT License](LICENSE)

---

Dibuat untuk Kelas TI26A3 - Universitas Duta Bangsa
