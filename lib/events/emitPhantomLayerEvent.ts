import { decoyDb } from '@/lib/db/decoy'

export type DecoyType = 'admin_login' | 'internal_api' | 'honeytoken' | 'db_console'

export interface PhantomLayerEvent {
  source: 'meridianbank-testsite'
  timestamp: string
  path: string
  method: string
  decoyType: DecoyType
  sessionId?: string | null
  sourceIp?: string | null
  userAgent?: string | null
  honeytokenUsed?: string | null
  metadata?: Record<string, unknown>
}

/**
 * Single chokepoint for emitting events to PhantomLayer.
 * Fire-and-forget: failures are logged locally and never block the response.
 *
 * Also writes to DecoyInteractionLog as a local mirror for debugging
 * even when PhantomLayer isn't reachable.
 */
export async function emitPhantomLayerEvent(event: Omit<PhantomLayerEvent, 'source' | 'timestamp'>): Promise<void> {
  const payload: PhantomLayerEvent = {
    source: 'meridianbank-testsite',
    timestamp: new Date().toISOString(),
    ...event,
  }

  // 1. Write local mirror to decoy DB (always, regardless of PhantomLayer reachability)
  try {
    await decoyDb.decoyInteractionLog.create({
      data: {
        path: payload.path,
        method: payload.method,
        decoyType: payload.decoyType,
        payloadSample: JSON.stringify(payload.metadata ?? {}).slice(0, 500),
        sourceIp: payload.sourceIp ?? null,
        sessionId: payload.sessionId ?? null,
      },
    })
  } catch (dbErr) {
    console.error('[PhantomLayer] Failed to write local DecoyInteractionLog:', dbErr)
  }

  // 2. Forward to PhantomLayer ingestion endpoint (fire-and-forget)
  const ingestUrl = process.env.PHANTOMLAYER_INGEST_URL
  if (!ingestUrl) {
    // Not configured — log to console for local dev/rehearsal
    console.log('[PhantomLayer EVENT]', JSON.stringify(payload, null, 2))
    return
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 1500)

  const attemptSend = async (retries: number): Promise<void> => {
    try {
      const res = await fetch(ingestUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(process.env.PHANTOMLAYER_INGEST_TOKEN
            ? { Authorization: `Bearer ${process.env.PHANTOMLAYER_INGEST_TOKEN}` }
            : {}),
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      })
      clearTimeout(timeout)
      if (!res.ok) {
        throw new Error(`PhantomLayer ingest returned ${res.status}`)
      }
    } catch (err) {
      clearTimeout(timeout)
      if (retries > 0) {
        await new Promise((r) => setTimeout(r, 300))
        return attemptSend(retries - 1)
      }
      console.error('[PhantomLayer] Event delivery failed (non-blocking):', err)
    }
  }

  // Don't await — truly fire-and-forget
  attemptSend(1).catch(() => {})
}
