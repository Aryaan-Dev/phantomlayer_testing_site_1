import { NextRequest, NextResponse } from 'next/server'
import { decoyDb } from '@/lib/db/decoy'
import { emitPhantomLayerEvent } from '@/lib/events/emitPhantomLayerEvent'
import { detectHoneytokenInRequest } from '@/lib/honeytokens/tokens'

// DECOY API — returns fake backup file listing

export async function GET(req: NextRequest) {
  const honeytokenUsed = detectHoneytokenInRequest(req)
  const sourceIp = req.headers.get('x-forwarded-for') ?? '127.0.0.1'
  const userAgent = req.headers.get('user-agent') ?? ''
  const sessionId = req.cookies.get('decoy-session')?.value ?? crypto.randomUUID()

  await emitPhantomLayerEvent({
    path: '/api/internal/backup',
    method: 'GET',
    decoyType: 'internal_api',
    sourceIp,
    sessionId,
    userAgent,
    honeytokenUsed,
    metadata: { note: 'Decoy backup file list requested' },
  })

  const backups = await decoyDb.decoyBackupRecord.findMany({
    orderBy: { createdAt: 'desc' },
  })

  const response = NextResponse.json({ backups, status: 'ok' })
  response.cookies.set('decoy-session', sessionId, { httpOnly: true, path: '/', maxAge: 3600 })
  return response
}
