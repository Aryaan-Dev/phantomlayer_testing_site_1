'use client'

import Link from 'next/link'

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-6">
      <div className="text-center max-w-sm">
        <h1 className="font-heading text-2xl font-bold text-neutral-900 mb-2">Something went wrong</h1>
        <p className="text-neutral-500 mb-8">An unexpected error occurred. Our team has been notified.</p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="rounded-lg border border-neutral-200 bg-white px-5 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
          >
            Try again
          </button>
          <Link href="/" className="rounded-lg bg-primary-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-700 transition-colors">
            Go home
          </Link>
        </div>
      </div>
    </div>
  )
}
