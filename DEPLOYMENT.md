# 🚀 Deployment Guide - KAS TI26A3

Panduan lengkap untuk deploy aplikasi KAS TI26A3 ke production.

---

## 📋 Prerequisites

Sebelum deploy, pastikan Anda punya:
- ✅ Akun GitHub
- ✅ Akun Vercel (gratis) atau Railway/Render
- ✅ Database PostgreSQL (Supabase/Neon/Railway)
- ✅ Domain (opsional, bisa pakai subdomain gratis dari Vercel)

---

## 🎯 Option 1: Deploy ke Vercel (RECOMMENDED)

Vercel adalah platform terbaik untuk Next.js dengan setup paling mudah.

### **Step 1: Setup Database**

#### **Pilihan A: Supabase (Recommended)**
1. Buka https://supabase.com
2. Sign up / Login
3. Create New Project:
   - Name: `kas-ti26a3`
   - Database Password: (simpan ini!)
   - Region: Singapore
4. Tunggu ~2 menit sampai database ready
5. Go to Project Settings → Database
6. Copy **Connection String** (mode: Session pooling)
   ```
   postgresql://postgres:[PASSWORD]@db.xxx.supabase.co:5432/postgres
   ```

#### **Pilihan B: Neon (Alternative)**
1. Buka https://neon.tech
2. Sign up / Login
3. Create Project: `kas-ti26a3`
4. Copy connection string

#### **Pilihan C: Railway (Alternative)**
1. Buka https://railway.app
2. New Project → Deploy PostgreSQL
3. Copy connection string dari Variables tab

### **Step 2: Push ke GitHub**

```bash
cd /Users/otr1/Documents/kas-ti26a3

# Initialize git (if not already)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - KAS TI26A3 production ready"

# Create GitHub repo (via web) then:
git remote add origin https://github.com/YOUR_USERNAME/kas-ti26a3.git
git branch -M main
git push -u origin main
```

### **Step 3: Deploy ke Vercel**

1. **Buka https://vercel.com**
2. **Login dengan GitHub**
3. **Import Project:**
   - Click "Add New Project"
   - Select repository: `kas-ti26a3`
   - Click "Import"

4. **Configure Environment Variables:**
   Click "Environment Variables" tab, tambahkan:

   ```env
   DATABASE_URL=postgresql://postgres:[PASSWORD]@db.xxx.supabase.co:5432/postgres
   
   NEXTAUTH_URL=https://your-project.vercel.app
   
   NEXTAUTH_SECRET=<generate dengan: openssl rand -base64 32>
   
   DEMO_MODE=false
   
   # Optional (jika pakai)
   MIDTRANS_SERVER_KEY=your-key
   MIDTRANS_CLIENT_KEY=your-key
   MIDTRANS_IS_PRODUCTION=false
   ```

5. **Deploy:**
   - Click "Deploy"
   - Tunggu 2-3 menit
   - ✅ Done! App live di `https://your-project.vercel.app`

### **Step 4: Run Database Migration**

Setelah deploy, Anda perlu setup database:

**Option A: Via Vercel CLI**
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Link project
vercel link

# Run migration
vercel env pull .env.production
npx prisma migrate deploy
npx prisma db seed
```

**Option B: Manual via Database GUI**
1. Copy file `prisma/schema.prisma`
2. Buka Supabase SQL Editor
3. Generate SQL dan run manual
4. Atau gunakan Prisma Studio:
   ```bash
   DATABASE_URL="your-production-url" npx prisma studio
   ```

### **Step 5: Test Production**

1. Buka `https://your-project.vercel.app`
2. Login dengan akun seed:
   - Admin: `admin@kas-ti26a3.test` / `admin123`
   - Student: `2026010001` / `mahasiswa123`
3. Test semua fitur

---

## 🎯 Option 2: Deploy ke Railway

Railway bagus untuk full-stack dengan database included.

### **Step 1: Deploy**

1. Buka https://railway.app
2. Login dengan GitHub
3. "New Project" → "Deploy from GitHub repo"
4. Select `kas-ti26a3`
5. Add PostgreSQL:
   - Click "New" → "Database" → "PostgreSQL"
   - Railway auto-link ke app

### **Step 2: Environment Variables**

Di Railway dashboard:
```env
DATABASE_URL=${{Postgres.DATABASE_URL}}
NEXTAUTH_URL=https://your-app.up.railway.app
NEXTAUTH_SECRET=<generate random>
```

### **Step 3: Build Command**

Settings → Build:
```
prisma generate && prisma migrate deploy && next build
```

Start Command:
```
npm run start
```

---

## 🎯 Option 3: Deploy ke VPS (Advanced)

Untuk kontrol penuh, deploy ke VPS seperti DigitalOcean/Linode.

### **Requirements:**
- VPS dengan Ubuntu 22.04
- Minimal 1GB RAM
- Node.js 18+
- PostgreSQL
- Nginx

### **Quick Setup:**

```bash
# 1. Install dependencies
sudo apt update
sudo apt install -y nodejs npm postgresql nginx

# 2. Setup PostgreSQL
sudo -u postgres createdb kas_ti26a3
sudo -u postgres createuser kasuser
sudo -u postgres psql -c "ALTER USER kasuser WITH PASSWORD 'yourpassword';"

# 3. Clone & Install
git clone https://github.com/YOUR_USERNAME/kas-ti26a3.git
cd kas-ti26a3
npm install

# 4. Setup Environment
cp .env.example .env
nano .env  # Edit with production values

# 5. Build
npm run build

# 6. Run with PM2
npm install -g pm2
pm2 start npm --name "kas-ti26a3" -- start
pm2 save
pm2 startup

# 7. Setup Nginx
sudo nano /etc/nginx/sites-available/kas-ti26a3
# Add config (see below)
sudo ln -s /etc/nginx/sites-available/kas-ti26a3 /etc/nginx/sites-enabled/
sudo systemctl restart nginx
```

**Nginx Config:**
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 🔒 Security Checklist

Sebelum go-live, pastikan:

- [ ] `NEXTAUTH_SECRET` diganti dengan random string (min 32 chars)
- [ ] `DEMO_MODE` set ke `false`
- [ ] Database credentials aman (jangan commit `.env`)
- [ ] HTTPS enabled (Vercel auto, VPS pakai Let's Encrypt)
- [ ] CORS configured properly
- [ ] Rate limiting enabled untuk API
- [ ] Update dependency ke versi stable
- [ ] Backup strategy setup

---

## 📊 Post-Deployment

### **Setup Domain Custom (Optional)**

**Di Vercel:**
1. Project Settings → Domains
2. Add domain: `kas.yourdomain.com`
3. Update DNS di domain provider:
   ```
   Type: CNAME
   Name: kas
   Value: cname.vercel-dns.com
   ```
4. Tunggu propagation (~5-30 menit)

### **Setup Monitoring**

1. **Vercel Analytics:**
   - Auto-enabled di Vercel dashboard
   - Lihat traffic, performance, errors

2. **Error Tracking:**
   - Integrate Sentry (optional)
   - Setup di `next.config.ts`

3. **Uptime Monitoring:**
   - UptimeRobot (free)
   - Ping setiap 5 menit

### **Setup Backup**

**Database Backup:**
```bash
# Daily backup script
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql

# Setup cron
0 2 * * * /path/to/backup-script.sh
```

**Supabase Auto-Backup:**
- Supabase has automatic daily backups
- Go to Project Settings → Database → Backups

---

## 🐛 Troubleshooting

### **Build Fails:**
```bash
# Clear cache
rm -rf .next node_modules
npm install
npm run build
```

### **Database Connection Error:**
- Check DATABASE_URL format
- Ensure database allows external connections
- Check IP whitelist (Supabase/Railway)

### **Prisma Issues:**
```bash
# Regenerate client
npx prisma generate

# Reset database (⚠️ deletes data!)
npx prisma migrate reset
```

### **Environment Variables Not Working:**
- Redeploy after adding env vars
- Check for typos in variable names
- Ensure no quotes around values in Vercel

---

## 📱 Mobile App (Future)

Untuk membuat mobile app:
1. API sudah ready (semua endpoint accessible)
2. Bisa pakai:
   - **React Native** (recommended)
   - **Flutter**
   - **Capacitor** (convert existing Next.js)
3. Base URL: `https://your-app.vercel.app/api`

---

## 💡 Tips

1. **Development → Staging → Production:**
   - Dev: Local
   - Staging: Vercel preview deployment
   - Production: Vercel production

2. **Git Workflow:**
   ```bash
   main → production
   develop → staging
   feature/* → development
   ```

3. **Database Migrations:**
   - Test locally first
   - Run `prisma migrate deploy` in production
   - Never run `prisma migrate dev` in production

4. **Environment Sync:**
   ```bash
   # Pull production env (safe - no secrets exposed)
   vercel env pull
   ```

---

## 🎉 Success!

Jika semua langkah diikuti, aplikasi Anda sekarang live di:
- ✅ Production URL
- ✅ Database PostgreSQL production
- ✅ Auto-deploy on git push
- ✅ HTTPS enabled
- ✅ Monitoring active

**Next Steps:**
1. Test semua fitur di production
2. Invite users untuk beta testing
3. Setup custom domain
4. Configure WhatsApp notifications (optional)
5. Setup payment gateway (Midtrans/Xendit)

---

## 📞 Support

**Issues?**
- Check Vercel logs: Dashboard → Deployment → Logs
- Database logs: Supabase → Logs Explorer
- App errors: Check browser console

**Need Help?**
- GitHub Issues: Create issue di repo
- Email: your-email@domain.com
- Documentation: README.md

---

**Happy Deploying! 🚀**
