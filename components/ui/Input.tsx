'use client'

import { cn } from '@/lib/utils'
import { InputHTMLAttributes, forwardRef, useId } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  hint?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const generatedId = useId()
    const inputId = id ?? generatedId

    return (
      <div className="flex flex-col gap-1.5">
        <label htmlFor={inputId} className="text-sm font-medium text-neutral-900">
          {label}
        </label>
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'h-10 rounded-lg border border-neutral-200 bg-white px-3 text-sm text-neutral-900 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-0 transition-colors',
            error && 'border-accent-red focus:ring-accent-red',
            className,
          )}
          {...props}
        />
        {hint && !error && <p className="text-xs text-neutral-500">{hint}</p>}
        {error && <p className="text-xs text-accent-red">{error}</p>}
      </div>
    )
  },
)

Input.displayName = 'Input'
export { Input }
