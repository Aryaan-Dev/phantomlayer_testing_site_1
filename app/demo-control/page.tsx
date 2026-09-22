'use client'

import { useState } from 'react'
import { RotateCcw, Database, Zap, Lock } from 'lucide-react'
import { Button } from '@/components/ui/Button'

// DEMO CONTROL PANEL — operator only, gated by DEMO_CONTROL_SECRET
// Not part of the demo story shown to judges

export default function DemoControlPage() {
  const [passcode, setPasscode] = useState('')
  const [authenticated, setAuthenticated] = useState(false)
  const [status, setStatus] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState<string | null>(null)

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault()
    fetch('/api/demo/check-secret', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret: passcode }),
    }).then((r) => {
      if (r.ok) setAuthenticated(true)
      else setStatus((s) => ({ ...s, auth: 'Invalid passcode.' }))
    })
  }

  const runAction = async (action: string, label: string) => {
    setLoading(action)
    setStatus((s) => ({ ...s, [action]: '⏳ Running...' }))
    try {
      const res = await fetch(`/api/demo/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secret: passcode }),
      })
      const data = await res.json()
      setStatus((s) => ({ ...s, [action]: res.ok ? `✅ ${data.message}` : `❌ ${data.error}` }))
    } catch {
      setStatus((s) => ({ ...s, [action]: '❌ Request failed.' }))
    } finally {
      setLoading(null)
    }
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center px-6">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-3 mb-8">
            <Lock className="h-5 w-5 text-neutral-400" />
            <h1 className="text-white font-mono text-sm font-medium">MeridianBank Demo Control</h1>
          </div>
          <form onSubmit={handleAuth} className="flex gap-2">
            <input
              type="password"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              placeholder="Enter passcode"
              className="flex-1 h-10 rounded-lg bg-neutral-800 border border-neutral-700 px-3 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <button type="submit" className="rounded-lg bg-primary-900 px-4 text-sm font-medium text-white hover:bg-primary-700 transition-colors">
              Enter
            </button>
          </form>
          {status.auth && <p className="mt-3 text-xs text-accent-red">{status.auth}</p>}
        </div>
      </div>
    )
  }

  const actions = [
    { id: 'reset', label: 'Reset environment', desc: 'Drop all data and re-seed from scratch. Use before each demo run.', icon: RotateCcw, danger: true },
    { id: 'seed', label: 'Re-seed data only', desc: 'Add synthetic data without dropping existing tables.', icon: Database, danger: false },
    { id: 'simulate-attack', label: 'Simulate attack traffic', desc: 'Trigger a scripted sequence of decoy hits for rehearsal.', icon: Zap, danger: false },
  ]

  return (
    <div className="min-h-screen bg-neutral-900 px-6 py-10">
      <div className="max-w-2xl mx-auto">
        <h1 className="font-mono text-white text-lg font-bold mb-2">🎮 Demo Control Panel</h1>
        <p className="text-neutral-400 text-sm mb-10">Operator-only. Not visible during the demo.</p>

        <div className="space-y-4">
          {actions.map(({ id, label, desc, icon: Icon, danger }) => (
            <div key={id} className="rounded-xl bg-neutral-800 border border-neutral-700 p-5 flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <Icon className={`h-5 w-5 mt-0.5 flex-shrink-0 ${danger ? 'text-accent-red' : 'text-primary-500'}`} />
                <div>
                  <p className="text-sm font-medium text-white">{label}</p>
                  <p className="text-xs text-neutral-400 mt-0.5">{desc}</p>
                  {status[id] && <p className="text-xs text-neutral-300 mt-2 font-mono">{status[id]}</p>}
                </div>
              </div>
              <Button
                size="sm"
                variant={danger ? 'danger' : 'secondary'}
                onClick={() => runAction(id, label)}
                loading={loading === id}
                className="flex-shrink-0 !border-neutral-600 !text-neutral-200"
              >
                Run
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
