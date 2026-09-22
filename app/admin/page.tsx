'use client'

import { useState } from 'react'
import { Lock, AlertCircle } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

// ⚠️  HONEYTOKEN SURFACE
// This page is intentionally accessible without real auth.
// Any credential submission is logged and forwarded to PhantomLayer.
// The login never succeeds — it always returns "invalid credentials."
// No real session, no real auth, no connection to lib/db/real.

export default function AdminLoginPage() {
  const [form, setForm] = useState({ username: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await fetch('/api/decoy/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: form.username }),
      })
    } catch { /* fire-and-forget — event logging */ }

    // Simulate network delay, then always fail
    await new Promise((r) => setTimeout(r, 800 + Math.random() * 600))
    setLoading(false)
    setError('Invalid credentials. Please try again or contact IT support.')
  }

  return (
    <div className="min-h-screen bg-neutral-100 flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        {/* Internal portal header — deliberately sparse */}
        <div className="mb-8 text-center">
          <div className="h-12 w-12 rounded-xl bg-primary-900 flex items-center justify-center mx-auto mb-4">
            <Lock className="h-6 w-6 text-white" />
          </div>
          <h1 className="font-heading text-xl font-bold text-neutral-900">MeridianBank Internal Portal</h1>
          <p className="text-sm text-neutral-500 mt-1">Authorized personnel only</p>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Username"
              id="admin-username"
              name="username"
              autoComplete="username"
              value={form.username}
              onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
              placeholder="username"
            />
            <Input
              label="Password"
              id="admin-password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            />

            {error && (
              <div className="flex items-start gap-2 rounded-lg bg-red-50 border border-red-100 px-3 py-2.5">
                <AlertCircle className="h-4 w-4 text-accent-red flex-shrink-0 mt-0.5" />
                <p className="text-xs text-accent-red">{error}</p>
              </div>
            )}

            <Button type="submit" className="w-full" loading={loading}>
              Sign in
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-neutral-400 mt-6">
          MeridianBank Internal Systems • Restricted Access
        </p>
      </div>
    </div>
  )
}
