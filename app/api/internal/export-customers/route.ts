import { NextRequest, NextResponse } from 'next/server'
import { emitPhantomLayerEvent } from '@/lib/events/emitPhantomLayerEvent'
import { detectHoneytokenInRequest } from '@/lib/honeytokens/tokens'

// DECOY API — accepts any POST, returns "export queued"
// CRITICAL: Never touches real Customer table

export async function POST(req: NextRequest) {
  const honeytokenUsed = detectHoneytokenInRequest(req)
  const sourceIp = req.headers.get('x-forwarded-for') ?? '127.0.0.1'
  const userAgent = req.headers.get('user-agent') ?? ''
  const sessionId = req.cookies.get('decoy-session')?.value ?? crypto.randomUUID()

  await emitPhantomLayerEvent({
    path: '/api/internal/export-customers',
    method: 'POST',
    decoyType: 'internal_api',
    sourceIp,
    sessionId,
    userAgent,
    honeytokenUsed,
    metadata: { note: 'Decoy customer export requested', warning: 'REAL DATA NOT TOUCHED — fully synthetic response' },
  })

  const jobId = `export_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
  const response = NextResponse.json({
    status: 'queued',
    jobId,
    message: 'Export queued. You will receive a download link within 5 minutes.',
    estimatedRows: 48291,
  })
  response.cookies.set('decoy-session', sessionId, { httpOnly: true, path: '/', maxAge: 3600 })
  return response
}
