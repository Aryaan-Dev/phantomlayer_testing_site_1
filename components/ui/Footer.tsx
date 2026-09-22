import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t border-neutral-200 bg-white mt-auto">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-neutral-500">
            © {new Date().getFullYear()} MeridianBank. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            {[
              { href: '/about', label: 'About' },
              { href: '/support', label: 'Support' },
              { href: '/privacy', label: 'Privacy' },
              { href: '/terms', label: 'Terms' },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
