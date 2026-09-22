import { PrismaClient } from '@prisma/client'

// Singleton Prisma client for DECOY data only.
// ISOLATION RULE: This is the ONLY db client decoy routes may use.

const globalForPrisma = globalThis as unknown as {
  decoyPrisma: PrismaClient | undefined
}

export const decoyDb =
  globalForPrisma.decoyPrisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.decoyPrisma = decoyDb
