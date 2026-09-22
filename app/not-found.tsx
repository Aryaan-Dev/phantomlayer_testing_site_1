import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-6">
      <div className="text-center">
        <p className="text-6xl font-heading font-bold text-neutral-200 mb-4">404</p>
        <h1 className="font-heading text-2xl font-bold text-neutral-900 mb-2">Page not found</h1>
        <p className="text-neutral-500 mb-8">The page you&apos;re looking for doesn&apos;t exist or has been moved.</p>
        <Link href="/" className="inline-flex items-center gap-2 rounded-lg bg-primary-900 px-6 py-2.5 text-sm font-medium text-white hover:bg-primary-700 transition-colors">
          Go home
        </Link>
      </div>
    </div>
  )
}
