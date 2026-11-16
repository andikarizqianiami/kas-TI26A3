# 🔧 Troubleshooting Guide - KAS TI26A3

## Error 500 di Production

### Kemungkinan Penyebab:

1. **Missing Environment Variables**
2. **Database Connection Failed**
3. **Auth Configuration Error**
4. **Build Error**

---

## ✅ Diagnostic Steps

### 1. Check Health Endpoint

```bash
curl https://kas-ti26a3.vercel.app/api/health
```

**Expected Output:**
```json
{
  "status": "ok",
  "database": {
    "status": "connected"
  }
}
```

### 2. Check Debug Endpoint (Development)

```bash
curl https://kas-ti26a3.vercel.app/api/debug
```

Akan menampilkan info lengkap tentang environment dan database.

### 3. Check Vercel Logs

1. Buka: https://vercel.com/dikasaja/kas-ti26a3/logs
2. Filter by "Errors"
3. Lihat error message yang muncul

---

## 🔐 Environment Variables yang Harus Ada di Vercel

**Required (Harus ada):**

1. `DATABASE_URL`
   - Format: `postgresql://user:password@host:5432/database`
   - Get from: Neon, Supabase, atau Railway

2. `NEXTAUTH_SECRET`
   - Generate dengan: `openssl rand -base64 32`
   - Atau: `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`

3. `NEXTAUTH_URL`
   - Value: `https://kas-ti26a3.vercel.app`
   - **PENTING**: Harus pakai `https://` dan domain yang benar!

**Optional:**

- `ADMIN_DEFAULT_PASSWORD` - untuk seeding
- `BENDAHARA_DEFAULT_PASSWORD` - untuk seeding

---

## 🔄 Cara Set Environment Variables di Vercel

### Via Dashboard:

1. Buka: https://vercel.com/dikasaja/kas-ti26a3/settings/environment-variables
2. Klik "Add New"
3. Masukkan:
   - **Key**: Nama variable (misal: `NEXTAUTH_SECRET`)
   - **Value**: Nilai variable
   - **Environment**: Select semua (Production, Preview, Development)
4. Klik "Save"
5. **PENTING**: Redeploy project setelah add variable!

### Via CLI:

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Add variable
vercel env add NEXTAUTH_SECRET production
# Paste value saat diminta

# Redeploy
vercel --prod
```

---

## 🗄️ Database Issues

### Error: "Can't reach database server"

**Solusi:**

1. **Cek DATABASE_URL format:**
   ```
   postgresql://user:password@host:5432/database?sslmode=require
   ```

2. **Whitelist Vercel IPs** (jika database punya firewall):
   - Neon: Otomatis allow
   - Supabase: Add `0.0.0.0/0` atau specific Vercel IPs
   - Railway: Otomatis allow

3. **Test connection dari local:**
   ```bash
   export DATABASE_URL="your-production-url"
   npx prisma db push
   ```

### Database belum ada tabel

**Solusi:**

```bash
# Set DATABASE_URL production
export DATABASE_URL="your-production-url"

# Push schema
npx prisma db push

# Seed data
ADMIN_DEFAULT_PASSWORD='your-password' \
BENDAHARA_DEFAULT_PASSWORD='your-password' \
npx prisma db seed
```

---

## 🔑 Auth Issues

### Error: "Configuration error"

**Penyebab:** `NEXTAUTH_SECRET` tidak ada atau terlalu pendek.

**Solusi:**

```bash
# Generate secret
openssl rand -base64 32

# Add ke Vercel environment variables
# Minimal 32 karakter!
```

### Error: "Invalid URL"

**Penyebab:** `NEXTAUTH_URL` salah format atau tidak di-set.

**Solusi:**

Set `NEXTAUTH_URL` di Vercel:
```
https://kas-ti26a3.vercel.app
```

**Jangan lupa https:// dan tanpa trailing slash!**

---

## 🚀 Deployment Issues

### Build Success tapi Runtime Error 500

**Kemungkinan:**

1. **Environment variables belum di-set**
   - Solution: Set di Vercel dashboard → Redeploy

2. **Database connection failed**
   - Solution: Cek DATABASE_URL dan whitelist IPs

3. **Prisma client outdated**
   - Solution: Pastikan `postinstall` script jalan:
   ```json
   "postinstall": "prisma generate"
   ```

### Deployment Failed

**Check:**

1. **Build logs** di Vercel
2. **TypeScript errors**: Run `npm run build` locally
3. **Dependency issues**: Delete `node_modules` dan `npm install` ulang

---

## 📊 Step-by-Step Troubleshooting

### Scenario 1: Fresh Deploy Error 500

```bash
# 1. Check health
curl https://kas-ti26a3.vercel.app/api/health

# 2. Jika database error, set env vars:
# - Go to Vercel dashboard
# - Settings → Environment Variables
# - Add DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL

# 3. Redeploy
# - Go to Deployments
# - Click latest deployment → "Redeploy"

# 4. Setup database
export DATABASE_URL="your-production-url"
npx prisma db push
npx prisma db seed
```

### Scenario 2: Login Error

```bash
# 1. Check if users exist
export DATABASE_URL="your-production-url"
npx tsx scripts/check-admin-login.ts

# 2. If no users, seed:
ADMIN_DEFAULT_PASSWORD='admin123456789' \
BENDAHARA_DEFAULT_PASSWORD='bendahara123456789' \
npx prisma db seed

# 3. Try login again
```

### Scenario 3: Stuck on Loading

**Kemungkinan:** Browser cache

**Solution:**
- Hard refresh: `Ctrl + Shift + R` (Windows/Linux)
- Hard refresh: `Cmd + Shift + R` (Mac)
- Or: Open incognito/private window

---

## 🛠️ Quick Fixes

### Fix 1: Regenerate Everything

```bash
# 1. Generate new secret
NEW_SECRET=$(openssl rand -base64 32)
echo "NEXTAUTH_SECRET=$NEW_SECRET"

# 2. Update in Vercel
# Go to environment variables and update

# 3. Redeploy
```

### Fix 2: Reset Database

```bash
export DATABASE_URL="your-production-url"

# Warning: This deletes all data!
npx prisma migrate reset --force

# Then seed
ADMIN_DEFAULT_PASSWORD='admin123' \
npx prisma db seed
```

### Fix 3: Clear Vercel Cache

```bash
# Via CLI
vercel --prod --force

# Or via Dashboard:
# Settings → General → Clear Build Cache
```

---

## 📞 Still Having Issues?

### Check These:

1. ✅ Vercel deployment logs
2. ✅ Browser console errors (F12)
3. ✅ Network tab for failed requests
4. ✅ `/api/health` endpoint response
5. ✅ `/api/debug` endpoint response

### Common Solutions:

- 90% error fixed by setting environment variables
- 9% fixed by database setup/seed
- 1% actual code bugs

---

## 🎯 Checklist: Everything Working

- [ ] Homepage loads: https://kas-ti26a3.vercel.app
- [ ] Login page loads: https://kas-ti26a3.vercel.app/auth/login
- [ ] Health check OK: https://kas-ti26a3.vercel.app/api/health
- [ ] Can login with admin credentials
- [ ] Dashboard accessible after login

**If all checked, everything is working!** ✅

---

Last updated: November 2026
