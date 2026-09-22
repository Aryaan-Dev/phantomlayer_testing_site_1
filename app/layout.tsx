import type { Metadata } from 'next'
import './globals.css'
import { ToastProvider } from '@/components/ui/Toast'
import SessionWrapper from '@/components/SessionWrapper'

export const metadata: Metadata = {
  title: 'MeridianBank — Banking, simplified.',
  description: 'MeridianBank offers checking, savings, and instant transfers — digital banking built for you.',
  icons: {
    icon: '/favicon.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-neutral-50 font-sans antialiased">
        <SessionWrapper>
          <ToastProvider>
            {children}
          </ToastProvider>
        </SessionWrapper>
      </body>
    </html>
  )
}
