import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { generateCustomers } from '@/lib/synthetic/generateCustomers'
import { generateTransactions } from '@/lib/synthetic/generateTransactions'
import { generateDecoyRecords } from '@/lib/synthetic/generateDecoyRecords'

// Demo seed (without reset) — requires DEMO_CONTROL_SECRET
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  if (body.secret !== process.env.DEMO_CONTROL_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const db = new PrismaClient()
  try {
    const customers = await generateCustomers(db, 5)
    const allAccounts = customers.flatMap((c) => (c as any).accounts ?? [])
    await generateTransactions(db, allAccounts, 10)
    await generateDecoyRecords(db)
    return NextResponse.json({ message: 'Data seeded successfully.' })
  } catch (e) {
    console.error('[demo/seed]', e)
    return NextResponse.json({ error: 'Seed failed.' }, { status: 500 })
  } finally {
    await db.$disconnect()
  }
}
