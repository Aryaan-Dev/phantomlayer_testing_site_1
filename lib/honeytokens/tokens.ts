/**
 * Honeytoken Registry — MeridianBank
 *
 * These are INTENTIONALLY PLANTED fake credentials.
 * They are meant to be "found" by attackers and used as bait.
 * Any inbound request using one of these values is a high-confidence threat signal.
 *
 * DO NOT use these values in any real auth or database context.
 * DO NOT treat them as secrets — they are public by design (they'll be in HTML, JS, .env.example, etc.)
 */

export const HONEYTOKENS = {
  /** Planted in public/.env.example as INTERNAL_API_KEY */
  INTERNAL_API_KEY: 'MRB_INTERNAL_3f9a8c2b1d4e7f6a5b3c9d8e',

  /** Planted as an HTML comment in app/layout.tsx head — looks like a staging path hint */
  STAGING_ADMIN_COMMENT: '<!-- staging-ops: /internal-ops?token=stg_8x2k9p4m -->',

  /** Planted as a string in a client JS bundle — looks like a leftover debug key */
  DEBUG_BUNDLE_KEY: 'debug_key_MRB_7g3h1j2k4l5m6n8p',

  /** Returned as a response header from decoy APIs — looks like a real bearer token */
  DECOY_API_HEADER_TOKEN: 'Bearer mrb_api_9z1a2b3c4d5e6f7g8h',
} as const

export type HoneytokenValue = (typeof HONEYTOKENS)[keyof typeof HONEYTOKENS]

/** Check if an inbound value matches any known honeytoken */
export function matchHoneytoken(value: string | null | undefined): string | null {
  if (!value) return null
  for (const [, token] of Object.entries(HONEYTOKENS)) {
    if (value.includes(token)) return token
  }
  return null
}

/** Check all common request locations for honeytoken usage */
export function detectHoneytokenInRequest(request: Request): string | null {
  const auth = request.headers.get('authorization')
  const xApiKey = request.headers.get('x-api-key')
  const url = new URL(request.url)
  const tokenParam = url.searchParams.get('token') || url.searchParams.get('api_key')

  return (
    matchHoneytoken(auth) ||
    matchHoneytoken(xApiKey) ||
    matchHoneytoken(tokenParam)
  )
}
