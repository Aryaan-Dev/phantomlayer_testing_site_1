'use client'

import { useState } from 'react'
import Link from 'next/link'
import { PublicNav } from '@/components/ui/NavBar'
import { Footer } from '@/components/ui/Footer'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Simulated — no real email delivery for MVP
    setSubmitted(true)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <PublicNav />
      <main className="flex-1 flex items-center justify-center py-16 px-6">
        <Card className="w-full max-w-md">
          {submitted ? (
            <div className="text-center py-4">
              <div className="h-12 w-12 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
                <svg className="h-6 w-6 text-accent-emerald" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="font-heading text-xl font-bold text-neutral-900 mb-2">Check your email</h2>
              <p className="text-sm text-neutral-500 mb-6">
                If an account exists for <strong>{email}</strong>, we&apos;ve sent a password reset link.
              </p>
              <Link href="/login" className="text-sm font-medium text-primary-500 hover:underline">
                Back to log in
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-8 text-center">
                <h1 className="font-heading text-2xl font-bold text-neutral-900">Reset your password</h1>
                <p className="mt-1 text-sm text-neutral-500">Enter your email and we&apos;ll send a reset link.</p>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Email address"
                  id="forgot-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jane@example.com"
                />
                <Button type="submit" className="w-full" size="lg">
                  Send reset link
                </Button>
              </form>
              <p className="mt-6 text-center text-sm text-neutral-500">
                Remember it?{' '}
                <Link href="/login" className="font-medium text-primary-500 hover:underline">
                  Log in
                </Link>
              </p>
            </>
          )}
        </Card>
      </main>
      <Footer />
    </div>
  )
}
