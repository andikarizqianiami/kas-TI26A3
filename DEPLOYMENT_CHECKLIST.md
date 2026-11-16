# 🚀 Deployment Checklist - KAS TI26A3

## ✅ Pre-Deployment

### 1. Environment Variables di Vercel

Pastikan environment variables berikut sudah diset di Vercel Dashboard:

**Required:**
- `DATABASE_URL` - PostgreSQL connection string (dari Neon/Supabase/Railway)
- `NEXTAUTH_SECRET` - Generate dengan: `openssl rand -base64 32`
- `NEXTAUTH_URL` - URL production Anda (misal: `https://kas-ti26a3.vercel.app`)

**Optional:**
- `ADMIN_DEFAULT_PASSWORD` - Password default admin (untuk seeding)
- `BENDAHARA_DEFAULT_PASSWORD` - Password default bendahara (untuk seeding)

### 2. Database Setup

```bash
# 1. Push schema ke database production
npx prisma db push

# 2. Seed database dengan data awal
ADMIN_DEFAULT_PASSWORD='your-password' BENDAHARA_DEFAULT_PASSWORD='your-password' npx prisma db seed
```

### 3. Vercel Configuration

Di Vercel Dashboard → Project Settings:

1. **Build & Development Settings**
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`

2. **Environment Variables**
   - Add semua variables dari `.env.example`
   - Set untuk Environment: Production, Preview, Development

3. **Deployment**
   - Auto-deploy on push to `main` branch

## 🔐 Reset Password Admin/Bendahara

### Option 1: Via Script (Local to Production DB)

```bash
# Set DATABASE_URL ke production
export DATABASE_URL="your-production-database-url"

# Edit password di scripts/quick-reset-admin.ts
# Lalu jalankan:
npx tsx scripts/quick-reset-admin.ts
```

### Option 2: Via Secure Script (Interactive)

```bash
npx tsx scripts/fix-admin-bendahara.ts
```

## 📝 Login Credentials

### Default (Setelah Seeding):

**Admin:**
- Email: `admin@ti26a3.udb.ac.id`
- Password: (yang Anda set di ADMIN_DEFAULT_PASSWORD)

**Bendahara:**
- Email: `bendahara@ti26a3.udb.ac.id`
- Password: (yang Anda set di BENDAHARA_DEFAULT_PASSWORD)

## 🔍 Troubleshooting

### Error: "Configuration error"
- Pastikan `NEXTAUTH_SECRET` sudah diset di Vercel
- Pastikan `NEXTAUTH_URL` sesuai dengan domain production

### Error: "Database connection failed"
- Cek `DATABASE_URL` format: `postgresql://user:pass@host:5432/dbname`
- Pastikan database accessible dari Vercel (tidak localhost)

### Error: "CredentialsSignin"
- Email/NIM atau password salah
- Reset password dengan script di atas

### Halaman stuck di "Loading..."
- Clear browser cache (Ctrl+Shift+R atau Cmd+Shift+R)
- Cek Vercel deployment logs untuk errors

## 🌐 URLs

- **Production**: https://kas-ti26a3.vercel.app
- **Login**: https://kas-ti26a3.vercel.app/auth/login
- **Dashboard**: https://kas-ti26a3.vercel.app/dashboard
- **Vercel Dashboard**: https://vercel.com/dikasaja/kas-ti26a3

## 📊 Monitoring

- **Vercel Analytics**: https://vercel.com/dikasaja/kas-ti26a3/analytics
- **Logs**: https://vercel.com/dikasaja/kas-ti26a3/logs
- **Database**: Check your database provider dashboard

## 🔄 Update Process

1. Make changes locally
2. Test with `npm run build`
3. Commit and push to GitHub
4. Vercel auto-deploys (2-5 minutes)
5. Check deployment status in Vercel dashboard

---

**Last Updated**: November 2026
