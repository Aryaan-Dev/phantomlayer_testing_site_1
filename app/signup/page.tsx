'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { PublicNav } from '@/components/ui/NavBar'
import { Footer } from '@/components/ui/Footer'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'

export default function SignupPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirmPassword: '' })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    setErrors((prev) => ({ ...prev, [e.target.name]: '' }))
  }

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!form.fullName.trim()) errs.fullName = 'Full name is required.'
    if (!form.email.trim()) errs.email = 'Email is required.'
    if (form.password.length < 8) errs.password = 'Password must be at least 8 characters.'
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match.'
    return errs
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName: form.fullName, email: form.email, password: form.password }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast(data.error ?? 'Sign up failed. Please try again.', 'error')
        return
      }
      toast('Account created! Please log in.', 'success')
      router.push('/login')
    } catch {
      toast('Something went wrong. Please try again.', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <PublicNav />
      <main className="flex-1 flex items-center justify-center py-16 px-6">
        <Card className="w-full max-w-md">
          <div className="mb-8 text-center">
            <h1 className="font-heading text-2xl font-bold text-neutral-900">Create your account</h1>
            <p className="mt-1 text-sm text-neutral-500">Get started with MeridianBank in minutes.</p>
          </div>
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <Input
              label="Full name"
              name="fullName"
              id="fullName"
              autoComplete="name"
              value={form.fullName}
              onChange={handleChange}
              error={errors.fullName}
              placeholder="Jane Smith"
            />
            <Input
              label="Email address"
              name="email"
              id="email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={handleChange}
              error={errors.email}
              placeholder="jane@example.com"
            />
            <Input
              label="Password"
              name="password"
              id="password"
              type="password"
              autoComplete="new-password"
              value={form.password}
              onChange={handleChange}
              error={errors.password}
              hint="At least 8 characters"
            />
            <Input
              label="Confirm password"
              name="confirmPassword"
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              value={form.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
            />
            <Button type="submit" className="w-full" size="lg" loading={loading}>
              Create account
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-neutral-500">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-primary-500 hover:underline">
              Log in
            </Link>
          </p>
        </Card>
      </main>
      <Footer />
    </div>
  )
}
