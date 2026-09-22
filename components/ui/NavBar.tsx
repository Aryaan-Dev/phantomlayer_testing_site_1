'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, ArrowLeftRight, User, LogOut, Menu, X } from 'lucide-react'
import { signOut } from 'next-auth/react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

function MeridianLogo({ variant = 'light' }: { variant?: 'light' | 'dark' }) {
  const textColor = variant === 'light' ? 'text-white' : 'text-primary-900'
  return (
    <Link href="/" className="flex items-center gap-2">
      {/* Geometric horizon arc mark */}
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
        <rect width="28" height="28" rx="6" fill={variant === 'light' ? 'rgba(255,255,255,0.15)' : '#0B1E3D'} />
        <path d="M6 18 Q14 8 22 18" stroke={variant === 'light' ? 'white' : '#3B82F6'} strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <line x1="6" y1="20" x2="22" y2="20" stroke={variant === 'light' ? 'rgba(255,255,255,0.5)' : '#3B82F6'} strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      <span className={cn('font-heading text-lg leading-none', textColor)}>
        <span className="font-semibold">Meridian</span>
        <span className="font-normal">Bank</span>
      </span>
    </Link>
  )
}

// ─── PUBLIC NAV (marketing pages) ────────────────────────────────────────────

export function PublicNav() {
  return (
    <nav className="sticky top-0 z-40 border-b border-neutral-200 bg-white">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <MeridianLogo variant="dark" />
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-medium text-neutral-700 hover:text-neutral-900">
            Log in
          </Link>
          <Link
            href="/signup"
            className="rounded-lg bg-primary-900 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 transition-colors"
          >
            Open an account
          </Link>
        </div>
      </div>
    </nav>
  )
}

// ─── AUTHENTICATED NAV (banking pages) ───────────────────────────────────────

const navLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/transfer', label: 'Transfer', icon: ArrowLeftRight },
  { href: '/profile', label: 'Profile', icon: User },
]

export function AuthNav({ userName }: { userName?: string | null }) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-40 bg-primary-900 shadow-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <MeridianLogo variant="light" />

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                pathname === href
                  ? 'bg-white/10 text-white'
                  : 'text-white/70 hover:bg-white/10 hover:text-white',
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {userName && (
            <span className="hidden md:block text-sm text-white/70">
              {userName}
            </span>
          )}
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            aria-label="Sign out"
            className="hidden md:flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-white/70 hover:bg-white/10 hover:text-white transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden rounded-lg p-2 text-white/70 hover:bg-white/10 hover:text-white transition-colors"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-white/10 px-4 pb-4">
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 mt-1 text-sm font-medium',
                pathname === href ? 'bg-white/10 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white',
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 mt-1 text-sm text-white/70 hover:bg-white/10 hover:text-white transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      )}
    </nav>
  )
}
