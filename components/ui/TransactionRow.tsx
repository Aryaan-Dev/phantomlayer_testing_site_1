import { cn } from '@/lib/utils'

interface TransactionRowProps {
  counterparty: string
  memo?: string | null
  amountCents: number
  direction: 'debit' | 'credit'
  createdAt: string | Date
}

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(Math.abs(cents) / 100)
}

function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date))
}

export function TransactionRow({ counterparty, memo, amountCents, direction, createdAt }: TransactionRowProps) {
  const isCredit = direction === 'credit'

  return (
    <div className="flex items-center justify-between py-3 border-b border-neutral-100 last:border-0">
      <div className="flex items-center gap-3">
        <div className={cn(
          'h-9 w-9 rounded-full flex items-center justify-center text-sm font-semibold',
          isCredit ? 'bg-emerald-50 text-accent-emerald' : 'bg-neutral-100 text-neutral-500'
        )}>
          {counterparty.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="text-sm font-medium text-neutral-900">{counterparty}</p>
          {memo && <p className="text-xs text-neutral-500">{memo}</p>}
        </div>
      </div>
      <div className="text-right">
        <p className={cn(
          'text-sm font-semibold tabular-nums',
          isCredit ? 'text-accent-emerald' : 'text-neutral-900'
        )}>
          {isCredit ? '+' : '-'}{formatCurrency(amountCents)}
        </p>
        <p className="text-xs text-neutral-500">{formatDate(createdAt)}</p>
      </div>
    </div>
  )
}
