# 🎯 Fitur Target Urunan - Dokumentasi Lengkap

## 📋 Overview

Fitur **Target Urunan** memungkinkan bendahara membuat target pengumpulan dana khusus untuk kegiatan tertentu (seperti workshop, study tour, acara kelas) yang terpisah dari kas mingguan rutin. Mahasiswa dapat berkontribusi dengan jumlah bebas, dan bendahara memverifikasi setiap kontribusi.

---

## 🏗️ Database Schema

### FundingTarget Table
```prisma
model FundingTarget {
  id              String              @id @default(cuid())
  title           String              // "Urunan Workshop Web Development"
  description     String              @db.Text
  targetAmount    Int                 // Target nominal total (IDR)
  currentAmount   Int                 @default(0) // Total terkumpul
  deadline        DateTime?           // Optional deadline
  status          FundingTargetStatus @default(ACTIVE)
  imageUrl        String?             // Optional gambar banner
  createdBy       String              // User ID admin/bendahara
  createdAt       DateTime            @default(now())
  updatedAt       DateTime            @updatedAt
  
  contributions   Contribution[]
}

enum FundingTargetStatus {
  ACTIVE        // Sedang berlangsung
  COMPLETED     // Target tercapai
  CANCELLED     // Dibatalkan
  EXPIRED       // Melewati deadline
}
```

### Contribution Table
```prisma
model Contribution {
  id                  String              @id @default(cuid())
  fundingTargetId     String
  studentId           String
  amount              Int                 // Nominal kontribusi
  method              PaymentMethod       @default(MANUAL_TRANSFER)
  status              ContributionStatus  @default(PENDING_VERIFICATION)
  
  // Payment proof
  proofImageUrl       String?             // Bukti transfer
  paymentDate         DateTime?           // Tanggal bayar
  paymentNotes        String?             // Catatan mahasiswa
  
  // Verification
  verifiedBy          String?             // User ID verifikator
  verifiedAt          DateTime?
  rejectionReason     String?
  
  createdAt           DateTime            @default(now())
  updatedAt           DateTime            @updatedAt
  
  fundingTarget       FundingTarget
  student             Student
}

enum ContributionStatus {
  PENDING_VERIFICATION  // Menunggu verifikasi
  VERIFIED              // Sudah diverifikasi
  REJECTED              // Ditolak
}
```

---

## 🔌 API Endpoints

### Admin APIs

#### 1. **GET /api/admin/funding-targets**
List semua target urunan dengan filter status

**Query Parameters:**
- `status` (optional): `ACTIVE` | `COMPLETED` | `CANCELLED`

**Response:**
```json
{
  "targets": [
    {
      "id": "clxx...",
      "title": "Urunan Workshop React",
      "description": "Workshop pembuatan web dengan React",
      "targetAmount": 1500000,
      "currentAmount": 750000,
      "deadline": "2026-10-01T00:00:00.000Z",
      "status": "ACTIVE",
      "imageUrl": null,
      "createdAt": "2026-09-21T...",
      "contributions": [...],
      "_count": {
        "contributions": 15
      }
    }
  ],
  "stats": {
    "total": 3,
    "active": 1,
    "completed": 1,
    "cancelled": 1,
    "totalCollected": 2500000,
    "totalTarget": 5000000
  }
}
```

#### 2. **POST /api/admin/funding-targets**
Buat target urunan baru

**Body:**
```json
{
  "title": "Urunan Study Tour Bali",
  "description": "Study tour ke Bali untuk kelas TI26A3",
  "targetAmount": 3000000,
  "deadline": "2026-12-31",
  "imageUrl": "https://example.com/banner.jpg"
}
```

**Response:**
```json
{
  "message": "Funding target created successfully",
  "target": { ... }
}
```

**Side Effects:**
- Membuat notifikasi untuk semua mahasiswa aktif
- Mencatat audit log

#### 3. **GET /api/admin/funding-targets/[id]**
Get detail target urunan dengan semua kontribusi

#### 4. **PUT /api/admin/funding-targets/[id]**
Update target urunan

**Body:**
```json
{
  "title": "Updated Title",
  "targetAmount": 2000000,
  "status": "COMPLETED"
}
```

#### 5. **DELETE /api/admin/funding-targets/[id]**
Cancel target urunan (soft delete)
- Mengubah status menjadi `CANCELLED`

#### 6. **GET /api/admin/funding-targets/[id]/contributions**
List semua kontribusi untuk target tertentu

**Query Parameters:**
- `status` (optional): `PENDING_VERIFICATION` | `VERIFIED` | `REJECTED`

#### 7. **POST /api/admin/contributions/[id]/verify**
Verifikasi atau tolak kontribusi

**Body:**
```json
{
  "action": "approve", // or "reject"
  "rejectionReason": "Bukti tidak valid" // required if reject
}
```

**Side Effects (approve):**
- Update contribution status → `VERIFIED`
- Increment `fundingTarget.currentAmount`
- Auto-complete target jika tercapai
- Kirim notifikasi ke mahasiswa
- Audit log

**Side Effects (reject):**
- Update contribution status → `REJECTED`
- Kirim notifikasi ke mahasiswa dengan alasan
- Audit log

---

### Student APIs

#### 1. **GET /api/funding-targets**
List target urunan aktif untuk mahasiswa

**Response:**
```json
{
  "targets": [
    {
      "id": "clxx...",
      "title": "Urunan Workshop React",
      "targetAmount": 1500000,
      "currentAmount": 750000,
      "progressPercentage": 50,
      "contributorsCount": 15,
      "myContributions": [
        {
          "id": "clxy...",
          "amount": 50000,
          "status": "VERIFIED",
          "createdAt": "2026-09-20T..."
        }
      ]
    }
  ]
}
```

#### 2. **GET /api/funding-targets/[id]**
Get detail target dengan kontribusi user

#### 3. **POST /api/funding-targets/[id]/contribute**
Submit kontribusi baru

**Body:**
```json
{
  "amount": 50000,
  "method": "QRIS",
  "proofImageUrl": "data:image/jpeg;base64,...",
  "paymentNotes": "Transfer via DANA"
}
```

**Response:**
```json
{
  "message": "Contribution submitted successfully",
  "contribution": { ... }
}
```

**Validation:**
- Amount harus > 0
- Target harus `ACTIVE`
- Belum melewati deadline
- Proof image wajib

**Side Effects:**
- Buat announcement untuk admin

---

## 🖥️ User Interface

### Admin Panel

#### **1. List Target Urunan** (`/dashboard/admin/funding-targets`)

**Features:**
- ✅ Form create target baru (toggle show/hide)
- ✅ Statistics cards: Total, Active, Completed, Total Collected
- ✅ Filter by status: ALL, ACTIVE, COMPLETED, CANCELLED
- ✅ Target cards dengan:
  - Title, description, deadline
  - Progress bar dengan persentase
  - Current amount / Target amount
  - Jumlah kontributor
  - Status badge (color-coded)
  - Action buttons: View/Edit, Delete
- ✅ Real-time progress tracking

**Form Fields:**
- Judul Target *
- Deskripsi *
- Target Nominal (Rp) *
- Deadline (optional)
- URL Gambar Banner (optional)

#### **2. Detail Target & Verifikasi** (`/dashboard/admin/funding-targets/[id]`)

**Features:**
- ✅ Target info dengan progress bar
- ✅ Stats: Pending, Verified, Rejected, Total contributions
- ✅ Filter contributions by status
- ✅ Contribution cards showing:
  - Student info (name, NIM, whatsapp)
  - Amount contributed
  - Payment proof image (full display)
  - Payment date & notes
  - Status badge
  - Verify/Reject buttons (for pending)
- ✅ Approve with single click
- ✅ Reject with reason prompt
- ✅ Real-time status updates

---

### Student Panel

#### **1. List Target Urunan** (`/dashboard/funding-targets`)

**Features:**
- ✅ View active & completed targets
- ✅ Target cards showing:
  - Title, description, deadline
  - Progress bar dengan percentage
  - Current / Target amount
  - Jumlah kontributor
  - My contribution status (if contributed)
  - "Berkontribusi" button (if active)
- ✅ Highlight my contributions dengan badge
- ✅ Show pending contribution status

#### **2. Contribute to Target** (`/dashboard/funding-targets/[id]`)

**Features:**
- ✅ Target detail dengan progress
- ✅ My contribution history
- ✅ Contribution form:
  - Nominal input (bebas, min 1000)
  - Payment method selection (QRIS / Manual Transfer)
  - QRIS code display (if enabled)
  - Bank account info (if manual)
  - Payment proof upload (max 5MB)
  - Notes (optional)
- ✅ Reuse existing payment settings dari SystemSetting
- ✅ Upload preview
- ✅ Success confirmation page
- ✅ Redirect after success

---

## 🔔 Notifications & Audit

### Notifications Created

1. **New Target Created**
   - Type: `ANNOUNCEMENT`
   - To: All active students
   - Message: "Target urunan {title} telah dibuat. Target: Rp{amount}..."

2. **Contribution Verified**
   - Type: `PAYMENT_SUCCESS`
   - To: Student
   - Message: "Kontribusi Anda sebesar Rp{amount} untuk {title} telah diverifikasi..."

3. **Contribution Rejected**
   - Type: `PAYMENT_REJECTED`
   - To: Student
   - Message: "Kontribusi Anda untuk {title} ditolak. Alasan: {reason}"

4. **New Contribution (Admin)**
   - Type: `ANNOUNCEMENT`
   - To: First admin/bendahara
   - Message: "{student} mengirim kontribusi Rp{amount}. Silakan verifikasi..."

### Audit Logs

All actions logged:
- `CREATE_FUNDING_TARGET`
- `UPDATE_FUNDING_TARGET`
- `DELETE_FUNDING_TARGET`
- `VERIFY_CONTRIBUTION`
- `REJECT_CONTRIBUTION`

---

## ✨ Key Features

### Auto-Complete Target
Target otomatis berubah status ke `COMPLETED` ketika `currentAmount >= targetAmount`

### Flexible Contributions
- Mahasiswa bisa berkontribusi berkali-kali
- Nominal bebas (tidak fixed)
- Support multiple payment methods

### Verification Workflow
1. Student submit contribution with proof
2. Bendahara review proof image
3. Approve → amount counted, notification sent
4. Reject → reason given, notification sent

### Progress Tracking
- Real-time progress bar
- Percentage calculation
- Color-coded: <50% gray, 50-75% yellow, 75-99% blue, 100% green

### Payment Integration
- Reuse QRIS settings dari SystemSetting
- Reuse Manual Transfer settings
- Same payment flow as weekly bills

---

## 🧪 Testing Flow

### Admin Flow:
1. Login as admin: `admin@kas-ti26a3.test` / `admin123`
2. Navigate to `/dashboard/admin/funding-targets`
3. Click "Buat Target Baru"
4. Fill form:
   - Title: "Urunan Workshop React"
   - Description: "Workshop membuat website dengan React"
   - Target: 1500000
   - Deadline: pilih tanggal
5. Click "Buat Target"
6. Verify target muncul di list dengan progress 0%

### Student Flow:
1. Login as student: `2026010001` / `mahasiswa123`
2. Navigate to `/dashboard/funding-targets`
3. Click target yang aktif
4. Isi form kontribusi:
   - Amount: 50000
   - Method: pilih QRIS atau Manual
   - Upload bukti
5. Submit
6. Lihat success confirmation
7. Check riwayat kontribusi (status: Menunggu Verifikasi)

### Verification Flow:
1. Login as bendahara
2. Go to `/dashboard/admin/funding-targets`
3. Click target untuk lihat detail
4. Filter "Menunggu"
5. Review bukti pembayaran
6. Click "Verifikasi" atau "Tolak"
7. Check progress bar updated
8. Verify student gets notification

---

## 🎨 UI Components

### Progress Bar Colors
```css
<50%: bg-gray-600
50-74%: bg-yellow-600
75-99%: bg-blue-600
100%+: bg-green-600
```

### Status Badges
```
ACTIVE: blue-100/blue-700 with Clock icon
COMPLETED: green-100/green-700 with CheckCircle icon
CANCELLED: gray-100/gray-700 with XCircle icon
PENDING_VERIFICATION: yellow-100/yellow-700 with Clock icon
VERIFIED: green-100/green-700 with CheckCircle icon
REJECTED: red-100/red-700 with XCircle icon
```

---

## 📊 Statistics & Analytics

Admin dapat melihat:
- Total target urunan
- Target aktif
- Target selesai
- Total terkumpul (Rp)
- Total target keseluruhan (Rp)
- Progress per target
- Jumlah kontributor per target

---

## 🔒 Security & Authorization

### Admin/Bendahara Can:
- Create funding targets
- Update funding targets
- Cancel funding targets
- View all contributions
- Verify/reject contributions

### Mahasiswa Can:
- View active/completed targets
- Submit contributions
- View own contribution history
- See target progress

### Validation:
- Only ACTIVE targets accept contributions
- Only PENDING contributions can be verified
- Deadline checked before accepting contribution
- Amount must be positive
- Proof image required

---

## 💡 Tips & Best Practices

1. **Set Realistic Targets**: Hitung dengan baik berapa target yang realistis
2. **Clear Description**: Jelaskan tujuan urunan dengan detail
3. **Set Deadline**: Beri deadline untuk urgency
4. **Quick Verification**: Verifikasi kontribusi segera untuk motivasi mahasiswa
5. **Communication**: Gunakan announcements untuk update progress
6. **Transparent**: Progress bar membuat proses transparan

---

## 🚀 Next Steps / Enhancement Ideas

1. **Leaderboard**: Top contributors per target
2. **Share Target**: Generate shareable link
3. **Email Reminder**: Email notification untuk deadline mendekati
4. **Bulk Verify**: Verifikasi multiple contributions sekaligus
5. **Export Report**: Export contribution report to PDF/Excel
6. **Target Categories**: Kategorisasi target (academic, social, etc)
7. **Recurring Targets**: Template untuk target yang berulang
8. **Partial Refund**: Jika target tidak tercapai

---

## 📝 Summary

Fitur Target Urunan sekarang lengkap dengan:
✅ Database schema (FundingTarget & Contribution)
✅ 10 API endpoints (admin + student)
✅ Admin UI untuk create & verify
✅ Student UI untuk view & contribute
✅ Payment integration (QRIS + Manual)
✅ Real-time progress tracking
✅ Notifications & audit logs
✅ Auto-complete functionality

**Database migrated**: ✅
**Server running**: ✅
**Ready for testing**: ✅

---

**Test URL:**
- Admin: http://localhost:3000/dashboard/admin/funding-targets
- Student: http://localhost:3000/dashboard/funding-targets
