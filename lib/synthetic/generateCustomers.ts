import { faker } from '@faker-js/faker'
import type { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

// Deterministic seed — same data every reset
faker.seed(42)

export async function generateCustomers(db: PrismaClient, count = 10) {
  const customers = []

  // Always create a known demo customer first (easy login for demos)
  const demoPasswordHash = await bcrypt.hash('MeridianDemo2024!', 12)
  const demo = await db.customer.upsert({
    where: { email: 'demo@meridianbank.test' },
    update: {},
    create: {
      fullName: 'Alex Rivera',
      email: 'demo@meridianbank.test',
      passwordHash: demoPasswordHash,
      accounts: {
        create: [
          { type: 'checking', balanceCents: 485230 },  // $4,852.30
          { type: 'savings', balanceCents: 2147500 },  // $21,475.00
        ],
      },
    },
    include: { accounts: true },
  })
  customers.push(demo)

  // Additional synthetic customers
  for (let i = 0; i < count; i++) {
    const firstName = faker.person.firstName()
    const lastName = faker.person.lastName()
    const hash = await bcrypt.hash(faker.internet.password({ length: 12 }), 10)
    const customer = await db.customer.create({
      data: {
        fullName: `${firstName} ${lastName}`,
        email: faker.internet.email({ firstName, lastName, provider: 'meridianbank.test' }).toLowerCase(),
        passwordHash: hash,
        accounts: {
          create: [
            { type: 'checking', balanceCents: faker.number.int({ min: 10000, max: 1500000 }) },
            { type: 'savings', balanceCents: faker.number.int({ min: 50000, max: 5000000 }) },
          ],
        },
      },
      include: { accounts: true },
    })
    customers.push(customer)
  }

  return customers
}
