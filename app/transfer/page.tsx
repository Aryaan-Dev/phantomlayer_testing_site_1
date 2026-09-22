'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AuthNav } from '@/components/ui/NavBar'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { useToast } from '@/components/ui/Toast'
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import { useSession } from 'next-auth/react'

interface Account { id: string; type: string; balanceCents: number }

function formatCurrency(cents: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100)
}

type Step = 'form' | 'review' | 'done'

export default function TransferPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const [accounts, setAccounts] = useState<Account[]>([])
  const [step, setStep] = useState<Step>('form')
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({
    fromAccountId: '',
    toAccountId: '',
    recipientName: '',
    amountDollars: '',
    memo: '',
    transferType: 'internal' as 'internal' | 'external',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    fetch('/api/accounts').then((r) => r.json()).then((data) => {
      if (Array.isArray(data)) {
        setAccounts(data)
        if (data[0]) setForm((f) => ({ ...f, fromAccountId: data[0].id }))
      }
    })
  }, [])

  const validate = () => {
    const errs: Record<string, string> = {}
    const cents = Math.round(parseFloat(form.amountDollars) * 100)
    if (!form.amountDollars || isNaN(cents) || cents <= 0) errs.amount = 'Enter a valid amount.'
    if (cents > 100000000) errs.amount = 'Amount is too large.'
    if (form.transferType === 'internal' && !form.toAccountId) errs.toAccountId = 'Select a destination account.'
    if (form.transferType === 'internal' && form.fromAccountId === form.toAccountId) errs.toAccountId = 'Source and destination must differ.'
    if (form.transferType === 'external' && !form.recipientName.trim()) errs.recipientName = 'Enter recipient name.'
    return errs
  }

  const handleReview = (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setShowModal(true)
  }

  const handleConfirm = async () => {
    setLoading(true)
    const cents = Math.round(parseFloat(form.amountDollars) * 100)
    try {
      const res = await fetch('/api/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromAccountId: form.fromAccountId,
          toAccountId: form.transferType === 'internal' ? form.toAccountId : undefined,
          recipientName: form.transferType === 'external' ? form.recipientName : undefined,
          amountCents: cents,
          memo: form.memo || undefined,
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        toast(data.error ?? 'Transfer failed.', 'error')
        setShowModal(false)
        return
      }
      setShowModal(false)
      setStep('done')
    } catch {
      toast('Something went wrong. Please try again.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const fromAccount = accounts.find((a) => a.id === form.fromAccountId)
  const toAccount = accounts.find((a) => a.id === form.toAccountId)
  const cents = Math.round(parseFloat(form.amountDollars) * 100) || 0

  if (step === 'done') {
    return (
      <div className="flex min-h-screen flex-col bg-neutral-50">
        <AuthNav userName={session?.user?.name} />
        <main className="flex-1 flex items-center justify-center py-16 px-6">
          <Card className="w-full max-w-md text-center">
            <div className="h-16 w-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="h-8 w-8 text-accent-emerald" />
            </div>
            <h2 className="font-heading text-2xl font-bold text-neutral-900 mb-2">Transfer complete</h2>
            <p className="text-neutral-500 mb-8">
              {formatCurrency(cents)} has been successfully sent.
            </p>
            <div className="flex gap-3 justify-center">
              <Button variant="secondary" onClick={() => { setStep('form'); setForm((f) => ({ ...f, amountDollars: '', memo: '', recipientName: '' })) }}>
                Make another transfer
              </Button>
              <Button onClick={() => router.push('/dashboard')}>Back to dashboard</Button>
            </div>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-neutral-50">
      <AuthNav userName={session?.user?.name} />
      <main className="flex-1 mx-auto w-full max-w-xl px-6 py-10 fade-up">
        <h1 className="font-heading text-3xl font-bold text-neutral-900 mb-8">Send money</h1>
        <Card>
          <form onSubmit={handleReview} className="space-y-5">
            {/* Transfer type toggle */}
            <div>
              <label className="text-sm font-medium text-neutral-900 block mb-2">Transfer type</label>
              <div className="flex rounded-lg border border-neutral-200 overflow-hidden">
                {(['internal', 'external'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, transferType: type }))}
                    className={`flex-1 py-2.5 text-sm font-medium transition-colors ${form.transferType === type ? 'bg-primary-900 text-white' : 'bg-white text-neutral-600 hover:bg-neutral-50'}`}
                  >
                    {type === 'internal' ? 'Between my accounts' : 'To someone else'}
                  </button>
                ))}
              </div>
            </div>

            {/* From account */}
            <div>
              <label className="text-sm font-medium text-neutral-900 block mb-1.5">From</label>
              <select
                value={form.fromAccountId}
                onChange={(e) => setForm((f) => ({ ...f, fromAccountId: e.target.value }))}
                className="h-10 w-full rounded-lg border border-neutral-200 bg-white px-3 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.type === 'checking' ? 'Checking' : 'Savings'} — {formatCurrency(a.balanceCents)}
                  </option>
                ))}
              </select>
            </div>

            {/* To account or recipient */}
            {form.transferType === 'internal' ? (
              <div>
                <label className="text-sm font-medium text-neutral-900 block mb-1.5">To</label>
                <select
                  value={form.toAccountId}
                  onChange={(e) => setForm((f) => ({ ...f, toAccountId: e.target.value }))}
                  className="h-10 w-full rounded-lg border border-neutral-200 bg-white px-3 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Select account</option>
                  {accounts.filter((a) => a.id !== form.fromAccountId).map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.type === 'checking' ? 'Checking' : 'Savings'} — {formatCurrency(a.balanceCents)}
                    </option>
                  ))}
                </select>
                {errors.toAccountId && <p className="text-xs text-accent-red mt-1">{errors.toAccountId}</p>}
              </div>
            ) : (
              <Input
                label="Recipient name"
                id="recipientName"
                value={form.recipientName}
                onChange={(e) => setForm((f) => ({ ...f, recipientName: e.target.value }))}
                error={errors.recipientName}
                placeholder="John Doe"
              />
            )}

            <Input
              label="Amount"
              id="amount"
              type="number"
              min="0.01"
              step="0.01"
              value={form.amountDollars}
              onChange={(e) => { setForm((f) => ({ ...f, amountDollars: e.target.value })); setErrors((e2) => ({ ...e2, amount: '' })) }}
              error={errors.amount}
              placeholder="0.00"
            />
            <Input
              label="Memo (optional)"
              id="memo"
              value={form.memo}
              onChange={(e) => setForm((f) => ({ ...f, memo: e.target.value }))}
              placeholder="What's this for?"
            />

            <Button type="submit" className="w-full" size="lg">
              Review transfer <ArrowRight className="h-4 w-4" />
            </Button>
          </form>
        </Card>
      </main>

      {/* Confirmation Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title="Confirm transfer">
        <div className="space-y-4">
          <div className="rounded-xl bg-neutral-50 p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-neutral-500">From</span>
              <span className="font-medium text-neutral-900">{fromAccount?.type === 'checking' ? 'Checking' : 'Savings'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">To</span>
              <span className="font-medium text-neutral-900">{form.transferType === 'internal' ? (toAccount?.type === 'checking' ? 'Checking' : 'Savings') : form.recipientName}</span>
            </div>
            <div className="flex justify-between border-t border-neutral-200 pt-2 mt-2">
              <span className="text-neutral-500">Amount</span>
              <span className="font-bold text-lg tabular-nums text-neutral-900">{formatCurrency(cents)}</span>
            </div>
            {form.memo && (
              <div className="flex justify-between">
                <span className="text-neutral-500">Memo</span>
                <span className="text-neutral-900">{form.memo}</span>
              </div>
            )}
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button className="flex-1" onClick={handleConfirm} loading={loading}>Confirm</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
