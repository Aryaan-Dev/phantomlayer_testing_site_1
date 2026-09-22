import { NextRequest, NextResponse } from 'next/server'
import { emitPhantomLayerEvent } from '@/lib/events/emitPhantomLayerEvent'

// Simulate attack traffic — triggers a scripted sequence of decoy hits
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  if (body.secret !== process.env.DEMO_CONTROL_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const sessionId = `sim_${Date.now()}`

  // Simulate: recon → admin_login → internal_api → honeytoken use
  const events: Parameters<typeof emitPhantomLayerEvent>[0][] = [
    { path: '/admin', method: 'GET', decoyType: 'admin_login', sessionId, sourceIp: '10.0.0.99', metadata: { note: '[SIMULATED] Attacker visited admin login page' } },
    { path: '/admin', method: 'POST', decoyType: 'admin_login', sessionId, sourceIp: '10.0.0.99', metadata: { username: 'admin', note: '[SIMULATED] Admin login attempt' } },
    { path: '/api/internal/users', method: 'GET', decoyType: 'internal_api', sessionId, sourceIp: '10.0.0.99', metadata: { note: '[SIMULATED] Internal users API probed' } },
    { path: '/api/internal/backup', method: 'GET', decoyType: 'internal_api', sessionId, sourceIp: '10.0.0.99', metadata: { note: '[SIMULATED] Backup list requested' } },
    { path: '/api/internal/export-customers', method: 'POST', decoyType: 'internal_api', sessionId, sourceIp: '10.0.0.99', honeytokenUsed: 'MRB_INTERNAL_3f9a8c2b1d4e7f6a5b3c9d8e', metadata: { note: '[SIMULATED] Honeytoken used in export request' } },
  ]

  for (const ev of events) {
    await emitPhantomLayerEvent(ev)
    await new Promise((r) => setTimeout(r, 250))
  }

  return NextResponse.json({ message: 'Attack simulation complete. 5 events emitted.' })
}
