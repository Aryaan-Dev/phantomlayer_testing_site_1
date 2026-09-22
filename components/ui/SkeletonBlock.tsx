import { cn } from '@/lib/utils'

interface SkeletonBlockProps {
  className?: string
  lines?: number
}

export function SkeletonBlock({ className, lines = 1 }: SkeletonBlockProps) {
  return (
    <div className={cn('space-y-3 animate-pulse', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-4 rounded-md bg-neutral-200"
          style={{ width: i === lines - 1 && lines > 1 ? '60%' : '100%' }}
        />
      ))}
    </div>
  )
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-xl border border-neutral-200 bg-white p-6 shadow-sm animate-pulse', className)}>
      <div className="h-3 w-24 rounded bg-neutral-200 mb-4" />
      <div className="h-8 w-40 rounded bg-neutral-200 mb-2" />
      <div className="h-3 w-32 rounded bg-neutral-200" />
    </div>
  )
}
