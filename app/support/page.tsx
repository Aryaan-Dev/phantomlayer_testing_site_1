import { PublicNav } from '@/components/ui/NavBar'
import { Footer } from '@/components/ui/Footer'
import { Mail, Phone, MessageCircle } from 'lucide-react'

export default function SupportPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <PublicNav />
      <main className="flex-1 py-16 px-6">
        <div className="mx-auto max-w-3xl">
          <h1 className="font-heading text-4xl font-bold text-neutral-900 mb-4">Support</h1>
          <p className="text-lg text-neutral-500 mb-12">We&apos;re here to help. Reach out through any of the channels below.</p>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Phone, title: 'Phone', desc: '1-800-MRB-BANK', sub: 'Mon–Fri, 8am–8pm ET' },
              { icon: Mail, title: 'Email', desc: 'support@meridianbank.test', sub: 'Response within 1 business day' },
              { icon: MessageCircle, title: 'Live chat', desc: 'Available in-app', sub: 'Mon–Fri, 9am–6pm ET' },
            ].map(({ icon: Icon, title, desc, sub }) => (
              <div key={title} className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
                <Icon className="h-6 w-6 text-primary-500 mb-4" />
                <h3 className="font-semibold text-neutral-900 mb-1">{title}</h3>
                <p className="text-sm text-neutral-700 mb-1">{desc}</p>
                <p className="text-xs text-neutral-500">{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
