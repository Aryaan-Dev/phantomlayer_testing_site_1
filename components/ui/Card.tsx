import { cn } from '@/lib/utils'
import { HTMLAttributes } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {}

export function Card({ className, children, ...props }: CardProps) {
  return (
    <div
      className={cn('rounded-xl border border-neutral-200 bg-white p-6 shadow-sm', className)}
      {...props}
    >
      {children}
    </div>
  )
}

interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {}
export function CardHeader({ className, children, ...props }: CardHeaderProps) {
  return (
    <div className={cn('mb-4 flex items-center justify-between', className)} {...props}>
      {children}
    </div>
  )
}

interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {}
export function CardTitle({ className, children, ...props }: CardTitleProps) {
  return (
    <h3 className={cn('text-lg font-semibold text-neutral-900 font-heading', className)} {...props}>
      {children}
    </h3>
  )
}
