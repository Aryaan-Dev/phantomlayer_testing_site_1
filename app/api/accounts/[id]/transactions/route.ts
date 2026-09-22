import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/authOptions'
import { realDb } from '@/lib/db/real'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const customerId = (session.user as { id: string }).id
  const url = new URL(req.url)
  const page = parseInt(url.searchParams.get('page') ?? '1', 10)
  const limit = 20
  const search = url.searchParams.get('search') ?? ''

  // Verify the account belongs to this customer
  const account = await realDb.account.findFirst({
    where: { id: params.id, customerId },
  })
  if (!account) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const where = {
    accountId: params.id,
    ...(search
      ? {
          OR: [
            { counterparty: { contains: search } },
            { memo: { contains: search } },
          ],
        }
      : {}),
  }

  const [transactions, total] = await Promise.all([
    realDb.transaction.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: (page - 1) * limit,
    }),
    realDb.transaction.count({ where }),
  ])

  return NextResponse.json({ transactions, total, page, limit })
}
