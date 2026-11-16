import { PrismaClient, Role } from '@prisma/client'
import { hashPassword } from '../lib/auth/hash'
import { confirmDatabaseTarget, promptNewPassword } from './lib/cli'

// Sets (rotates) the admin and bendahara passwords. Passwords are typed in a hidden
// prompt and are never stored in this file or printed.
//
// Usage:
//   npx tsx scripts/fix-admin-bendahara.ts
//   DATABASE_URL="<url produksi>" npx tsx scripts/fix-admin-bendahara.ts

const prisma = new PrismaClient()

const MIN_PASSWORD_LENGTH = 12 // SECURITY.md: admin & bendahara minimal 12 karakter

const ACCOUNTS = [
  { label: 'Admin', email: 'admin@ti26a3.udb.ac.id', legacyEmail: 'admin@kas-ti26a3.test', role: Role.ADMIN },
  { label: 'Bendahara', email: 'bendahara@ti26a3.udb.ac.id', legacyEmail: 'bendahara@kas-ti26a3.test', role: Role.BENDAHARA },
] as const

async function fixAdminBendahara() {
  console.log('🔧 Mengatur password Admin dan Bendahara\n')
  await confirmDatabaseTarget('mengganti password admin & bendahara')

  // Collect both passwords first so a typo does not leave one account half-updated
  const passwords = new Map<string, string>()
  for (const account of ACCOUNTS) {
    passwords.set(account.email, await promptNewPassword(account.label, MIN_PASSWORD_LENGTH))
  }

  for (const account of ACCOUNTS) {
    const passwordHash = await hashPassword(passwords.get(account.email)!)

    // Older databases still use the .test domain; migrate those rows in place
    const migrated = await prisma.user.updateMany({
      where: { email: account.legacyEmail },
      data: { email: account.email, password: passwordHash },
    })

    if (migrated.count > 0) {
      console.log(`✅ ${account.label}: email dimigrasi dan password diperbarui`)
      continue
    }

    await prisma.user.upsert({
      where: { email: account.email },
      update: { password: passwordHash },
      create: { email: account.email, password: passwordHash, role: account.role, isActive: true },
    })
    console.log(`✅ ${account.label}: password diperbarui (${account.email})`)
  }

  console.log('\nSelesai. Simpan password baru di password manager; jangan tulis di file repo.')
  console.log('Sesi yang sudah login tetap aktif sampai NEXTAUTH_SECRET diganti.')
}

fixAdminBendahara()
  .catch((e) => {
    console.error('❌ Error:', e instanceof Error ? e.message : e)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
