# 🚀 DEPLOY NOW - Action Checklist

File ini berisi langkah-langkah KONKRET untuk deploy KAS TI26A3 ke production **SEKARANG**.

---

## ⚡ QUICK START (10 Menit)

### **Step 1: Push ke GitHub** (2 menit)

```bash
# Di terminal, jalankan command ini satu per satu:

cd /Users/otr1/Documents/kas-ti26a3

# Add all files
git add .

# Commit
git commit -m "Production ready - Full features

✅ Complete Features:
- Authentication & Authorization (Admin, Bendahara, Mahasiswa)
- Bills Management (Create, View, Pay, History)
- Payment System (QRIS + Manual Transfer)
- Cash Management (Income/Expense tracking)
- Reports & Export (PDF/Excel)
- Settings (QRIS, Bank Account)
- User Management (Add/Edit students)
- Announcements System
- Funding Targets (Target Urunan untuk events)
- Dashboard Analytics & Widgets
- Audit Logging
- Notifications

🔧 Tech Stack:
- Next.js 16 + React 19
- PostgreSQL + Prisma ORM
- NextAuth.js
- TypeScript
- Tailwind CSS + Shadcn UI
- Recharts

📚 Documentation:
- README.md - Full guide
- DEPLOYMENT.md - Deploy guide
- QUICKSTART.md - Quick start
- GIT_SETUP.md - Git guide
- FITUR_TARGET_URUNAN.md - Funding targets docs
"

# Create GitHub repo (buka browser):
# https://github.com/new
# Repository name: kas-ti26a3
# Description: Sistem Manajemen Kas Kelas Digital - Next.js 16 + PostgreSQL
# Public
# DON'T add README/gitignore/license (sudah ada)
# Create repository

# Add remote (GANTI YOUR_USERNAME!)
git remote add origin https://github.com/YOUR_USERNAME/kas-ti26a3.git

# Push
git branch -M main
git push -u origin main
```

✅ **Selesai!** Code sudah di GitHub.

---

### **Step 2: Setup Database** (3 menit)

**Option A: Supabase (RECOMMENDED - Paling Mudah)**

1. **Buka:** https://supabase.com
2. **Sign up / Login** dengan GitHub
3. **New Project:**
   - Name: `kas-ti26a3`
   - Database Password: Buat strong password (SIMPAN!)
   - Region: `Singapore (Southeast Asia)`
   - Click "Create new project"
4. **Tunggu ~2 menit** sampai "Setting up project..." selesai
5. **Get Connection String:**
   - Sidebar: Settings → Database
   - Scroll ke "Connection string"
   - Tab: **"Session pooling"** (IMPORTANT!)
   - Mode: Connection parameters
   - Copy the connection string:
     ```
     postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
     ```
   - **GANTI `[PASSWORD]`** dengan password yang Anda buat tadi!

**Option B: Neon (Alternative)**

1. https://neon.tech
2. Sign up → New Project: `kas-ti26a3`
3. Copy connection string

**Option C: Railway (Alternative)**

1. https://railway.app
2. New Project → Deploy PostgreSQL
3. Variables tab → Copy `DATABASE_URL`

✅ **Simpan connection string!** Akan dipakai di Step 3.

---

### **Step 3: Deploy ke Vercel** (5 menit)

1. **Buka:** https://vercel.com
2. **Sign up / Login** dengan GitHub
3. **Import Project:**
   - Click "Add New..." → "Project"
   - Import Git Repository
   - Select repository: `kas-ti26a3`
   - Click "Import"

4. **Configure Project:**
   - Framework Preset: **Next.js** (auto-detected)
   - Root Directory: `./` (default)
   - Build Command: `prisma generate && next build` (auto)
   - Output Directory: `.next` (auto)

5. **Environment Variables:**
   
   Click "Environment Variables" dan tambahkan satu per satu:

   **Variable 1: DATABASE_URL**
   ```
   Name: DATABASE_URL
   Value: <paste connection string dari Step 2>
   ```
   Example: `postgresql://postgres.abcd123:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres`

   **Variable 2: NEXTAUTH_URL**
   ```
   Name: NEXTAUTH_URL
   Value: https://kas-ti26a3.vercel.app
   ```
   (Ganti `kas-ti26a3` dengan nama project Vercel Anda kalau beda)

   **Variable 3: NEXTAUTH_SECRET**
   ```
   Name: NEXTAUTH_SECRET
   Value: <generate random string>
   ```
   
   **Generate NEXTAUTH_SECRET:**
   - Di terminal: `openssl rand -base64 32`
   - Atau online: https://generate-secret.vercel.app/32
   - Copy hasilnya, paste ke Value

   **Variable 4: DEMO_MODE (Optional)**
   ```
   Name: DEMO_MODE
   Value: false
   ```

6. **Deploy:**
   - Click "Deploy"
   - Tunggu 2-3 menit...
   - Status akan berubah: Building → Deploying → Ready
   - ✅ **SUCCESS!**

7. **Copy URL:**
   - Vercel akan kasih URL: `https://kas-ti26a3-xxx.vercel.app`
   - Click "Visit" untuk buka app

---

### **Step 4: Setup Database Schema** (2 menit)

Setelah deploy, database masih kosong. Perlu disetup:

**Option A: Via Vercel CLI (Recommended)**

```bash
# Install Vercel CLI (kalau belum)
npm install -g vercel

# Login
vercel login

# Link project (pilih project yang baru di-deploy)
vercel link

# Pull environment variables
vercel env pull .env.production

# Run migration
DATABASE_URL="<connection-string>" npx prisma migrate deploy

# Seed database
DATABASE_URL="<connection-string>" npx prisma db seed
```

**Option B: Manual via SQL**

1. Buka Supabase SQL Editor
2. Copy semua content dari file migrations di `prisma/migrations/`
3. Run SQL manually
4. Atau: Generate SQL script dan run

**Option C: Via Prisma Studio**

```bash
# Set DATABASE_URL
export DATABASE_URL="<connection-string>"

# Run migrations
npx prisma migrate deploy

# Seed
npx prisma db seed

# Open studio
npx prisma studio
```

✅ **Database ready!**

---

## 🎉 DONE! App is LIVE!

### **Test Your App:**

1. **Buka deployment URL:** `https://your-app.vercel.app`
2. **Login sebagai Admin:**
   ```
   Email: admin@kas-ti26a3.test
   Password: admin123
   ```
3. **Ganti password:**
   - Profile → Change Password
4. **Test features:**
   - Create bill
   - Add student
   - View dashboard
   - Make announcement

### **Share dengan Teman:**
```
🎉 Kas Kelas TI26A3 sekarang online!

📱 Link: https://your-app.vercel.app

👤 Login:
- Admin: admin@kas-ti26a3.test / admin123
- Mahasiswa: [NIM] / [password dari bendahara]

💰 Fitur:
✅ Bayar kas mingguan
✅ Lihat riwayat pembayaran
✅ Target urunan untuk events
✅ Dashboard real-time
✅ Notifikasi otomatis
✅ Laporan PDF/Excel

📞 Kontak: [WhatsApp bendahara]
```

---

## 🔧 Post-Deployment Tasks

### **A. Security (WAJIB!):**

- [ ] Ganti semua password default
- [ ] Update NEXTAUTH_SECRET
- [ ] Set DEMO_MODE=false
- [ ] Enable HTTPS (auto di Vercel)
- [ ] Review database access rules
- [ ] Setup backup strategy

### **B. Configuration:**

- [ ] Upload QRIS image di Settings
- [ ] Input nomor rekening bank
- [ ] Set jam tagihan mingguan
- [ ] Configure WhatsApp API (optional)
- [ ] Setup email service (optional)

### **C. Content:**

- [ ] Add all students
- [ ] Create first announcement
- [ ] Set weekly bill amount
- [ ] Test payment flow end-to-end

### **D. Monitoring:**

- [ ] Check Vercel Analytics
- [ ] Setup error tracking (Sentry optional)
- [ ] Monitor database usage
- [ ] Setup uptime monitoring (UptimeRobot)

---

## 📱 Custom Domain (Optional)

Mau pakai domain sendiri? Misal: `kas.ti26a3.com`

### **Di Vercel:**
1. Project Settings → Domains
2. Add Domain: `kas.ti26a3.com`
3. Vercel kasih instruksi DNS

### **Di Domain Provider (Namecheap/GoDaddy/etc):**
1. DNS Settings
2. Add CNAME record:
   ```
   Type: CNAME
   Name: kas (atau @)
   Value: cname.vercel-dns.com
   ```
3. Save → Wait ~5-30 minutes untuk propagation
4. ✅ Done! Access via custom domain

---

## 🐛 Troubleshooting

### **Deploy Gagal:**

**Error: "Build failed"**
```bash
# Check logs di Vercel dashboard
# Biasanya:
# 1. Missing env vars → Add di Vercel
# 2. TypeScript error → Fix lalu push
# 3. Prisma issue → npx prisma generate
```

**Error: "Runtime error"**
```bash
# Check Vercel Logs: Functions tab
# Biasanya:
# 1. Database connection failed → Check DATABASE_URL
# 2. Missing env vars → Add di Vercel Settings
```

### **Database Connection Failed:**

```bash
# Test connection locally:
psql "postgresql://user:pass@host:5432/db" -c "SELECT 1"

# Check:
# 1. Password correct?
# 2. Host reachable?
# 3. Database exists?
# 4. SSL mode? (add ?sslmode=require)
```

### **Cannot Login:**

```bash
# Re-seed database:
DATABASE_URL="..." npx prisma db seed

# Or create admin manually via Prisma Studio
```

### **Vercel Shows Old Version:**

```bash
# Hard refresh browser: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
# Or redeploy: Push new commit to GitHub
```

---

## 📊 What You Get

After deployment, you have:

- ✅ **Production URL:** `https://your-app.vercel.app`
- ✅ **Auto HTTPS:** SSL certificate included
- ✅ **Auto Deploy:** Push to GitHub = auto deploy
- ✅ **Database:** PostgreSQL hosted
- ✅ **Monitoring:** Vercel Analytics
- ✅ **Logs:** Real-time logs di Vercel
- ✅ **Scalable:** Auto-scale dengan traffic
- ✅ **Free:** $0/month untuk start

---

## 💰 Costs

### **Free Tier:**
- **Vercel:** Free (untuk personal/hobby)
- **Supabase:** Free 500MB database + 2GB bandwidth
- **Domain:** $10-15/year (optional)

### **If Need Upgrade:**
- **Vercel Pro:** $20/month (more deployments, analytics)
- **Supabase Pro:** $25/month (8GB database, better performance)

**For class project: FREE TIER IS ENOUGH!**

---

## 🎓 Best Practices

### **Git Workflow:**
```bash
# Always pull before start
git pull origin main

# Work...

# Commit frequently
git add .
git commit -m "Fix payment bug"
git push

# Auto-deploy to production ✅
```

### **Database Backups:**
```bash
# Supabase auto-backup daily (free tier: 7 days)
# Manual backup:
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql
```

### **Monitor:**
- Check Vercel dashboard daily
- Review error logs weekly
- Database usage monitoring
- User feedback

---

## 🆘 Need Help?

### **Documentation:**
- [README.md](README.md) - Complete guide
- [DEPLOYMENT.md](DEPLOYMENT.md) - Detailed deployment
- [QUICKSTART.md](QUICKSTART.md) - Quick start guide
- [GIT_SETUP.md](GIT_SETUP.md) - Git tutorial

### **Support:**
- **Vercel Docs:** https://vercel.com/docs
- **Supabase Docs:** https://supabase.com/docs
- **Next.js Docs:** https://nextjs.org/docs
- **Prisma Docs:** https://prisma.io/docs

### **Issues:**
- GitHub Issues: Report bugs
- Vercel Support: For deployment issues
- Supabase Support: For database issues

---

## ✅ Final Checklist

Before announcing to class:

- [ ] App deployed and accessible
- [ ] Database migrated and seeded
- [ ] Admin can login
- [ ] Student can login with NIM
- [ ] Bills can be created
- [ ] Payments can be made
- [ ] QRIS/Transfer settings configured
- [ ] All documentation updated with actual URLs
- [ ] Tested on mobile
- [ ] Tested on different browsers
- [ ] Backup strategy in place
- [ ] Contact info updated

---

## 🎉 Congratulations!

Your class cash management system is now LIVE and ready to use!

**Production URL:** `https://your-app.vercel.app`

**Next:** Share with class, start collecting kas! 💰

---

**Created:** $(date +"%Y-%m-%d")
**Status:** ✅ PRODUCTION READY
**Version:** 1.0.0

---

Good luck! 🚀
