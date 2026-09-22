import { cn } from '@/lib/utils'

interface BalanceCardProps {
  accountType: string
  balanceCents: number
  accountId: string
  className?: string
}

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(cents / 100)
}

export function BalanceCard({ accountType, balanceCents, accountId, className }: BalanceCardProps) {
  const label = accountType === 'checking' ? 'Checking Account' : 'Savings Account'
  const isPositive = balanceCents >= 0

  return (
    <div className={cn('rounded-xl border border-neutral-200 bg-white p-6 shadow-sm', className)}>
      <p className="text-sm font-medium text-neutral-500 uppercase tracking-wide">{label}</p>
      <p
        className={cn(
          'mt-2 font-heading text-[2rem] leading-tight font-bold tabular-nums',
          isPositive ? 'text-neutral-900' : 'text-accent-red',
        )}
      >
        {formatCurrency(balanceCents)}
      </p>
      <p className="mt-1 text-xs text-neutral-500">
        Account •••• {accountId.slice(-4).toUpperCase()}
      </p>
      <a
        href={`/accounts/${accountId}`}
        className="mt-4 inline-block text-sm font-medium text-primary-500 hover:underline"
      >
        View details →
      </a>
    </div>
  )
}
