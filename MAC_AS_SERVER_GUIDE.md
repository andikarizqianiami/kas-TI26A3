# 💻 Setup Mac Sebagai Public Server

## ⚠️ DISCLAIMER

**Tidak Direkomendasikan untuk Production!**

Alasan:
- IP rumah tidak stabil (berubah-ubah)
- ISP sering block port 80/443
- Mac harus nyala 24/7 (listrik mahal, hardware cepat rusak)
- Keamanan riskan (Mac Anda exposed ke internet)
- Bandwidth terbatas
- Jika Mac restart/mati, website down

**Untuk testing/demo saja!** ✅

---

## 🛠️ Langkah Setup (Testing Only)

### **Option 1: Ngrok (Paling Mudah) - RECOMMENDED**

Ngrok membuat tunnel dari Mac Anda ke internet.

#### 1. Install Ngrok

```bash
# Via Homebrew
brew install ngrok

# Atau download dari https://ngrok.com/download
```

#### 2. Signup & Get Auth Token

```bash
# Daftar di https://ngrok.com (gratis)
# Copy auth token dari dashboard

ngrok config add-authtoken YOUR_AUTH_TOKEN
```

#### 3. Run Development Server

```bash
cd /Users/otr1/Documents/kas-ti26a3
npm run dev
```

#### 4. Start Ngrok Tunnel

```bash
# Di terminal baru
ngrok http 3000
```

**Output:**
```
Session Status: online
Forwarding: https://abc123.ngrok-free.app -> http://localhost:3000
```

#### 5. Share URL

Sekarang aplikasi Anda bisa diakses publik di:
```
https://abc123.ngrok-free.app
```

**Kelebihan:**
- ✅ Setup 2 menit
- ✅ HTTPS otomatis
- ✅ Tidak perlu router config
- ✅ Gratis untuk testing

**Kekurangan:**
- ❌ URL berubah setiap restart (kecuali pakai paid plan)
- ❌ Ada warning page di Ngrok free
- ❌ Bandwidth terbatas
- ❌ Tidak untuk production

---

### **Option 2: Cloudflare Tunnel (Lebih Stabil)**

Alternatif Ngrok yang lebih profesional.

#### 1. Install Cloudflared

```bash
brew install cloudflare/cloudflare/cloudflared
```

#### 2. Login Cloudflare

```bash
cloudflared tunnel login
```

Browser akan terbuka, login ke Cloudflare.

#### 3. Create Tunnel

```bash
cloudflared tunnel create kas-ti26a3
```

#### 4. Setup Config

```bash
nano ~/.cloudflared/config.yml
```

Isi:
```yaml
tunnel: YOUR_TUNNEL_ID
credentials-file: /Users/otr1/.cloudflared/YOUR_TUNNEL_ID.json

ingress:
  - hostname: kas-ti26a3.your-domain.com
    service: http://localhost:3000
  - service: http_status:404
```

#### 5. Route DNS

```bash
cloudflared tunnel route dns kas-ti26a3 kas-ti26a3.your-domain.com
```

#### 6. Run Tunnel

```bash
# Run dev server
npm run dev

# Di terminal baru, run tunnel
cloudflared tunnel run kas-ti26a3
```

**Kelebihan:**
- ✅ URL tetap
- ✅ Tidak ada warning page
- ✅ Integrasi dengan Cloudflare DNS
- ✅ DDoS protection

**Kekurangan:**
- ❌ Perlu domain sendiri
- ❌ Setup lebih kompleks
- ❌ Tetap butuh Mac nyala 24/7

---

### **Option 3: Port Forwarding (Tidak Recommended)**

Setup router untuk expose Mac ke internet langsung.

**⚠️ SANGAT TIDAK DIREKOMENDASIKAN!**
- Risiko keamanan tinggi
- ISP mungkin block port 80/443
- IP berubah-ubah
- Butuh Dynamic DNS

---

## 🎯 **Perbandingan Solusi**

| Solusi | Setup | Stabil | Biaya | Production Ready |
|--------|-------|--------|-------|------------------|
| **Vercel** ✅ | 5 menit | ⭐⭐⭐⭐⭐ | Gratis | ✅ Yes |
| **Ngrok** | 2 menit | ⭐⭐⭐ | Gratis | ❌ Demo only |
| **Cloudflare Tunnel** | 15 menit | ⭐⭐⭐⭐ | Gratis | ⚠️ Jika Mac on 24/7 |
| **Mac + Port Forward** | 1 jam | ⭐ | Gratis | ❌ No |

---

## 💡 **Rekomendasi Saya**

### **Untuk Demo/Testing Ke Teman:**
✅ **Gunakan Ngrok**
```bash
# Quick start
brew install ngrok
ngrok config add-authtoken YOUR_TOKEN
npm run dev
ngrok http 3000
# Share URL yang muncul
```

### **Untuk Production (Diakses Publik Terus):**
✅ **Tetap di Vercel** - `kas-ti26a3.vercel.app`

Alasan:
- Gratis
- Stabil 99.99% uptime
- Cepat (CDN global)
- Tidak perlu Mac nyala
- Zero maintenance

### **Jika Budget Ada:**
✅ **Vercel + Custom Domain**
- Beli domain .com (~150k/tahun)
- Setup DNS ke Vercel
- Profesional dan stabil

---

## 🔐 **Keamanan Jika Tetap Pakai Mac**

Jika tetap mau expose Mac ke public:

### 1. Update Environment Variables

```bash
# .env.local
NEXTAUTH_URL=https://your-ngrok-url.ngrok-free.app
```

### 2. Firewall Mac

```bash
# Enable firewall
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --setglobalstate on

# Only allow necessary apps
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --add /Applications/Node.app
```

### 3. Jangan Expose Database Port

Pastikan PostgreSQL hanya listen ke localhost:
```
# postgresql.conf
listen_addresses = 'localhost'
```

### 4. Use Strong Passwords

Ganti semua password default ke password kuat.

### 5. Monitor Access Logs

```bash
# Check Ngrok dashboard untuk lihat traffic
# https://dashboard.ngrok.com
```

---

## 📊 **Biaya Perbandingan (1 Tahun)**

| Solusi | Biaya | Listrik | Total |
|--------|-------|---------|-------|
| **Vercel** | Rp 0 | Rp 0 | **Rp 0** ✅ |
| **Mac 24/7** | Rp 0 | ~Rp 1.5 juta* | **Rp 1.5 juta** |
| **Vercel + Domain .com** | Rp 150k | Rp 0 | **Rp 150k** ⭐ |

*Asumsi: Mac 50W, listrik Rp 1.500/kWh, 24/7 selama setahun

---

## ✅ **Quick Start: Ngrok untuk Demo**

Cara tercepat share aplikasi dari Mac:

```bash
# 1. Install (sekali aja)
brew install ngrok

# 2. Daftar & config (sekali aja)
# Daftar di https://ngrok.com
ngrok config add-authtoken YOUR_AUTH_TOKEN

# 3. Run app Anda
cd /Users/otr1/Documents/kas-ti26a3
npm run dev

# 4. Di terminal baru, start ngrok
ngrok http 3000

# 5. Copy URL yang muncul (contoh: https://abc123.ngrok-free.app)
# 6. Share ke teman untuk testing!
```

**Selesai!** Dalam 5 menit, aplikasi Anda bisa diakses dari mana saja! 🚀

---

## ⚡ **TL;DR (Kesimpulan)**

**Untuk Demo/Testing:**
- ✅ Pakai **Ngrok** (5 menit setup)

**Untuk Production:**
- ✅ Tetap pakai **Vercel** (gratis, stabil)
- ✅ Atau Vercel + custom domain (Rp 150k/tahun)

**Mac sebagai server 24/7:**
- ❌ **Tidak recommended** (mahal, tidak stabil, risiko keamanan)

---

**Kesimpulan:** Pakai Ngrok untuk demo ke teman, tapi untuk production tetap di Vercel! 🎯
