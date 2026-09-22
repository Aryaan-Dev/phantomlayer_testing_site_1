import { PublicNav } from '@/components/ui/NavBar'
import { Footer } from '@/components/ui/Footer'

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <PublicNav />
      <main className="flex-1 py-16 px-6">
        <div className="mx-auto max-w-3xl">
          <h1 className="font-heading text-4xl font-bold text-neutral-900 mb-6">About MeridianBank</h1>
          <div className="prose prose-neutral max-w-none">
            <p className="text-lg text-neutral-600 leading-relaxed mb-6">
              MeridianBank was founded on the belief that banking should be straightforward. No hidden fees, no confusing products, no fine print that requires a lawyer to decode.
            </p>
            <p className="text-neutral-600 leading-relaxed mb-6">
              We offer checking and savings accounts designed for real life — with instant transfers, clear transaction history, and support that actually answers the phone.
            </p>
            <p className="text-neutral-600 leading-relaxed">
              Our name comes from the meridian line — a reference to clarity, direction, and the idea that knowing exactly where you stand financially is the foundation of everything else.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
