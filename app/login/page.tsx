'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { Suspense } from 'react'
import { PublicNav } from '@/components/ui/NavBar'
import { Footer } from '@/components/ui/Footer'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')

  const callbackUrl = searchParams.get('callbackUrl') ?? '/dashboard'

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.email || !form.password) {
      setError('Please enter your email and password.')
      return
    }
    setLoading(true)
    const result = await signIn('credentials', {
      email: form.email,
      password: form.password,
      redirect: false,
    })
    setLoading(false)
    if (result?.error) {
      setError('Incorrect email or password.')
      return
    }
    toast('Welcome back!', 'success')
    router.push(callbackUrl)
    router.refresh()
  }

  return (
    <Card className="w-full max-w-md">
      <div className="mb-8 text-center">
        <h1 className="font-heading text-2xl font-bold text-neutral-900">Welcome back</h1>
        <p className="mt-1 text-sm text-neutral-500">Sign in to your MeridianBank account.</p>
      </div>
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <Input
          label="Email address"
          name="email"
          id="login-email"
          type="email"
          autoComplete="email"
          value={form.email}
          onChange={handleChange}
          placeholder="jane@example.com"
        />
        <div>
          <Input
            label="Password"
            name="password"
            id="login-password"
            type="password"
            autoComplete="current-password"
            value={form.password}
            onChange={handleChange}
          />
          <div className="mt-1.5 text-right">
            <Link href="/forgot-password" className="text-xs text-primary-500 hover:underline">
              Forgot password?
            </Link>
          </div>
        </div>
        {error && <p className="text-sm text-accent-red">{error}</p>}
        <Button type="submit" className="w-full" size="lg" loading={loading}>
          Log in
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-neutral-500">
        Don&apos;t have an account?{' '}
        <Link href="/signup" className="font-medium text-primary-500 hover:underline">
          Open one for free
        </Link>
      </p>
    </Card>
  )
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <PublicNav />
      <main className="flex-1 flex items-center justify-center py-16 px-6">
        <Suspense fallback={<div className="h-96 w-full max-w-md rounded-xl bg-white animate-pulse" />}>
          <LoginForm />
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}
