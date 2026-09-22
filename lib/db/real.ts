import { PrismaClient } from '@prisma/client'

// Singleton Prisma client for REAL banking data only.
// ISOLATION RULE: This file must NEVER be imported from any decoy route.

const globalForPrisma = globalThis as unknown as {
  realPrisma: PrismaClient | undefined
}

export const realDb =
  globalForPrisma.realPrisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.realPrisma = realDb
