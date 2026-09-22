import { PrismaClient } from '@prisma/client'
import { generateCustomers } from '../lib/synthetic/generateCustomers'
import { generateTransactions } from '../lib/synthetic/generateTransactions'


const db = new PrismaClient()

async function main() {
  console.log('🌱 Seeding MeridianBank database...')

  // 1. Generate customers and their accounts
  const customers = await generateCustomers(db, 8)
  console.log(`✅ Created ${customers.length} customers with accounts`)

  // 2. Generate transactions for all accounts
  const allAccounts = customers.flatMap((c) => (c as any).accounts ?? [])
  await generateTransactions(db, allAccounts, 20)
  console.log(`✅ Created transactions for ${allAccounts.length} accounts`)


  console.log('\n🎉 Seed complete!')
  console.log('   Demo login: demo@meridianbank.test / MeridianDemo2024!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
