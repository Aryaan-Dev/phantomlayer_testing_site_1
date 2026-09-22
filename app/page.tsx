import Link from 'next/link'
import { PublicNav } from '@/components/ui/NavBar'
import { Footer } from '@/components/ui/Footer'
import { ArrowRight, Shield, CreditCard, Zap } from 'lucide-react'

const features = [
  {
    icon: CreditCard,
    title: 'Checking & Savings',
    description: 'One place for your everyday spending and long-term savings, with no hidden fees.',
  },
  {
    icon: Zap,
    title: 'Instant Transfers',
    description: 'Move money between accounts in seconds — no waiting, no paperwork.',
  },
  {
    icon: Shield,
    title: 'Bank-grade Security',
    description: 'Your money is protected with industry-leading encryption and real-time monitoring.',
  },
]

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <PublicNav />

      {/* Hero */}
      <section className="relative overflow-hidden bg-primary-900 py-24 px-6">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-primary-500 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-3xl text-center fade-up">
          <h1 className="font-heading text-5xl font-bold leading-tight text-white">
            Banking, simplified.
          </h1>
          <p className="mt-6 text-xl text-white/70 max-w-xl mx-auto leading-relaxed">
            MeridianBank gives you the tools to manage your money clearly, simply, and confidently — no jargon, no surprises.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-lg bg-white px-8 py-3.5 text-base font-semibold text-primary-900 hover:bg-neutral-100 transition-colors"
            >
              Open an account
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-lg border border-white/30 px-8 py-3.5 text-base font-medium text-white hover:bg-white/10 transition-colors"
            >
              Log in
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 bg-neutral-50">
        <div className="mx-auto max-w-5xl">
          <h2 className="font-heading text-3xl font-bold text-neutral-900 text-center mb-12">
            Everything you need, nothing you don&apos;t.
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map(({ icon: Icon, title, description }) => (
              <div key={title} className="rounded-xl border border-neutral-200 bg-white p-8 shadow-sm">
                <div className="h-12 w-12 rounded-xl bg-primary-900/5 flex items-center justify-center mb-5">
                  <Icon className="h-6 w-6 text-primary-900" />
                </div>
                <h3 className="font-heading text-lg font-semibold text-neutral-900 mb-2">{title}</h3>
                <p className="text-sm text-neutral-500 leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA bar */}
      <section className="bg-white border-t border-neutral-200 py-16 px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-heading text-2xl font-bold text-neutral-900 mb-4">
            Ready to get started?
          </h2>
          <p className="text-neutral-500 mb-8">
            Opening an account takes less than two minutes.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 rounded-lg bg-primary-900 px-8 py-3.5 text-base font-semibold text-white hover:bg-primary-700 transition-colors"
          >
            Open a free account
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  )
}
