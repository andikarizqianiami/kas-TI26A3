# IMPLEMENTATION PLAN — Sign Up Feature

## Status
✅ API Register dibuat: `/app/api/auth/register/route.ts`
⏳ Register Page: perlu dibuat
⏳ Homepage: perlu tambah button Sign Up
⏳ Login Page: perlu perbaiki tema + tambah link ke Register

## Files to Create/Modify

### 1. app/auth/register/page.tsx (CREATE)
Buat halaman register dengan tema dark navy sama seperti homepage.

Struktur:
- Logo UDB
- Judul "Daftar Akun"
- Form: Nama, NIM, Email, WhatsApp (optional), Password
- Button "Daftar"
- Link "Sudah punya akun? Login"

Style: dark bg #0a0e1a, form inputs dengan bg-white/5, border white/10

### 2. app/page.tsx (MODIFY)
Tambahkan button Sign Up di:
1. Navbar kanan: [ Login ] [ Sign Up ]
2. Hero section di bawah button Login

Contoh:
```tsx
<div className="flex gap-4 justify-center">
  <Link href="/auth/login" ...>Login</Link>
  <Link href="/auth/register" ...>Sign Up</Link>
</div>
```

### 3. app/auth/login/page.tsx (MODIFY)
Ubah tema dari light (bg-gradient-to-b from-blue-50 to-white) menjadi dark (#0a0e1a).

Ganti Card component menjadi div dengan styling manual:
- bg-white/5
- border border-white/10
- rounded-2xl
- backdrop-blur

Hapus akun demo box.
Ganti "Akun dibuat oleh Admin" menjadi link ke register.

## Design System

### Warna
- Background: #0a0e1a (dark navy)
- Surface: white/5 dengan backdrop-blur
- Border: white/10
- Text: white (heading), gray-400 (body), gray-600 (muted)
- Primary: blue-600
- Focus ring: blue-500

### Typography
Gunakan clamp() untuk responsive:
- H1: clamp(2.25rem, 5vw, 4.5rem)
- Body: clamp(1rem, 1.75vw, 1.25rem)

### Inputs
```tsx
className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
```

### Buttons
```tsx
className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
```

## Next Steps
1. Create `app/auth/register/page.tsx` dengan tema dark
2. Modify `app/page.tsx` — tambah button Sign Up
3. Modify `app/auth/login/page.tsx` — ubah ke tema dark
4. Test flow: Homepage → Register → Login → Dashboard
5. Test responsive di semua breakpoint

## API Already Done
✅ POST /api/auth/register
- Input: name, nim, email, password, whatsapp (optional)
- Output: { message, student: { id, nim, name } }
- Validasi: NIM unique, email unique
- Auto create User + Student dengan role MAHASISWA
