import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/authOptions'
import { redirect } from 'next/navigation'
import { realDb } from '@/lib/db/real'
import { AuthNav } from '@/components/ui/NavBar'
import { BalanceCard } from '@/components/ui/BalanceCard'
import { TransactionRow } from '@/components/ui/TransactionRow'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import Link from 'next/link'
import { ArrowLeftRight, FileText, Headphones } from 'lucide-react'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect('/login')

  const customerId = (session.user as { id: string }).id

  const accounts = await realDb.account.findMany({
    where: { customerId },
    orderBy: { type: 'asc' },
  })

  const recentTransactions = await realDb.transaction.findMany({
    where: { accountId: { in: accounts.map((a) => a.id) } },
    orderBy: { createdAt: 'desc' },
    take: 5,
  })

  const quickActions = [
    { href: '/transfer', label: 'Transfer', icon: ArrowLeftRight },
    { href: '/accounts/' + (accounts[0]?.id ?? ''), label: 'View statements', icon: FileText },
    { href: '/support', label: 'Support', icon: Headphones },
  ]

  return (
    <div className="flex min-h-screen flex-col bg-neutral-50">
      <AuthNav userName={session.user.name} />
      <main className="flex-1 mx-auto w-full max-w-5xl px-6 py-10 fade-up">
        <h1 className="font-heading text-3xl font-bold text-neutral-900 mb-8">
          Good {getGreeting()}, {session.user.name?.split(' ')[0]}.
        </h1>

        {/* Balance Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {accounts.map((account) => (
            <BalanceCard
              key={account.id}
              accountType={account.type}
              balanceCents={account.balanceCents}
              accountId={account.id}
            />
          ))}
        </div>

        {/* Quick Actions */}
        <div className="flex gap-3 mb-8 flex-wrap">
          {quickActions.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900 transition-colors shadow-sm"
            >
              <Icon className="h-4 w-4 text-primary-500" />
              {label}
            </Link>
          ))}
        </div>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent transactions</CardTitle>
            {accounts[0] && (
              <Link href={`/accounts/${accounts[0].id}`} className="text-sm font-medium text-primary-500 hover:underline">
                View all →
              </Link>
            )}
          </CardHeader>
          {recentTransactions.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-sm text-neutral-500">No transactions yet.</p>
              <Link href="/transfer" className="mt-2 inline-block text-sm font-medium text-primary-500 hover:underline">
                Make your first transfer
              </Link>
            </div>
          ) : (
            <div>
              {recentTransactions.map((tx) => (
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
        </Card>
      </main>
    </div>
  )
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}
