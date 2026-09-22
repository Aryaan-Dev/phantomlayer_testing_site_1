import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { generateCustomers } from '@/lib/synthetic/generateCustomers'
import { generateTransactions } from '@/lib/synthetic/generateTransactions'
import { generateDecoyRecords } from '@/lib/synthetic/generateDecoyRecords'

// Demo reset — requires DEMO_CONTROL_SECRET
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  if (body.secret !== process.env.DEMO_CONTROL_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const db = new PrismaClient()
  try {
    // Delete in dependency order
    await db.decoyInteractionLog.deleteMany()
    await db.decoyBackupRecord.deleteMany()
    await db.decoyUser.deleteMany()
    await db.transaction.deleteMany()
    await db.account.deleteMany()
    await db.customer.deleteMany()

    // Re-seed
    const customers = await generateCustomers(db, 8)
    const allAccounts = customers.flatMap((c) => (c as any).accounts ?? [])
    await generateTransactions(db, allAccounts, 20)
    await generateDecoyRecords(db)

    return NextResponse.json({ message: 'Environment reset and re-seeded successfully.' })
  } catch (e) {
    console.error('[demo/reset]', e)
    return NextResponse.json({ error: 'Reset failed.' }, { status: 500 })
  } finally {
    await db.$disconnect()
  }
}
