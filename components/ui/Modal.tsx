'use client'

import { ReactNode, useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'
import { X } from 'lucide-react'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  className?: string
}

export function Modal({ open, onClose, title, children, className }: ModalProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (open) document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="absolute inset-0 bg-neutral-900/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={ref}
        className={cn(
          'relative z-10 w-full max-w-md rounded-xl bg-white p-6 shadow-xl',
          className,
        )}
      >
        {title && (
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-neutral-900 font-heading">{title}</h2>
            <button
              onClick={onClose}
              aria-label="Close modal"
              className="rounded-lg p-1 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  )
}
