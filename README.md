# 💰 KAS TI26A3 - Sistem Manajemen Kas Kelas Digital

Sistem manajemen kas kelas berbasis web yang modern, transparan, dan mudah digunakan untuk mengelola iuran kelas, pembayaran, target urunan, dan laporan keuangan secara digital.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/kas-ti26a3)
[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/YOUR_TEMPLATE)

---

## ✨ Fitur Utama

### 🎯 **Untuk Admin/Bendahara:**
- ✅ **Manajemen Tagihan** - Buat tagihan individual atau massal
- ✅ **Verifikasi Pembayaran** - Review dan approve pembayaran dengan bukti transfer
- ✅ **Kelola Kas** - Catat pemasukan dan pengeluaran kas kelas
- ✅ **Target Urunan** - Buat dan kelola target urunan khusus (workshop, study tour, dll)
- ✅ **Laporan & Ekspor** - Generate laporan PDF/Excel untuk periode tertentu
- ✅ **Dashboard Analytics** - Charts dan statistik real-time
- ✅ **Manajemen User** - Tambah, edit, nonaktifkan mahasiswa
- ✅ **Pengumuman** - Broadcast info penting ke semua mahasiswa
- ✅ **Settings** - Konfigurasi QRIS, rekening bank, dan sistem

### 👨‍🎓 **Untuk Mahasiswa:**
- ✅ **Dashboard Personal** - Lihat tagihan, saldo kas, dan pengumuman
- ✅ **Bayar Tagihan** - Bayar via QRIS atau transfer manual dengan upload bukti
- ✅ **Riwayat Pembayaran** - Track semua pembayaran dengan filter
- ✅ **Kontribusi Urunan** - Berkontribusi untuk target urunan kelas
- ✅ **Notifikasi** - Terima notifikasi untuk tagihan baru dan update

---

## 🚀 Tech Stack

- **Frontend:** Next.js 16 (App Router), React 19, TypeScript
- **Backend:** Next.js API Routes, Prisma ORM
- **Database:** PostgreSQL
- **Authentication:** NextAuth.js
- **UI/UX:** Tailwind CSS, Shadcn UI, Recharts
- **Payment:** Midtrans / Xendit integration ready
- **Deployment:** Vercel, Railway, or VPS ready

---

## 📦 Quick Start

### **Prerequisites:**
- Node.js 18+ 
- PostgreSQL 14+
- npm atau yarn

### **1. Clone Repository**
```bash
git clone https://github.com/YOUR_USERNAME/kas-ti26a3.git
cd kas-ti26a3
```

### **2. Install Dependencies**
```bash
npm install
```

### **3. Setup Environment**
```bash
cp .env.example .env
nano .env  # Edit dengan konfigurasi Anda
```

**Required Environment Variables:**
```env
DATABASE_URL="postgresql://user:password@localhost:5432/kas_ti26a3"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-min-32-chars"
```

### **4. Setup Database**
```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed database dengan sample data
npx prisma db seed
```

### **5. Run Development Server**
```bash
npm run dev
```

Buka http://localhost:3000

### **6. Login dengan Akun Demo**

**Admin:**
- Email: `admin@kas-ti26a3.test`
- Password: `admin123`

**Bendahara:**
- Email: `bendahara@kas-ti26a3.test`
- Password: `bendahara123`

**Mahasiswa:**
- NIM: `2026010001`
- Password: `mahasiswa123`

---

## 📚 Documentation

- **[Deployment Guide](DEPLOYMENT.md)** - Cara deploy ke production
- **[Fitur Target Urunan](FITUR_TARGET_URUNAN.md)** - Dokumentasi lengkap Target Urunan
- **[Testing Guide](TEST_FUNDING_TARGETS.md)** - Panduan testing fitur
- **[API Documentation](API_DOCUMENTATION.md)** - API endpoints reference
- **[Database Schema](prisma/schema.prisma)** - Database structure

---

## 🎯 Fitur Detail

### **1. Manajemen Tagihan Mingguan**
- Auto-generate tagihan untuk semua mahasiswa
- Tagihan individual dengan deadline
- Status tracking: PAID, UNPAID, OVERDUE
- Email/WhatsApp reminder (optional)

### **2. Sistem Pembayaran Multi-Method**
- **QRIS:** Scan & pay dengan QRIS DANA/OVO/GoPay
- **Transfer Manual:** Upload bukti transfer
- Auto-verification dengan approval workflow
- Payment history & receipts

### **3. Target Urunan (Funding Targets)**
- Buat target untuk kegiatan khusus
- Kontribusi dengan nominal bebas
- Real-time progress tracking
- Auto-complete ketika target tercapai
- Leaderboard top contributors (coming soon)

### **4. Dashboard & Analytics**
- Charts: Cash flow, payment trends, status distribution
- Statistics: Total collected, pending, overdue
- Top students by payment activity
- Expense/Income breakdown by category

### **5. Laporan & Export**
- Export to PDF/Excel
- Periode: mingguan, bulanan, atau custom
- Include: payments, expenses, income, balance

### **6. Notifikasi System**
- In-app notifications
- Email notifications (optional)
- WhatsApp notifications via Fonnte (optional)
- Push notifications (future)

---

## 🗂️ Project Structure

```
kas-ti26a3/
├── app/                      # Next.js App Router
│   ├── api/                  # API Routes
│   │   ├── admin/           # Admin endpoints
│   │   ├── bills/           # Bills endpoints
│   │   ├── funding-targets/ # Funding targets endpoints
│   │   └── ...
│   ├── dashboard/           # Dashboard pages
│   │   ├── admin/          # Admin pages
│   │   ├── bills/          # Bill pages
│   │   ├── funding-targets/# Funding target pages
│   │   └── ...
│   └── auth/               # Auth pages
├── components/             # React components
│   ├── dashboard/         # Dashboard components
│   └── ui/               # UI components (shadcn)
├── lib/                   # Utilities & libs
│   ├── auth/             # Auth utilities
│   ├── prisma/           # Prisma client
│   └── utils/            # Helper functions
├── prisma/               # Database
│   ├── schema.prisma     # Database schema
│   ├── migrations/       # Migration files
│   └── seed.ts          # Seed data
├── public/              # Static assets
└── ...
```

---

## 🔐 Security Features

- ✅ **Authentication:** Secure session-based auth with NextAuth.js
- ✅ **Authorization:** Role-based access control (ADMIN, BENDAHARA, MAHASISWA)
- ✅ **Password Hashing:** bcrypt encryption
- ✅ **SQL Injection Prevention:** Prisma ORM with parameterized queries
- ✅ **XSS Prevention:** React automatic escaping
- ✅ **CSRF Protection:** Built-in Next.js CSRF
- ✅ **Audit Logging:** Track all critical actions
- ✅ **Data Validation:** Zod/TypeScript validation

---

## 🧪 Testing

### **Run Tests:**
```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test database
node test-funding-targets.js
```

### **Test Coverage:**
- ✅ Authentication & Authorization
- ✅ Bills CRUD operations
- ✅ Payment verification workflow
- ✅ Funding targets & contributions
- ✅ Cash transactions
- ✅ Reports generation

---

## 📊 Database Schema

**Main Tables:**
- `users` - User accounts
- `students` - Student profiles
- `bills` - Weekly bills
- `payments` - Payment records
- `funding_targets` - Funding targets
- `contributions` - Contributions to targets
- `cash_incomes` - Income records
- `cash_expenses` - Expense records
- `announcements` - Class announcements
- `notifications` - User notifications
- `audit_logs` - Action audit trail

**See full schema:** [prisma/schema.prisma](prisma/schema.prisma)

---

## 🚀 Deployment

### **Deploy ke Vercel (Recommended):**

1. Push code ke GitHub
2. Import project di Vercel
3. Add environment variables
4. Deploy!

**Detailed guide:** [DEPLOYMENT.md](DEPLOYMENT.md)

### **Deploy Options:**
- ✅ **Vercel** - Best for Next.js (recommended)
- ✅ **Railway** - Full-stack dengan database included
- ✅ **Render** - Alternative to Railway
- ✅ **VPS** - Full control (DigitalOcean, Linode)

---

## 🛠️ Development

### **Available Scripts:**

```bash
# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm run start        # Start production server

# Database
npm run db:push      # Push schema changes
npm run db:seed      # Seed database
npm run db:studio    # Open Prisma Studio

# Code Quality
npm run lint         # Run ESLint
npm run format       # Format with Prettier
npm run type-check   # TypeScript check
```

### **Code Style:**
- TypeScript for type safety
- ESLint for code quality
- Prettier for formatting
- Conventional commits

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

**Development Guidelines:**
- Follow existing code style
- Write tests for new features
- Update documentation
- Keep commits atomic

---

## 📝 Roadmap

### **Phase 1: Core Features** ✅
- [x] Authentication & Authorization
- [x] Bills Management
- [x] Payment System
- [x] Cash Management
- [x] Reports & Export
- [x] User Management
- [x] Announcements

### **Phase 2: Enhanced Features** ✅
- [x] Dashboard Charts & Analytics
- [x] Bill History with Filters
- [x] Settings Management (QRIS/Bank)
- [x] Target Urunan (Funding Targets)
- [x] Dashboard Widgets

### **Phase 3: Advanced Features** 🚧
- [ ] Real-time Notifications
- [ ] Mobile Responsive UI
- [ ] Profile Management
- [ ] Dark Mode
- [ ] Email Notifications
- [ ] Advanced Search & Filters
- [ ] Audit Log UI
- [ ] Bulk Operations

### **Phase 4: Future Enhancements** 📋
- [ ] Mobile App (React Native)
- [ ] Recurring Payments
- [ ] Multi-class Support
- [ ] Advanced Analytics
- [ ] API for External Integration
- [ ] WhatsApp Bot Integration
- [ ] Automated Reminders
- [ ] Budget Planning

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Authors

**TI26A3 Team**
- Bendahara: [Your Name]
- Developers: [Contributors]

---

## 🙏 Acknowledgments

- Next.js team for amazing framework
- Vercel for hosting platform
- Prisma for awesome ORM
- shadcn for beautiful UI components
- All contributors and testers

---

## 📞 Support & Contact

**Issues?**
- 🐛 Bug Reports: [GitHub Issues](https://github.com/YOUR_USERNAME/kas-ti26a3/issues)
- 💡 Feature Requests: [GitHub Discussions](https://github.com/YOUR_USERNAME/kas-ti26a3/discussions)
- 📧 Email: your-email@domain.com
- 💬 WhatsApp: +62xxx (Bendahara)

---

## 📸 Screenshots

### Admin Dashboard
![Admin Dashboard](docs/screenshots/admin-dashboard.png)

### Student Dashboard
![Student Dashboard](docs/screenshots/student-dashboard.png)

### Payment Flow
![Payment Flow](docs/screenshots/payment-flow.png)

### Target Urunan
![Funding Targets](docs/screenshots/funding-targets.png)

---

## 🌟 Star Us!

If you find this project useful, please consider giving it a ⭐️ on GitHub!

---

**Made with ❤️ by TI26A3**
