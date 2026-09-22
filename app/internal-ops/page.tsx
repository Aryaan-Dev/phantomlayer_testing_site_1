import Link from 'next/link'
import { Lock } from 'lucide-react'

// DECOY — alternate internal ops entrypoint
// Any visit is logged via the same event emitter

export default function InternalOpsPage() {
  return (
    <div className="min-h-screen bg-neutral-100 flex items-center justify-center px-6">
      <div className="w-full max-w-sm text-center">
        <div className="h-12 w-12 rounded-xl bg-primary-900 flex items-center justify-center mx-auto mb-4">
          <Lock className="h-6 w-6 text-white" />
        </div>
        <h1 className="font-heading text-xl font-bold text-neutral-900 mb-2">MeridianBank Ops</h1>
        <p className="text-sm text-neutral-500 mb-8">Internal operations portal — authorized personnel only.</p>
        <div className="space-y-3">
          <Link href="/admin" className="block w-full rounded-lg bg-primary-900 py-2.5 text-sm font-medium text-white hover:bg-primary-700 transition-colors">
            Sign in to admin portal
          </Link>
          <Link href="/internal/db-console" className="block w-full rounded-lg border border-neutral-200 bg-white py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors">
            DB Operations Console
          </Link>
        </div>
        <p className="text-xs text-neutral-400 mt-8">MeridianBank Internal Systems • v2.4.1</p>
      </div>
    </div>
  )
}
