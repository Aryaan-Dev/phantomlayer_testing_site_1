# MeridianBank — PhantomLayer Test Customer Website

> A realistic, fully synthetic digital-banking web app that serves as the **demo/honeypot surface** for the PhantomLayer cybersecurity deception platform.

---

## Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Set up the database
```bash
# Run migration and generate Prisma client
npx prisma migrate dev --name init

# Seed with synthetic demo data
npx tsx prisma/seed.ts
```

### 3. Start the dev server
```bash
npm run dev
```

Visit → **http://localhost:3000**

---

## Demo Login Credentials

| Role | Email | Password |
|---|---|---|
| Demo customer | `demo@meridianbank.test` | `MeridianDemo2024!` |
| Demo control panel | `/demo-control` | `demo-reset-2024` (set in `.env`) |

---

## Architecture Overview

```
app/
├── (public)        → Landing, About, Support
├── (auth)          → Login, Signup, Forgot-password
├── (banking)       → Dashboard, Accounts, Transfer, Profile  ← auth required
├── (decoy)         → /admin, /internal-ops, /internal/db-console ← honeypot
├── (demo-control)  → /demo-control ← operator only
└── api/
    ├── auth/       → NextAuth + signup
    ├── accounts/   → Real banking APIs (session-protected)
    ├── transfer/   → Funds transfer (session-protected)
    ├── internal/   → DECOY APIs (intentionally reachable)
    └── demo/       → Reset, seed, simulate-attack (secret-gated)

lib/
├── db/real.ts      → Prisma client for real banking data ONLY
├── db/decoy.ts     → Prisma client for decoy data ONLY
├── auth/session.ts → Session helpers (real zone only)
├── events/         → PhantomLayer event emitter
├── honeytokens/    → Central honeytoken registry
└── synthetic/      → Faker-based data generators
```

**Isolation rule:** Nothing under `app/api/internal/` or `app/admin/` may import `lib/db/real.ts` or `lib/auth/session.ts`. Enforced by ESLint `no-restricted-imports`.

---

## Decoy / Honeypot Surfaces

| Surface | URL | Type |
|---|---|---|
| Fake admin login | `/admin` | Page — always fails, emits event |
| Internal ops entrypoint | `/internal-ops` | Page — links to admin + DB console |
| Fake DB console | `/internal/db-console` | Page — fake table browser |
| Internal user list | `/api/internal/users` | API — returns fake DecoyUser JSON |
| Backup file list | `/api/internal/backup` | API — returns fake backup records |
| Customer export | `/api/internal/export-customers` | API — fake "export queued" |
| Planted env file | `/public/.env.example` | File — fake API keys |
| HTML comment | `<head>` of all pages | HTML — staging path hint |
| Response header | `X-Internal-Token` on decoy APIs | Header — fake bearer token |

---

## Honeytoken Detection

Any request containing a known honeytoken value (defined in `lib/honeytokens/tokens.ts`) is flagged with `honeytokenUsed` in the emitted PhantomLayer event. Detection covers:
- `Authorization` header
- `X-Api-Key` header
- `?token=` / `?api_key=` query params

---

## PhantomLayer Integration

Set `PHANTOMLAYER_INGEST_URL` and `PHANTOMLAYER_INGEST_TOKEN` in `.env` to forward events to PhantomLayer.

If not set, all events are logged to console (fire-and-forget fallback — site never breaks).

**Event schema:**
```json
{
  "source": "meridianbank-testsite",
  "timestamp": "2026-09-22T10:41:03Z",
  "path": "/api/internal/users",
  "method": "GET",
  "decoyType": "internal_api",
  "sessionId": "sess_abc123",
  "sourceIp": "203.0.113.10",
  "userAgent": "curl/8.4.0",
  "honeytokenUsed": null,
  "metadata": {}
}
```

---

## Reset for Demo

```bash
# Full reset (wipe + re-seed) — run between demo sessions
npx prisma migrate reset --force && npx tsx prisma/seed.ts

# Or via the Demo Control Panel at /demo-control (passcode: value of DEMO_CONTROL_SECRET in .env)
```

---

## Simulate an Attack (Demo Rehearsal)

```bash
# Hit decoy surfaces in sequence (same script shown to judges)
curl http://localhost:3000/admin
curl -X POST http://localhost:3000/api/decoy/admin-login -H "Content-Type: application/json" -d '{"username":"admin","password":"admin123"}'
curl http://localhost:3000/api/internal/users
curl http://localhost:3000/api/internal/backup
curl -X POST http://localhost:3000/api/internal/export-customers -H "Authorization: Bearer MRB_INTERNAL_3f9a8c2b1d4e7f6a5b3c9d8e"

# Or use the "Simulate attack traffic" button in the Demo Control Panel
```

---

## Environment Variables

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | SQLite: `file:./dev.db` / Postgres: full connection string |
| `NEXTAUTH_SECRET` | JWT signing secret |
| `NEXTAUTH_URL` | App base URL (default: `http://localhost:3000`) |
| `PHANTOMLAYER_INGEST_URL` | PhantomLayer event endpoint (optional — logs to console if unset) |
| `PHANTOMLAYER_INGEST_TOKEN` | Bearer token for PhantomLayer ingestion |
| `DEMO_CONTROL_SECRET` | Password for `/demo-control` panel |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 App Router, TypeScript |
| Styling | Tailwind CSS (UIS design tokens) |
| Database | SQLite (dev) / PostgreSQL (prod) via Prisma |
| Auth | NextAuth.js Credentials provider |
| Data generation | Faker.js (deterministic seed) |
| Icons | Lucide React |

---

## Switching to PostgreSQL (Docker)

1. Start Postgres (Docker or managed service)
2. Update `DATABASE_URL` in `.env`:
   ```
   DATABASE_URL=postgresql://user:pass@localhost:5432/meridianbank
   ```
3. Change `provider` in `prisma/schema.prisma` from `"sqlite"` to `"postgresql"`
4. Run `npx prisma migrate dev`
