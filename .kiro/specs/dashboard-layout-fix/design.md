# Dashboard Layout Fix — Bugfix Design

## Overview

Masalah di dashboard admin berasal dari dua sumber yang berbeda:

1. **Layout & spacing.** Akar masalahnya ada di `app/globals.css`, bukan di komponen. Reset elemen (`* { margin: 0; padding: 0 }`, `a`, `button, input`, `h1–h6`) ditulis di luar cascade layer, sedangkan Tailwind v4 menaruh semua utility di `@layer utilities`. Menurut aturan cascade layers, deklarasi tanpa layer selalu menang atas deklarasi di dalam layer, berapa pun specificity-nya. Akibatnya `mx-auto`, `p-6`, `py-4`, `space-y-*`, `mt-*`, serta `border`/padding pada tombol tidak pernah berlaku.
2. **State chart.** Chart sebenarnya ter-render normal bila data ada. Masalahnya, section chart hanya dirender saat `!chartsLoading && chartData`, jadi tidak ada apa pun saat loading atau saat API gagal. Saat data kosong, chart tampil sebagai sumbu kosong dan pie blank tanpa penjelasan.

Strategi perbaikan:
- Pindahkan reset elemen ke `@layer base` (perbaikan akar).
- Hapus tambalan `!important` dan selector invalid yang dibuat untuk mengakali gejala.
- Pecah bagian chart menjadi komponen dengan state eksplisit `loading | error | ready`, empty state per chart, dan error boundary.

## Glossary

- **Bug_Condition (C)**: kondisi render dashboard yang memicu bug (`isBugCondition` di `bugfix.md`).
- **Property (P)**: perilaku yang benar untuk input yang memenuhi C.
- **Preservation**: perilaku di luar C yang harus tetap sama (requirement 4.x).
- **Unlayered CSS**: rule CSS di luar `@layer`. Untuk deklarasi normal (bukan `!important`), rule ini selalu mengalahkan rule di layer mana pun.
- **Harness preview**: halaman sementara `app/kiro-preview` yang merender `AdminDashboard` asli dengan `window.fetch` di-mock (skenario `data`, `empty`, `error`, `loading`), lalu diukur lewat Chrome headless (CDP). Harness dihapus setelah verifikasi.

## Bug Details

### Bug Condition

```pascal
FUNCTION isBugCondition(X)
  INPUT: X of type DashboardRenderState
  OUTPUT: boolean

  RETURN X.utilityOverriddenByUnlayeredReset            // 1.1, 1.2, 1.3
      OR X.chartRequest IN {PENDING, FAILED}            // 2.1, 2.3
      OR (X.chartRequest = OK AND allSeriesZero(X.chartData))  // 2.2
END FUNCTION
```

### Temuan eksplorasi (kode sebelum diperbaiki)

Diukur dengan harness preview (data mock, Chrome headless):

| Skenario | Hasil pengukuran | Req |
|---|---|---|
| Data, viewport 1920px | Grid stat card `left = 16px`, sisa kanan `656px`: konten menempel ke kiri | 1.1, 1.2 |
| Data, 1920px | Judul chart berjarak 1px dari border kartu (padding `p-6` jadi 0) | 1.3 |
| Data, 1920px | Chart ter-render: 3 garis, 6 + 4 bar, 3 sektor pie | (chart tidak rusak saat data ada) |
| Data kosong | Sumbu kosong, pie kosong, tidak ada empty state | 2.2 |
| API chart HTTP 500 | 0 chart, tanpa pesan error dan tanpa tombol coba lagi | 2.3 |
| API chart pending | 0 chart, 0 skeleton; section muncul belakangan dan menggeser layout | 2.1 |
| Semua skenario | Request ke `/api/admin/funding-targets?status=ACTIVE` (endpoint sudah dihapus) dan menu ke `/dashboard/admin/funding-targets` (404) | 4.6, 4.7 |

Dev server juga memberi warning `'grid-cols-3' is not recognized as a valid pseudo-class` untuk `.lg\\:grid-cols-3` dan selector sejenis di `globals.css`.

## Root Cause Analysis

1. **Reset tanpa layer mengalahkan utility Tailwind v4.** Di CSS hasil compile, `*`, `a`, `button, input` berada di luar layer, sedangkan `.p-6`, `.mx-auto`, dan lainnya ada di `@layer utilities`. Ini menjelaskan konten yang tidak ter-center (`mx-auto` → `margin: 0`), kartu tanpa padding, dan spacing yang tidak konsisten.
2. **Token tema gelap yang sudah tidak ada.** Varian default `Card` memakai `bg-navy-900`, `border-electric-blue/20`, dan `text-foreground`. Token ini tidak terdefinisi sehingga tidak di-generate. Hasilnya kartu transparan dengan border `currentColor` (hitam, default border Tailwind v4). Varian `ghost`/`outline` pada `Button` (`text-gray-300`, `text-blue-400`) juga dirancang untuk latar gelap, sehingga kontrasnya rendah di header dan menu.
3. **Tambalan yang ikut bermasalah.**
   - `.py-8/.px-4/.mb-8/.gap-6/.grid` versi `!important` nilainya sama dengan Tailwind, tetapi memblokir varian responsif seperti `sm:px-6`.
   - Selector `md\\:`/`lg\\:` memakai double backslash sehingga invalid dan dibuang browser.
   - `.recharts-wrapper { padding: 16px !important }` menggeser setiap chart.
4. **State chart tidak dimodelkan.** Hanya ada boolean `chartsLoading` dan `chartData`. Tidak ada cabang loading/error/empty dan tidak ada error boundary.
5. **Sisa fitur Target Urunan.** Fitur ini dihapus di commit `5378f66`, tetapi `FundingTargetsWidget` dan menu "Target Urunan" masih tertinggal di `AdminDashboard`.

## Correctness Properties

**Property 1 — Fix: layout (3.1, 3.2).** Untuk viewport ≥ 1400px + padding, container ter-center (`|gap kiri − gap kanan| ≤ 1px`) dengan `max-width: 1400px`, sama dengan `.container` di halaman admin lain. Keempat stat card sama lebar, sejajar di satu baris pada ≥ 1024px, dan nilainya tidak overflow.

**Property 2 — Fix: spacing (3.3).** Spacing mengikuti satu skala: 24px antar kartu dalam grid, 32px antar section, dan padding kartu 24px.

**Property 3 — Fix: charts (3.4–3.6).**
- Data ada → chart ter-render.
- Semua seri nol atau kosong → empty state (ikon, pesan, aksi opsional) dengan tinggi sama dengan chart.
- Request pending → skeleton.
- Request gagal → error state dengan tombol "Coba lagi".
- Error saat render → fallback per chart.

**Preservation (4.1–4.7).**
- Gradien `.stat-card-1..4` dan animasi hover tetap.
- Nilai stat card dihitung dari endpoint dan rumus yang sama.
- Breakpoint grid tetap (`md:2`/`lg:4` untuk stat, `md:2`/`lg:3` untuk menu).
- Enam link menu tetap mengarah ke halaman yang sama.
- Logout tetap ke `/api/auth/signout`.
- Halaman publik (landing, login, register) tetap identik.

## Fix Implementation

### `app/globals.css`
- Bungkus reset `*`, `a`, `button, input`, dan `h1–h6` dengan `@layer base`.
- Hapus override yang tidak diperlukan lagi atau mengganggu:
  - `.recharts-wrapper { padding: 16px !important }` (menggeser plot);
  - blok "Responsive Grid" (`.md\\:grid-cols-2` dkk.) yang invalid dan dibuang browser;
  - blok "Spacing Utilities" (`.py-8/.px-4/.mb-8 !important`). Nilainya sama dengan Tailwind, tetapi `.px-4 !important` memblokir `sm:px-6 lg:px-8`.
- `.bg-white { background/box-shadow !important }` dipersempit menjadi `.border-b.bg-white` (header bar). Begitu `Card` memakai `bg-white`, rule global ini mengalahkan gradien `.stat-card-*`. Sebelumnya satu-satunya pemakai `bg-white` adalah header halaman payments (`border-b bg-white`), dan header itu tetap ter-cover.
- Tetap dipertahankan:
  - blok "COLORFUL CARDS". Dicek di browser: selector valid `.grid.gap-4 > div:nth-child(n)` tetap aktif dan mewarnai kartu ringkasan di `/dashboard/admin/bills` dan `/dashboard/bills/history`. Warning build untuk bagian selector `md\\:` yang invalid sudah ada sebelum fix ini;
  - `.grid`/`.gap-6`, `.stat-card-*`, `.menu-item`, `.container`;
  - style landing/login/dashboard mahasiswa.

### `components/ui/card.tsx`
- Varian default diganti ke token yang benar-benar ada: `bg-white border-slate-200 shadow-sm hover:shadow-md`. `CardTitle` diganti ke `text-slate-900`.

### `components/dashboard/admin/chart-data.ts` (baru)
- Tipe `ChartData`.
- `normalizeChartData()` agar respons yang tidak lengkap tidak membuat render crash.
- Fungsi deteksi data kosong per chart dan `formatCompactNumber()` untuk sumbu Y (contoh: `240 rb`).

### `components/dashboard/admin/ChartStates.tsx` (baru)
- `EmptyState`, `ErrorState` (dengan tombol "Coba lagi"), `ChartSkeleton`, dan `ChartErrorBoundary`.

### `components/dashboard/admin/DashboardCharts.tsx` (baru)
- Merender skeleton, error, atau chart berdasarkan `status`.
- Setiap chart dibungkus error boundary dan menampilkan empty state sendiri.
- Pie memakai `fill` dari data karena `Cell` sudah deprecated di Recharts 3.10, dan dilengkapi legend teks berisi jumlah serta persentase.

### `components/dashboard/AdminDashboard.tsx`
- Header dan konten memakai `mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8`. Section disusun dengan `space-y-8` dan grid `gap-6`.
- Header dibuat `sticky top-0`, sesuai asumsi requirement 4.5 (sebelumnya header tidak sticky).
- Stat card dirapikan lewat komponen `StatCard` (class gradien tetap). Ukuran nilai responsif (`text-2xl xl:text-3xl`) agar tidak overflow di 1024px.
- Menu Utama memakai link dengan class `.menu-item` yang sudah ada. Ini menggantikan `<button>` di dalam `<a>`, yang merupakan HTML invalid. Tombol Pengaturan yang hanya berupa ikon diberi `aria-label`.
- `fetchStats()` dan `fetchChartData()` menjadi fungsi murni yang mengembalikan data atau `null`. State hanya di-set dari callback promise (memenuhi rule `react-hooks/set-state-in-effect`). Retry tersedia untuk stat card dan chart. Endpoint dan rumus stat card tidak berubah.
- `FundingTargetsWidget` dan menu "Target Urunan" dihapus (lihat revisi 4.6 di `bugfix.md`).

## Dampak di Luar Dashboard

Karena akar masalahnya global, halaman lain yang memakai utility Tailwind ikut mendapat spacing sesuai class yang memang sudah ditulis, misalnya `container mx-auto` jadi ter-center. Halaman yang terdampak adalah `/dashboard/admin/*`, `/dashboard/bills/history`, dan `/dashboard/payment/[billId]`.

Landing, login, register, dan dashboard mahasiswa tidak memakai utility spacing Tailwind (sudah dicek dengan grep), sehingga tidak berubah. Ini diverifikasi dengan perbandingan piksel screenshot sebelum dan sesudah.

## Testing Strategy

Project belum punya test runner dan tidak ada permintaan untuk menambah test framework, jadi validasi dilakukan dengan cara berikut:

1. **Exploratory check** sebelum fix: harness preview dan pengukuran DOM (hasilnya ada di tabel di atas).
2. **Fix check**: pengukuran yang sama setelah fix pada viewport 500/768/1024/1280/1920px untuk semua skenario.
3. **Preservation check**: nilai stat card, href menu, jumlah kolom grid per breakpoint, dan screenshot halaman publik yang identik piksel.
4. **Build dan lint**: `npm run build` (termasuk type-check) dan ESLint pada file yang diubah.

### Hasil verifikasi (setelah fix)

| Cek | Hasil |
|---|---|
| Centering 1920px | Gap kiri = kanan = 292px, lebar konten 1336px (1400 − padding) |
| Kolom stat card | 1 (500px) · 2 (768px) · 4 (1024/1280/1920px), lebar sama, tanpa overflow nilai di 1024px |
| Spacing | Antar section 32px di semua viewport; judul chart berjarak 24px dari border |
| Chart dengan data | 3 garis, 10 bar, 3 sektor pie; tidak ada overflow horizontal |
| Data kosong | 5 empty state (ikon, pesan, aksi); tidak ada chart kosong |
| API chart 500 | Error state + "Coba lagi"; setelah retry yang berhasil, chart muncul |
| Pending | 10 blok skeleton dengan layout sama seperti chart |
| Payload parsial | Tidak crash: 1 pie + 4 empty state |
| Stat API gagal | "Gagal memuat statistik" + retry; setelah retry, nilai kembali benar |
| Preservation | Nilai 36 / 95 / 25 / Rp 1.250.000 sama; hover stat card −6px dan menu −4px; Logout tetap ke `/api/auth/signout`; tidak ada request funding-targets |
| Halaman publik | Landing, login, register (1440 & 500px) identik piksel dengan baseline |
| Console | Tidak ada warning React; hanya log error yang memang diharapkan di skenario gagal |
| Build/lint | `npm run build` sukses. ESLint seluruh project turun dari 107 ke 99 problem (8 problem di `AdminDashboard.tsx` hilang, tidak ada yang baru) |

## Perbaikan Lanjutan (setelah review)

- **Stat card untuk Bendahara.** Dashboard sebelumnya memanggil `/api/admin/students`, yang hanya boleh diakses ADMIN, sehingga Bendahara melihat "Total Mahasiswa" = 0. Sekarang stat card membaca endpoint baru `/api/admin/dashboard/summary`, yang bisa diakses ADMIN dan BENDAHARA. Endpoint ini hanya mengembalikan agregat (count/sum) tanpa PII. `/api/admin/students` tetap khusus ADMIN. Nilainya sudah dibandingkan dengan endpoint lama dan hasilnya identik.
- **Top 5 Mahasiswa Aktif.** Peringkat dihitung di database (`groupBy` tagihan PAID per mahasiswa aktif, urut berdasarkan jumlah lunas, lalu total nominal). Sebelumnya `take: 5` dijalankan sebelum pengurutan. `summary.totalStudents` sekarang menghitung semua mahasiswa (sebelumnya maksimal 5).
- Kedua perbaikan diverifikasi dengan login sungguhan (ADMIN, BENDAHARA, MAHASISWA) terhadap database lokal sementara berisi data palsu. Database itu sudah dihapus.
