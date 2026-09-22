# Technical Design Specification (TDS)
## MeridianBank — PhantomLayer Test Customer Website

| | |
|---|---|
| **Document type** | Technical Design Specification |
| **Companion to** | PRD_MeridianBank_TestSite.md, UIS_MeridianBank_TestSite.md |
| **Stack** | Next.js (TypeScript) + PostgreSQL + Prisma, all-in-one repo (real app + decoys) |
| **Build target** | Scaffolded from scratch inside **Antigravity** |
| **Status** | Draft v1.0 |

---

## 1. Purpose & Scope

This document specifies **how** MeridianBank (the PhantomLayer test/demo customer site defined in the PRD) is technically built: architecture, stack, folder structure, data model, API contracts, decoy isolation mechanics, event forwarding, and the build/run process — detailed enough for an agentic tool (Antigravity) to scaffold it incrementally with minimal ambiguity.

It does **not** cover PhantomLayer's own backend, dashboard, or AI/risk-scoring internals — only the integration contract this site must satisfy.

---

## 2. System Context

MeridianBank is the **"CUSTOMER SYSTEM"** box from the master architecture. Expanded view:

```
                         INTERNET (demo/local network only)
                                   |
                                   v
                    +---------------------------+
                    |   MeridianBank (Next.js)   |
                    |                             |
                    |  Public Pages               |
                    |  Auth (signup/login)        |
                    |  Banking Core (real)        |
                    |  --------------------------  |
                    |  Decoy Admin Login           |
                    |  Decoy Internal APIs         |
                    |  Decoy DB/Ops Viewer         |
                    |  Honeytoken surfaces         |
                    +---------------+-------------+
                            |                 |
                            v                 v
                 Real Postgres DB     Decoy Event Emitter
                 (customers,                |
                 accounts,                  v
                 transactions)     PhantomLayer Ingestion API
                                    (POST /events, or MCP/webhook)
                                            |
                                            v
                                  PhantomLayer detection,
                                  risk scoring, AI summary,
                                  dashboard (separate system)
```

Key design rule carried over from the master document (Section 13, "Security Architecture — Non-Negotiable"): **the decoy layer must never share a code path, credential, or connection string with the real banking data layer.**

---

## 3. Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| Frontend + backend | **Next.js 14+ (App Router), TypeScript** | Single full-stack app — pages, API routes/route handlers, and server actions all in one Next.js project |
| Styling | **Tailwind CSS** | Design tokens defined per the UIS |
| ORM / DB access | **Prisma** | Type-safe schema + migrations against Postgres |
| Database | **PostgreSQL 15+** | One database, two logically-separated schemas: `public` (real) and `decoy` (fake) — see §6 |
| Auth | **NextAuth.js (Credentials provider) or a minimal custom JWT/cookie session** | Applies to the *real* app only; decoy "login" never touches this |
| Synthetic data | **Faker.js** | Deterministic seeded generation for both real demo data and decoy data |
| Event delivery | **Native `fetch` to PhantomLayer ingestion endpoint** | Fire-and-forget, queued/retried client, fails silently to console/log |
| Containerization | **Docker + Docker Compose** | `web` (Next.js) + `db` (Postgres) services, isolated network |
| Package manager | npm (or pnpm) | Whichever Antigravity defaults to; document the choice once decided in repo README |

**Why this stack:** Next.js gives one deployable unit (simpler for a hackathon + easy for an agentic tool to scaffold incrementally), matches the "React + Tailwind" frontend direction already set for the wider PhantomLayer project (reference doc, Section 15), and PostgreSQL matches PhantomLayer's own control-plane and the reference DB-deception research direction (Section 9), keeping the whole hackathon stack coherent.

---

## 4. Repository / Folder Structure

Standalone repo (or a `customer-test-site/` folder inside the wider `rags2riches/` monorepo — either works; structure below assumes standalone for clarity):

```
meridianbank-testsite/
├─ app/
│  ├─ (public)/                  # marketing pages — real
│  │  ├─ page.tsx                 # landing page
│  │  ├─ about/page.tsx
│  │  └─ support/page.tsx
│  │
│  ├─ (auth)/                    # real auth
│  │  ├─ signup/page.tsx
│  │  ├─ login/page.tsx
│  │  └─ forgot-password/page.tsx
│  │
│  ├─ (banking)/                 # real app, session-protected
│  │  ├─ dashboard/page.tsx
│  │  ├─ accounts/[id]/page.tsx
│  │  ├─ transfer/page.tsx
│  │  └─ profile/page.tsx
│  │
│  ├─ (decoy)/                   # DECOY ROUTE GROUP — isolated
│  │  ├─ admin/page.tsx           # fake admin login
│  │  ├─ internal-ops/page.tsx    # alt fake internal tool entrypoint
│  │  └─ db-console/page.tsx      # fake DB/ops viewer
│  │
│  ├─ (demo-control)/            # operator-only reset/seed panel
│  │  └─ demo-control/page.tsx
│  │
│  └─ api/
│     ├─ auth/[...nextauth]/route.ts
│     ├─ accounts/route.ts
│     ├─ transactions/route.ts
│     ├─ transfer/route.ts
│     │
│     ├─ internal/                # DECOY APIs — isolated
│     │  ├─ users/route.ts
│     │  ├─ backup/route.ts
│     │  └─ export-customers/route.ts
│     │
│     └─ demo/
│        ├─ reset/route.ts
│        └─ seed/route.ts
│
├─ lib/
│  ├─ db/
│  │  ├─ real.ts                  # Prisma client scoped to real tables
│  │  └─ decoy.ts                 # Prisma client / store scoped to decoy tables ONLY
│  ├─ auth/
│  │  └─ session.ts               # real-app auth only
│  ├─ events/
│  │  └─ emitPhantomLayerEvent.ts # single chokepoint for all decoy → PhantomLayer events
│  ├─ synthetic/
│  │  ├─ generateCustomers.ts
│  │  ├─ generateTransactions.ts
│  │  └─ generateDecoyRecords.ts
│  └─ honeytokens/
│     └─ tokens.ts                # centrally defines planted honeytoken values, for detection matching
│
├─ components/
│  ├─ ui/                         # shared design-system primitives (buttons, cards, inputs…)
│  ├─ banking/                    # real-app components
│  └─ decoy/                      # decoy-page components (reuse ui/ + banking chrome for realism)
│
├─ prisma/
│  ├─ schema.prisma
│  └─ seed.ts
│
├─ public/
│  ├─ .env.example                # intentionally-planted honeytoken file (see §9)
│  └─ assets/
│
├─ docker/
│  ├─ Dockerfile
│  └─ docker-compose.yml
│
├─ .env.local.example             # REAL env template — never committed with real values
├─ README.md                      # build/run instructions (this doc's §16, condensed)
└─ package.json
```

**Isolation rule enforced by structure:** everything under `(decoy)` and `api/internal/*` imports **only** from `lib/db/decoy.ts`, `lib/events/`, and `lib/synthetic/generateDecoyRecords.ts`. Nothing in that route group is allowed to import `lib/db/real.ts` or `lib/auth/session.ts`. Enforce this with an ESLint import-boundary rule (`no-restricted-imports`) scoped to those folders so a future edit can't accidentally cross the line.

---

## 5. Architecture Overview

- **One Next.js app**, two logical zones:
  1. **Real zone** — public pages, real auth, real banking core, backed by `real` tables via `lib/db/real.ts`.
  2. **Decoy zone** — admin/internal-ops/db-console pages + `/api/internal/*`, backed by a **separate** `decoy` schema/tables via `lib/db/decoy.ts`, with its own fake "auth" that always fails realistically (or always "succeeds" into a fake-but-empty session, per demo preference) while logging every attempt.
- A **shared component/design layer** (`components/ui`, plus real-app nav/shell) is reused by the decoy zone so both zones are visually one product (satisfies PRD FR-16).
- A single **event emitter module** (`lib/events/emitPhantomLayerEvent.ts`) is the only place that talks to PhantomLayer. Every decoy page/API calls it; real-zone auth events optionally call it too (PRD FR-19).
- **Demo control** zone is a third, minimal area gated by a simple shared secret (env var), used only by the team running the demo — not part of the "story" shown to judges unless intentionally revealed.

---

## 6. Data Model

Two schemas in the same Postgres database (simplest for a hackathon while still keeping a hard logical boundary): `real` and `decoy`.

### 6.1 `real` schema

```prisma
model Customer {
  id            String   @id @default(cuid())
  fullName      String
  email         String   @unique
  passwordHash  String
  createdAt     DateTime @default(now())
  accounts      Account[]
}

model Account {
  id            String   @id @default(cuid())
  customerId    String
  type          String   // "checking" | "savings"
  balanceCents  Int
  customer      Customer @relation(fields: [customerId], references: [id])
  transactions  Transaction[]
}

model Transaction {
  id            String   @id @default(cuid())
  accountId     String
  amountCents   Int
  direction     String   // "debit" | "credit"
  counterparty  String
  memo          String?
  createdAt     DateTime @default(now())
  account       Account  @relation(fields: [accountId], references: [id])
}
```

### 6.2 `decoy` schema (fully synthetic, never referencing `real`)

```prisma
model DecoyUser {
  id            String   @id @default(cuid())
  username      String
  passwordHint  String   // fake, plausible-looking, never a real credential
  role          String   // "admin" | "ops" | "support"
  createdAt     DateTime @default(now())
}

model DecoyBackupRecord {
  id            String   @id @default(cuid())
  fileName      String
  sizeBytes     Int
  createdAt     DateTime @default(now())
}

model DecoyInteractionLog {
  id            String   @id @default(cuid())
  path          String
  method        String
  decoyType     String   // "admin_login" | "internal_api" | "honeytoken" | "db_console"
  payloadSample String?  // truncated, sanitized
  sourceIp      String?
  sessionId     String?
  createdAt     DateTime @default(now())
}
```

`DecoyInteractionLog` is a **local mirror** of what's sent to PhantomLayer — useful for local debugging/demo-control display even if the PhantomLayer ingestion call fails.

---

## 7. API Design

### 7.1 Real APIs (session-protected where noted)

| Method | Path | Purpose |
|---|---|---|
| POST | `/api/auth/signup` | Create customer + default checking account |
| POST/GET | `/api/auth/[...nextauth]` | NextAuth credentials login/logout/session |
| GET | `/api/accounts` | List authenticated customer's accounts |
| GET | `/api/accounts/[id]/transactions` | Paginated transaction history |
| POST | `/api/transfer` | Move funds between accounts (synthetic) |

### 7.2 Decoy APIs (unauthenticated, intentionally reachable)

| Method | Path | Behavior |
|---|---|---|
| GET | `/api/internal/users` | Returns a believable JSON list of fake internal users (from `DecoyUser`); logs + emits event |
| GET | `/api/internal/backup` | Returns a believable "backup file list" JSON; logs + emits event |
| POST | `/api/internal/export-customers` | Accepts the request, returns a fake "export queued" response; logs + emits event — **never touches real `Customer` table** |
| POST | `/admin` (page action) | Any credential submission is logged + emitted as `admin_login` regardless of values entered |

### 7.3 PhantomLayer Event Schema (outbound)

Single POST from `emitPhantomLayerEvent.ts` on every decoy interaction:

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
  "metadata": {
    "note": "fake internal user list requested"
  }
}
```

- `decoyType` enum: `admin_login`, `internal_api`, `honeytoken`, `db_console`.
- `honeytokenUsed`: the specific planted token value if the request matched one from `lib/honeytokens/tokens.ts`, else `null`.
- Endpoint URL and shared secret/header come from `PHANTOMLAYER_INGEST_URL` and `PHANTOMLAYER_INGEST_TOKEN` env vars.
- Delivery: `fetch` with a short timeout (e.g. 1500ms), one retry, then log-and-continue on failure — never blocks the response to the (possibly attacking) client.

---

## 8. Auth & Session Design

- **Real app:** NextAuth Credentials provider (or a minimal custom JWT-in-httpOnly-cookie implementation if NextAuth is overkill for the timebox) — bcrypt-hashed passwords, standard session cookie, protects `(banking)` route group via middleware.
- **Decoy "admin" login:** a normal-looking form with client + server code, but the server action **never checks against `real` credentials or issues a real session**. Two acceptable behaviors (pick one, document the choice in the demo script):
  - Always shows a generic "Invalid credentials" after a short delay (feels real, nothing ever "works"), **or**
  - Occasionally "succeeds" into a sandboxed, clearly-fake mini admin view with no real data (more dramatic for a demo, still fully isolated).
- Middleware distinguishes the two route groups explicitly (`(banking)` vs `(decoy)`) so it's structurally impossible for a decoy request to reach a real session cookie check.

---

## 9. Decoy & Honeytoken Design Details

- **Visual consistency:** decoy pages import the same `components/ui` and shared nav/footer as the real app — same fonts, colors, spacing (per UIS) — so they read as authentic internal tooling of the same company, not a bolted-on trap.
- **Honeytoken placement** (`lib/honeytokens/tokens.ts` is the single source of truth so any *use* of these exact values is detectable):
  - A `public/.env.example`-styled file with a fake-but-realistic `INTERNAL_API_KEY=` value.
  - An HTML comment in the rendered `<head>` referencing a "staging admin" path.
  - A string embedded in a client JS bundle that looks like a leftover debug credential.
  - A fake API key returned in a decoy API's JSON response headers.
- **Detection hook:** any inbound request whose Authorization header, query param, or POST body matches a known honeytoken value is flagged `honeytokenUsed` in the emitted event, regardless of which route it hit.
- **Isolation guarantee:** every decoy-zone module only imports `lib/db/decoy.ts`; enforced via the ESLint boundary rule from §4 plus a code-review checklist item.

---

## 10. Synthetic Data Generation

- `prisma/seed.ts` orchestrates:
  1. `generateCustomers.ts` — N fake customers + checking/savings accounts (Faker, seeded RNG for reproducibility).
  2. `generateTransactions.ts` — plausible transaction history per account (mix of debits/credits, realistic merchant-like counterparties).
  3. `generateDecoyRecords.ts` — fake `DecoyUser` and `DecoyBackupRecord` rows, styled like real internal tooling data.
- Seed is **deterministic** (fixed Faker seed) so every reset produces the same demo-ready state — critical for reliable live demos (PRD FR-22).
- `npm run db:reset` = drop + migrate + seed, exposed also via the Demo Control panel's `/api/demo/reset`.

---

## 11. Environment Configuration

`.env.local` (never committed; `.env.local.example` committed with placeholders):

```
DATABASE_URL=postgresql://user:pass@db:5432/meridianbank
NEXTAUTH_SECRET=replace_me
NEXTAUTH_URL=http://localhost:3000

PHANTOMLAYER_INGEST_URL=http://phantomlayer-local:8080/events
PHANTOMLAYER_INGEST_TOKEN=replace_me

DEMO_CONTROL_SECRET=replace_me
```

Honeytoken values live in code (`lib/honeytokens/tokens.ts`), not in `.env`, since they're meant to be *found*, not secret — but they're clearly marked and centrally listed so the team always knows what "counts" as a honeytoken hit.

---

## 12. Deployment / DevOps

`docker/docker-compose.yml` — two services, isolated network, no external egress required:

```yaml
services:
  web:
    build: ..
    ports: ["3000:3000"]
    env_file: ../.env.local
    depends_on: [db]
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: meridianbank
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
    volumes: ["db-data:/var/lib/postgresql/data"]
volumes:
  db-data:
```

- Local domain mapping: `meridianbank.test` → `127.0.0.1` via hosts file for demo realism (optional; `localhost:3000` works fine too).
- No inbound access from outside the lab network during testing, per the master document's safety guidance.

---

## 13. Security & Isolation Checklist (applied from the master doc's non-negotiables)

- [ ] No real customer data, ever, anywhere in this repo.
- [ ] Decoy code paths cannot reach `lib/db/real.ts` (enforced by lint rule).
- [ ] Decoy services make no outbound network calls except the single PhantomLayer event emitter.
- [ ] All admin/demo-control actions require `DEMO_CONTROL_SECRET`.
- [ ] Environment is fully disposable via `docker compose down -v && docker compose up --build`.
- [ ] `.env.local` never committed; only `.env.local.example` is.

---

## 14. Observability

- Structured JSON logging (`console.log(JSON.stringify(event))` is sufficient for a hackathon) for every decoy interaction, mirrored into `DecoyInteractionLog`.
- Include a correlation `sessionId` (random UUID set in a cookie on first decoy-zone hit) so a sequence of attacker actions can be visually grouped, matching the "Recon → Enumeration → Credential Testing" timeline shown in the reference document's dashboard mock (Section 12).

---

## 15. Testing Strategy

| Type | What |
|---|---|
| Unit | Prisma model logic, honeytoken matcher, event payload builder |
| Integration | Signup → login → dashboard → transfer happy path; decoy admin submit → event emitted |
| "Attack simulation" script | A small script/collection (curl or a Node script) that hits `/admin`, `/api/internal/users`, and a honeytoken value in sequence — used both for automated checks and as the literal demo script |
| Manual demo rehearsal | Full run-through of PRD's Acceptance Criteria before presenting |

---

## 16. Build Instructions for Antigravity (Suggested Scaffold Order)

Give Antigravity this PRD + this TDS + the UIS as context, then scaffold in this order to keep each step verifiable:

1. **Init:** Next.js + TypeScript + Tailwind project; commit design tokens from the UIS into `tailwind.config`.
2. **DB layer:** Prisma schema (§6), migrations, `docker-compose.yml`, `.env.local.example`.
3. **Shared UI:** `components/ui` primitives per the UIS component list.
4. **Public + auth:** landing page, signup, login, session middleware.
5. **Banking core:** dashboard, account detail, transfer flow, profile — wired to `lib/db/real.ts`.
6. **Synthetic data:** seed scripts, `npm run db:reset`.
7. **Decoy zone:** admin login, internal APIs, db-console page, honeytoken placements — wired to `lib/db/decoy.ts` only.
8. **Event emitter:** `emitPhantomLayerEvent.ts`, wire into every decoy surface.
9. **Demo control panel:** reset/seed endpoints + minimal gated UI.
10. **Rehearsal pass:** run the full Section-17 demo script from the PRD end-to-end; fix gaps.

---

## 17. Appendix

### 17.1 `.env.local.example`
```
DATABASE_URL=postgresql://user:pass@localhost:5432/meridianbank
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000
PHANTOMLAYER_INGEST_URL=
PHANTOMLAYER_INGEST_TOKEN=
DEMO_CONTROL_SECRET=
```

### 17.2 Sample decoy event payload
See §7.3.

### 17.3 References
- PRD_MeridianBank_TestSite.md
- UIS_MeridianBank_TestSite.md
- Source planning document: *Rags 2 Riches — AI-Powered Cybersecurity Deception Platform, Project Understanding & Build Document*
