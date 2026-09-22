'use client'

import { useEffect, useState, createContext, useContext, ReactNode, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { CheckCircle2, AlertCircle, AlertTriangle, X } from 'lucide-react'

type ToastVariant = 'success' | 'error' | 'warning'

interface Toast {
  id: string
  message: string
  variant: ToastVariant
}

interface ToastContextValue {
  toast: (message: string, variant?: ToastVariant) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback((message: string, variant: ToastVariant = 'success') => {
    const id = Math.random().toString(36).slice(2)
    setToasts((prev) => [...prev, { id, message, variant }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3500)
  }, [])

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="fixed top-4 right-4 z-[100] flex flex-col gap-2"
      >
        {toasts.map((t) => (
          <ToastItem
            key={t.id}
            toast={t}
            onDismiss={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}
          />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const icons: Record<ToastVariant, ReactNode> = {
    success: <CheckCircle2 className="h-4 w-4 text-accent-emerald flex-shrink-0" />,
    error: <AlertCircle className="h-4 w-4 text-accent-red flex-shrink-0" />,
    warning: <AlertTriangle className="h-4 w-4 text-accent-amber flex-shrink-0" />,
  }
  const borders: Record<ToastVariant, string> = {
    success: 'border-l-4 border-accent-emerald',
    error: 'border-l-4 border-accent-red',
    warning: 'border-l-4 border-accent-amber',
  }

  return (
    <div
      role="alert"
      className={cn(
        'flex items-center gap-3 rounded-xl bg-white px-4 py-3 shadow-lg min-w-[280px] max-w-sm animate-in slide-in-from-right-4',
        borders[toast.variant],
      )}
    >
      {icons[toast.variant]}
      <p className="flex-1 text-sm text-neutral-900">{toast.message}</p>
      <button
        onClick={onDismiss}
        aria-label="Dismiss"
        className="text-neutral-400 hover:text-neutral-600 transition-colors"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside ToastProvider')
  return ctx
}
