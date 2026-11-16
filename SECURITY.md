# Security Policy

## 🔒 Keamanan Aplikasi

Aplikasi ini mengelola data keuangan dan informasi mahasiswa yang sensitif. Keamanan adalah prioritas utama.

## ⚠️ Langkah-Langkah Keamanan Wajib

### 1. Setelah Deploy Pertama Kali

- [ ] **Ganti password admin dan bendahara** segera setelah login pertama
- [ ] **Verifikasi environment variables** di Vercel sudah benar
- [ ] **Aktifkan 2FA** untuk akun GitHub dan Vercel (jika tersedia)
- [ ] **Backup database** secara berkala

### 2. Environment Variables yang Sensitif

File berikut **TIDAK BOLEH** di-commit ke GitHub:
- `.env`
- `.env.local`
- `.env.production`
- Catatan login seperti `LOGIN_CREDENTIALS.md` (sudah masuk `.gitignore`)
- Any file containing passwords, API keys, or secrets

Script di `scripts/` membaca password lewat prompt tersembunyi dan NIM/email lewat argumen, jadi tidak ada kredensial yang ditulis di kode.

### Jika kredensial terlanjur ter-commit

1. Anggap kredensial itu sudah bocor, walaupun file-nya sudah dihapus (riwayat git dan fork tetap menyimpannya).
2. Ganti password akun terkait: `DATABASE_URL="<url produksi>" npx tsx scripts/fix-admin-bendahara.ts`.
3. Ganti `NEXTAUTH_SECRET` di Vercel lalu redeploy agar sesi lama (JWT, berlaku 30 hari) tidak bisa dipakai lagi.
4. Periksa tabel `audit_logs` untuk aktivitas yang tidak dikenal.

### 3. Password Policy

#### Admin & Bendahara:
- Minimal 12 karakter
- Kombinasi huruf besar, kecil, angka, dan simbol
- Tidak menggunakan password default
- Ganti password secara berkala (setiap 3-6 bulan)

#### Mahasiswa:
- Password default: NIM mahasiswa
- Mahasiswa **harus** mengganti password saat login pertama
- Minimal 6 karakter

### 4. Database Security

- ✅ Connection string menggunakan SSL (`sslmode=require`)
- ✅ Database hosted di Neon (managed PostgreSQL)
- ✅ Prisma ORM mencegah SQL injection
- ✅ Password di-hash dengan bcrypt (10 rounds)

### 5. API Security

- ✅ NextAuth untuk authentication
- ✅ JWT tokens untuk session management
- ✅ CORS protection
- ✅ Rate limiting (recommended untuk production)

### 6. Data yang Sensitif

**Data yang TIDAK BOLEH dibagikan publik:**
- Database connection string
- NEXTAUTH_SECRET
- Password admin/bendahara
- API keys payment gateway
- WhatsApp API keys

## 🐛 Melaporkan Vulnerability

Jika menemukan celah keamanan:

1. **JANGAN** post di GitHub Issues
2. Hubungi langsung administrator kelas
3. Jelaskan masalahnya secara detail
4. Berikan waktu untuk fix sebelum public disclosure

## 📝 Checklist Deployment

```bash
# 1. Pastikan .env tidak ter-commit
git status
git ls-files | grep .env

# 2. Cek apakah ada hardcoded secrets
git grep -i "password.*=.*'" "*.ts" "*.tsx"
git grep -i "api.*key.*=.*'" "*.ts" "*.tsx"

# 3. Verifikasi .gitignore
cat .gitignore | grep -E "\.env|secret|credential"

# 4. Check history untuk exposed secrets
git log --all --full-history -- "**/.env*"
```

## 🔄 Update Security

Dokumen ini akan diupdate seiring dengan perkembangan aplikasi.

**Last Updated**: September 2024
