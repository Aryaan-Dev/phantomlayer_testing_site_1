import { NextRequest, NextResponse } from 'next/server'
import { decoyDb } from '@/lib/db/decoy'
import { emitPhantomLayerEvent } from '@/lib/events/emitPhantomLayerEvent'
import { detectHoneytokenInRequest, HONEYTOKENS } from '@/lib/honeytokens/tokens'

// DECOY API — returns fake internal user list
// Any call (authenticated or not) is a threat signal

export async function GET(req: NextRequest) {
  const honeytokenUsed = detectHoneytokenInRequest(req)
  const sourceIp = req.headers.get('x-forwarded-for') ?? '127.0.0.1'
  const userAgent = req.headers.get('user-agent') ?? ''
  const sessionId = req.cookies.get('decoy-session')?.value ?? crypto.randomUUID()

  await emitPhantomLayerEvent({
    path: '/api/internal/users',
    method: 'GET',
    decoyType: 'internal_api',
    sourceIp,
    sessionId,
    userAgent,
    honeytokenUsed,
    metadata: { note: 'Decoy internal user list requested' },
  })

  const users = await decoyDb.decoyUser.findMany({
    select: { id: true, username: true, role: true, createdAt: true },
  })

  const response = NextResponse.json({ users, total: users.length })
  // Plant honeytoken in response header — looks like a real internal API key
  response.headers.set('X-Internal-Token', HONEYTOKENS.DECOY_API_HEADER_TOKEN)
  response.cookies.set('decoy-session', sessionId, { httpOnly: true, path: '/', maxAge: 3600 })
  return response
}
