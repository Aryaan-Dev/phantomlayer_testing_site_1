import { faker } from '@faker-js/faker'
import type { PrismaClient } from '@prisma/client'

faker.seed(43)

const merchantNames = [
  'Whole Foods Market', 'Amazon', 'Netflix', 'Spotify', 'Shell Gas Station',
  'Starbucks Coffee', 'Uber', 'Target', 'Apple Store', 'Direct Deposit',
  'Rent Payment', 'Electric Bill', 'Water & Sewer', 'AT&T Wireless',
  'Chase Bank ATM', 'Payroll - Meridian Corp', 'Transfer from Savings',
  'Dining Out - Olive Garden', 'Gym Membership - Planet Fitness', 'CVS Pharmacy',
]

export async function generateTransactions(
  db: PrismaClient,
  accounts: Array<{ id: string }>,
  txPerAccount = 25
) {
  const allTx = []
  for (const account of accounts) {
    for (let i = 0; i < txPerAccount; i++) {
      const direction = faker.helpers.arrayElement(['debit', 'debit', 'debit', 'credit']) // 75% debit
      const amountCents = faker.number.int({ min: 100, max: 50000 })
      const tx = await db.transaction.create({
        data: {
          accountId: account.id,
          amountCents,
          direction,
          counterparty: faker.helpers.arrayElement(merchantNames),
          memo: faker.helpers.maybe(() => faker.lorem.words(3), { probability: 0.4 }) ?? null,
          createdAt: faker.date.past({ years: 1 }),
        },
      })
      allTx.push(tx)
    }
  }
  return allTx
}
