# ⚡ QRIS Quick Start - 5 Menit Setup!

## 🎯 Goal

Setup QRIS DANA untuk pembayaran kas TI26A3 dalam 5 menit!

---

## ✅ Prerequisites

- [x] Aplikasi sudah running (`npm run dev`)
- [x] Database sudah di-seed
- [x] QRIS DANA image sudah ready

---

## 🚀 5-Minute Setup

### STEP 1: Prepare QRIS Image (1 min)

```bash
# Copy QRIS image ke folder project
cp ~/Downloads/qris-dana.png /Users/otr1/Documents/kas-ti26a3/public/uploads/qris/
```

### STEP 2: Open Prisma Studio (1 min)

```bash
cd /Users/otr1/Documents/kas-ti26a3
npx prisma studio
```

Browser akan buka: http://localhost:5555

### STEP 3: Add QRIS Config (2 min)

1. Click table: **`payment_accounts`**
2. Click button: **"Add record"**
3. Fill form:

```
name: QRIS DANA - Bendahara TI26A3
type: QRIS_DANA
accountName: [Nama Bendahara Anda]
qrisImageUrl: /uploads/qris/qris-dana.png
description: Scan QRIS untuk pembayaran kas kelas
isActive: ✓ (check the box)
```

4. Click: **"Save 1 change"**

### STEP 4: Test! (1 min)

1. Buka: http://localhost:3000
2. Login: NIM `2026010001` / Password `mahasiswa123`
3. Click: "Bayar Sekarang"
4. **QRIS muncul!** ✅

---

## 🎉 DONE!

QRIS sudah aktif! Mahasiswa bisa bayar kas sekarang.

---

## 📝 What's Next?

### For Students:
1. Scan QRIS dengan app (DANA/OVO/GoPay)
2. Transfer Rp5.000
3. Screenshot bukti
4. Upload via form
5. Wait verifikasi

### For Bendahara:
1. Login: `bendahara@kas-ti26a3.test` / `bendahara123`
2. Go to: "Verifikasi Pembayaran"
3. Review bukti
4. Approve or Reject

---

## 🐛 Problem?

### QRIS tidak muncul?

```bash
# Check file exists
ls -la public/uploads/qris/

# Check Prisma Studio
# → payment_accounts table
# → type = QRIS_DANA
# → isActive = true

# Restart server
npm run dev
```

### Image broken?

```bash
# Check path
# Database: /uploads/qris/filename.png
# File: public/uploads/qris/filename.png

# Check permission
chmod 644 public/uploads/qris/*.png
```

---

## 📚 Full Docs

- **Complete Guide:** QRIS_PAYMENT_GUIDE.md
- **Detailed Setup:** SETUP_QRIS.md
- **Implementation:** QRIS_IMPLEMENTATION_SUMMARY.md

---

**That's it! QRIS ready in 5 minutes! 🚀**
