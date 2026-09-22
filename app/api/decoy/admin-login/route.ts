import { NextRequest, NextResponse } from 'next/server'
import { decoyDb } from '@/lib/db/decoy'
import { emitPhantomLayerEvent } from '@/lib/events/emitPhantomLayerEvent'
import { detectHoneytokenInRequest } from '@/lib/honeytokens/tokens'

// DECOY ROUTE — logs all submissions, emits to PhantomLayer
// ISOLATION: Only imports lib/db/decoy and lib/events — never lib/db/real or lib/auth/session

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const honeytokenUsed = detectHoneytokenInRequest(req)

  const sourceIp = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? '127.0.0.1'
  const userAgent = req.headers.get('user-agent') ?? ''
  const sessionId = req.cookies.get('decoy-session')?.value ?? crypto.randomUUID()

  // Emit to PhantomLayer (fire-and-forget)
  await emitPhantomLayerEvent({
    path: '/admin',
    method: 'POST',
    decoyType: 'admin_login',
    sourceIp,
    sessionId,
    userAgent,
    honeytokenUsed,
    metadata: {
      username: typeof body.username === 'string' ? body.username : '[unknown]',
      note: 'Decoy admin login attempt',
    },
  })

  // Always return 401 — decoy never authenticates
  const response = NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  // Set session cookie for correlation
  response.cookies.set('decoy-session', sessionId, { httpOnly: true, path: '/', maxAge: 3600 })
  return response
}
