# Implementation Plan

- [x] 1. Eksplorasi bug condition pada kode sebelum diperbaiki
  - Harness preview sementara + Chrome headless, skenario `data` / `empty` / `error` / `loading`
  - Catat counterexample (lihat `design.md` › Temuan eksplorasi)
  - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 2.3_

- [x] 2. Rekam baseline preservation sebelum fix
  - Nilai stat card, href Menu Utama, kolom grid per breakpoint, screenshot halaman publik
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.7_

- [x] 3. Perbaikan
  - [x] 3.1 Pindahkan reset elemen di `globals.css` ke `@layer base`; hapus override `!important` dan selector invalid yang terkait; persempit `.bg-white` ke header bar
    - _Bug_Condition: utilityOverriddenByUnlayeredReset_
    - _Requirements: 3.1, 3.2, 3.3_
  - [x] 3.2 Perbaiki varian default `Card` untuk tema terang
    - _Requirements: 3.3_
  - [x] 3.3 Tambah `components/dashboard/admin/chart-data.ts` (normalisasi, deteksi data kosong, formatter sumbu)
    - _Requirements: 3.4, 3.5_
  - [x] 3.4 Tambah `components/dashboard/admin/ChartStates.tsx` (EmptyState, ErrorState, skeleton, ChartErrorBoundary)
    - _Requirements: 3.5, 3.6_
  - [x] 3.5 Tambah `components/dashboard/admin/DashboardCharts.tsx` dengan state loading/error/ready dan empty state per chart
    - _Requirements: 3.4, 3.5, 3.6_
  - [x] 3.6 Refactor `AdminDashboard.tsx`: container 1400px ter-center, spacing konsisten, `StatCard`, Menu Utama, hapus sisa Target Urunan
    - _Requirements: 3.1, 3.2, 3.3, 4.1–4.7_
  - [x] 3.7 Verifikasi Property 1–3 dengan harness (500/768/1024/1280/1920px; skenario data, empty, error, loading, retry, partial)
  - [x] 3.8 Verifikasi preservation 4.1–4.7 dan halaman publik identik piksel

- [x] 4. Checkpoint
  - `npm run build` sukses dan ESLint pada file yang diubah bersih
  - Harness preview dan file verifikasi sementara sudah dihapus
