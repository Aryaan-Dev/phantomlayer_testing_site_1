import { NextRequest, NextResponse } from 'next/server'

function checkSecret(req: NextRequest, body: { secret?: string }) {
  return body.secret === process.env.DEMO_CONTROL_SECRET
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  if (!checkSecret(req, body)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return NextResponse.json({ ok: true })
}
