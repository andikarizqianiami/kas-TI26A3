# 🔄 Database Migration Notes

## Schema Changes untuk QRIS Implementation

Berikut perubahan yang dilakukan pada database schema untuk mendukung QRIS DANA statis:

### 1. PaymentMethod Enum Update

**Before:**
```prisma
enum PaymentMethod {
  QRIS
  VIRTUAL_ACCOUNT
  EWALLET
  BANK_TRANSFER
  MANUAL_TRANSFER
}
```

**After:**
```prisma
enum PaymentMethod {
  QRIS_DANA        // Primary method - QRIS statis
  MANUAL_TRANSFER  // Backup method
  OTHER           // Other methods jika ada
}
```

### 2. Payment Model Update

**Added fields:**
```prisma
model Payment {
  // ... existing fields
  
  // Manual payment fields (QRIS DANA verification)
  paymentDate         DateTime?   // Tanggal user bayar (user input)
  paymentNotes        String?     // Catatan dari mahasiswa
  
  // ... other fields
}
```

**Updated defaults:**
```prisma
method   PaymentMethod   @default(QRIS_DANA)
status   PaymentStatus   @default(PENDING_VERIFICATION)
```

### 3. PaymentAccount Model Update

**Updated fields:**
```prisma
model PaymentAccount {
  accountNumber   String?    // Made optional untuk QRIS
  description     String?    // Added description field
}
```

## 🚀 Running Migrations

### Fresh Install (New Database)

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev --name qris_implementation

# Seed database
npm run db:seed
```

### Existing Database (Update)

```bash
# Create migration
npx prisma migrate dev --name update_for_qris

# If conflict, reset (WARNING: deletes all data)
npx prisma migrate reset
npm run db:seed
```

## ⚠️ Breaking Changes

1. **PaymentMethod enum changed**
   - Old values tidak valid
   - Existing payments perlu update manual jika ada

2. **Payment model field changes**
   - `paymentDate` added (nullable)
   - `paymentNotes` added (nullable)
   - Default `method` changed ke QRIS_DANA

3. **PaymentAccount changes**
   - `accountNumber` now nullable
   - `description` field added

## 🔧 Manual Migration Script

Jika perlu migrate existing data:

```sql
-- Update existing payment methods
UPDATE payments
SET method = 'QRIS_DANA'
WHERE method IN ('QRIS', 'EWALLET', 'MANUAL_TRANSFER');

-- Add description to payment accounts
UPDATE payment_accounts
SET description = 'Legacy payment account'
WHERE description IS NULL;

-- Set accountNumber nullable
ALTER TABLE payment_accounts
ALTER COLUMN "accountNumber" DROP NOT NULL;
```

## ✅ Verification

After migration, verify:

```bash
# Check schema
npx prisma validate

# Check database
npx prisma studio

# Run seed
npm run db:seed
```

---

**Last Updated:** September 2026
