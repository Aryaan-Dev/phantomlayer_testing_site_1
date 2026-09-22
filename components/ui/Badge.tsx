import { cn } from '@/lib/utils'

type BadgeVariant = 'default' | 'checking' | 'savings' | 'admin' | 'ops' | 'support' | 'success' | 'warning' | 'error'

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-neutral-100 text-neutral-700',
  checking: 'bg-blue-50 text-primary-700',
  savings: 'bg-emerald-50 text-emerald-700',
  admin: 'bg-red-50 text-red-700',
  ops: 'bg-amber-50 text-amber-700',
  support: 'bg-neutral-100 text-neutral-600',
  success: 'bg-emerald-50 text-emerald-700',
  warning: 'bg-amber-50 text-amber-700',
  error: 'bg-red-50 text-red-700',
}

interface BadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
  className?: string
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
      variantStyles[variant],
      className,
    )}>
      {children}
    </span>
  )
}
