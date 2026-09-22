import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/authOptions'
import { realDb } from '@/lib/db/real'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const customerId = (session.user as { id: string }).id
  const accounts = await realDb.account.findMany({
    where: { customerId },
    orderBy: { type: 'asc' },
  })

  return NextResponse.json(accounts)
}
