import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/authOptions'
import { redirect, notFound } from 'next/navigation'
import { realDb } from '@/lib/db/real'
import { AuthNav } from '@/components/ui/NavBar'
import { TransactionRow } from '@/components/ui/TransactionRow'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { AccountSearchFilter } from '@/components/banking/AccountSearchFilter'

export default async function AccountDetailPage({
  params,
  searchParams,
}: {
  params: { id: string }
  searchParams: { page?: string; search?: string }
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect('/login')

  const customerId = (session.user as { id: string }).id
  const page = parseInt(searchParams.page ?? '1', 10)
  const search = searchParams.search ?? ''
  const limit = 20

  const account = await realDb.account.findFirst({
    where: { id: params.id, customerId },
  })
  if (!account) notFound()

  const where = {
    accountId: params.id,
    ...(search
      ? { OR: [{ counterparty: { contains: search } }, { memo: { contains: search } }] }
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

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="flex min-h-screen flex-col bg-neutral-50">
      <AuthNav userName={session.user.name} />
      <main className="flex-1 mx-auto w-full max-w-5xl px-6 py-10 fade-up">
        {/* Account header */}
        <div className="mb-8 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="font-heading text-3xl font-bold text-neutral-900">
                {account.type === 'checking' ? 'Checking' : 'Savings'} Account
              </h1>
              <Badge variant={account.type === 'checking' ? 'checking' : 'savings'}>
                {account.type}
              </Badge>
            </div>
            <p className="text-4xl font-bold tabular-nums text-neutral-900">
              {formatCurrency(account.balanceCents)}
            </p>
          </div>
        </div>

        {/* Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>Transaction history</CardTitle>
            <span className="text-sm text-neutral-500">{total} transactions</span>
          </CardHeader>

          <AccountSearchFilter defaultSearch={search} />

          {transactions.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-sm text-neutral-500">
                {search ? `No results for "${search}"` : 'No transactions yet.'}
              </p>
            </div>
          ) : (
            <div className="mt-4">
              {transactions.map((tx) => (
                <TransactionRow
                  key={tx.id}
                  counterparty={tx.counterparty}
                  memo={tx.memo}
                  amountCents={tx.amountCents}
                  direction={tx.direction as 'debit' | 'credit'}
                  createdAt={tx.createdAt}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 mt-4 border-t border-neutral-100">
              <p className="text-sm text-neutral-500">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                {page > 1 && (
                  <a href={`?page=${page - 1}&search=${search}`} className="rounded-lg border border-neutral-200 px-3 py-1.5 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors">
                    ← Previous
                  </a>
                )}
                {page < totalPages && (
                  <a href={`?page=${page + 1}&search=${search}`} className="rounded-lg border border-neutral-200 px-3 py-1.5 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors">
                    Next →
                  </a>
                )}
              </div>
            </div>
          )}
        </Card>
      </main>
    </div>
  )
}

function formatCurrency(cents: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100)
}
