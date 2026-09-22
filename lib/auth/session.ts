import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/authOptions'
import { redirect } from 'next/navigation'

export async function getSession() {
  return await getServerSession(authOptions)
}

export async function requireSession() {
  const session = await getSession()
  if (!session?.user) {
    redirect('/login')
  }
  return session
}

export async function getCurrentCustomerId(): Promise<string> {
  const session = await requireSession()
  return (session.user as { id: string }).id
}
