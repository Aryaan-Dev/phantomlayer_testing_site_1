import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

interface TableProps {
  children: ReactNode
  className?: string
}

export function Table({ children, className }: TableProps) {
  return (
    <div className="overflow-x-auto">
      <table className={cn('w-full text-sm', className)}>
        {children}
      </table>
    </div>
  )
}

export function TableHead({ children }: { children: ReactNode }) {
  return (
    <thead className="border-b border-neutral-200 bg-neutral-100">
      {children}
    </thead>
  )
}

export function TableBody({ children }: { children: ReactNode }) {
  return <tbody className="divide-y divide-neutral-100">{children}</tbody>
}

export function Th({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <th className={cn('px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wide', className)}>
      {children}
    </th>
  )
}

export function Td({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <td className={cn('px-4 py-3 text-neutral-900', className)}>
      {children}
    </td>
  )
}

export function Tr({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <tr className={cn('hover:bg-neutral-50 transition-colors', className)}>
      {children}
    </tr>
  )
}
