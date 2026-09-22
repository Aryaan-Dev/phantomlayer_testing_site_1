'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { AuthNav } from '@/components/ui/NavBar'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useToast } from '@/components/ui/Toast'
import { CreditCard } from 'lucide-react'

const fakeCards = [
  { last4: '4284', brand: 'Visa', expiry: '09/27', status: 'Active' },
  { last4: '1729', brand: 'Mastercard', expiry: '03/26', status: 'Active' },
]

export default function ProfilePage() {
  const { data: session, update } = useSession()
  const { toast } = useToast()
  const [nameValue, setNameValue] = useState(session?.user?.name ?? '')
  const [saving, setSaving] = useState(false)

  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    // Simulated update — real implementation would call a PATCH /api/profile endpoint
    await new Promise((r) => setTimeout(r, 600))
    setSaving(false)
    toast('Profile updated.', 'success')
  }

  return (
    <div className="flex min-h-screen flex-col bg-neutral-50">
      <AuthNav userName={session?.user?.name} />
      <main className="flex-1 mx-auto w-full max-w-3xl px-6 py-10 fade-up">
        <h1 className="font-heading text-3xl font-bold text-neutral-900 mb-8">Profile & settings</h1>

        {/* Personal info */}
        <Card className="mb-6">
          <h2 className="font-heading text-lg font-semibold text-neutral-900 mb-5">Personal information</h2>
          <form onSubmit={handleSaveName} className="space-y-4 max-w-md">
            <Input
              label="Full name"
              id="profile-name"
              value={nameValue}
              onChange={(e) => setNameValue(e.target.value)}
            />
            <Input
              label="Email address"
              id="profile-email"
              type="email"
              defaultValue={session?.user?.email ?? ''}
              disabled
              hint="Contact support to update your email."
            />
            <Button type="submit" loading={saving} size="sm">
              Save changes
            </Button>
          </form>
        </Card>

        {/* Change password */}
        <Card className="mb-6">
          <h2 className="font-heading text-lg font-semibold text-neutral-900 mb-5">Change password</h2>
          <ChangePasswordForm />
        </Card>

        {/* Linked cards */}
        <Card>
          <h2 className="font-heading text-lg font-semibold text-neutral-900 mb-5">Linked cards</h2>
          <div className="space-y-3">
            {fakeCards.map((card) => (
              <div key={card.last4} className="flex items-center justify-between rounded-xl border border-neutral-200 p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary-900/5 flex items-center justify-center">
                    <CreditCard className="h-5 w-5 text-primary-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-900">
                      {card.brand} •••• {card.last4}
                    </p>
                    <p className="text-xs text-neutral-500">Expires {card.expiry}</p>
                  </div>
                </div>
                <Badge variant="success">{card.status}</Badge>
              </div>
            ))}
          </div>
        </Card>
      </main>
    </div>
  )
}

function ChangePasswordForm() {
  const { toast } = useToast()
  const [form, setForm] = useState({ current: '', next: '', confirm: '' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.next !== form.confirm) {
      toast('New passwords do not match.', 'error')
      return
    }
    setLoading(true)
    await new Promise((r) => setTimeout(r, 600))
    setLoading(false)
    toast('Password updated.', 'success')
    setForm({ current: '', next: '', confirm: '' })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      <Input label="Current password" id="current-pw" type="password" value={form.current} onChange={(e) => setForm((f) => ({ ...f, current: e.target.value }))} />
      <Input label="New password" id="new-pw" type="password" value={form.next} onChange={(e) => setForm((f) => ({ ...f, next: e.target.value }))} />
      <Input label="Confirm new password" id="confirm-pw" type="password" value={form.confirm} onChange={(e) => setForm((f) => ({ ...f, confirm: e.target.value }))} />
      <Button type="submit" size="sm" loading={loading}>Update password</Button>
    </form>
  )
}
