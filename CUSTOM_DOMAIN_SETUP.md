# 🌐 Setup Custom Domain di Vercel

## Langkah-langkah:

### 1. Beli/Daftar Domain

**Option A: Domain Gratis (.my.id)**
1. Kunjungi: https://pandi.id
2. Daftar akun
3. Request domain `.my.id`
4. Verifikasi dengan KTP
5. Tunggu approval (1-3 hari)

**Option B: Beli Domain (.com/.net)**
- Niagahoster: https://niagahoster.co.id
- Cloudflare: https://cloudflare.com
- Namecheap: https://namecheap.com

Contoh domain bagus:
- `kasti26a3.com`
- `kasudb.com`
- `kasteknikinformatika.com`

### 2. Setup di Vercel

1. **Login ke Vercel Dashboard**
   - https://vercel.com/dikasaja/kas-ti26a3

2. **Ke Tab "Settings" → "Domains"**
   
3. **Add Domain**
   - Masukkan domain Anda (misal: `kasti26a3.com`)
   - Klik "Add"

4. **Vercel akan kasih instruksi DNS**
   - Biasanya suruh tambah CNAME record
   - Salin value yang dikasih Vercel

### 3. Setup DNS di Domain Provider

**Untuk domain dengan www:**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 3600
```

**Untuk root domain (non-www):**
```
Type: A
Name: @
Value: 76.76.21.21
TTL: 3600
```

**Alternative (lebih mudah):**
```
Type: CNAME
Name: @
Value: cname.vercel-dns.com
TTL: 3600
```

### 4. Tunggu Propagasi DNS

- Biasanya 10 menit - 48 jam
- Rata-rata: 1-2 jam
- Cek status di Vercel dashboard

### 5. SSL Certificate (Otomatis)

Vercel akan otomatis setup HTTPS/SSL untuk domain Anda.
Tunggu beberapa menit setelah domain verified.

## ✅ Verification

Cek apakah domain sudah aktif:
```bash
# Cek DNS
nslookup yourdomain.com

# Cek HTTPS
curl -I https://yourdomain.com
```

## 🔧 Troubleshooting

### Domain tidak bisa diakses setelah 24 jam

**Cek DNS:**
```bash
dig yourdomain.com
```

**Pastikan:**
1. DNS record benar
2. TTL tidak terlalu tinggi
3. Tidak ada conflicting records

### SSL Certificate Error

- Tunggu 5-10 menit setelah domain verified
- Vercel otomatis provision SSL dari Let's Encrypt
- Jika masih error setelah 1 jam, hapus domain dan add lagi

### Redirect Loop

Pastikan di Vercel settings:
- "Automatically create redirects for Apex Domains" ✅ ON

## 🎯 Recommended DNS Settings

```
# Root domain
@ A 76.76.21.21

# WWW subdomain  
www CNAME cname.vercel-dns.com

# Optional: Email (jika ada)
@ MX 10 mail.yourdomain.com
```

## 📝 Example: Niagahoster DNS Setup

1. Login ke Niagahoster
2. Menu: Domain → Manage Domain
3. Pilih domain Anda
4. Klik "DNS/Name Server"
5. Tambah record:
   ```
   Type: CNAME
   Host: @
   Points to: cname.vercel-dns.com
   TTL: 14400
   ```
6. Save changes

## 🌐 Update Environment Variables

Setelah domain aktif, update di Vercel:

```
NEXTAUTH_URL=https://yourdomain.com
```

## 🔐 Security Headers (Optional)

Di `next.config.ts`, tambah security headers untuk production domain.

---

**Setelah setup, aplikasi Anda bisa diakses di:**
- https://yourdomain.com
- https://www.yourdomain.com (jika setup)

**Old domain tetap aktif:**
- https://kas-ti26a3.vercel.app
