# Product Requirements Document (PRD)
## MeridianBank — PhantomLayer Test Customer Website

| | |
|---|---|
| **Document type** | Product Requirements Document |
| **Sub-project of** | Rags 2 Riches (R2R) / **PhantomLayer** — AI-Powered Cybersecurity Deception Platform |
| **This module** | The simulated "customer" website that PhantomLayer protects during testing/demo |
| **Owner** | Web Development workstream |
| **Status** | Draft v1.0 — for hackathon build |
| **Build tool** | Antigravity (agentic dev environment), scaffolded from scratch |

---

## 1. Purpose of This Document

This PRD defines **what we are building on the web-development side of the hackathon project**: not PhantomLayer itself, and not PhantomLayer's own marketing site, but the **target/customer application** — a realistic, fully-functional-looking digital banking web app that PhantomLayer deploys its deception layer around.

This site plays the role labelled **"CUSTOMER SYSTEM"** in the master architecture diagram (Section 7 of the reference document) and hosts the **"Web/API"** box that PhantomLayer's decoys sit beside. It is the stage on which the demo happens.

> **One-line definition:** MeridianBank is a synthetic digital-banking web app — real-looking, fully synthetic — that doubles as the honeypot surface PhantomLayer instruments, monitors, and generates incident reports for.

---

## 2. Background & Relationship to PhantomLayer

The wider hackathon project (internally referenced as "Rags 2 Riches", branded externally as **PhantomLayer**) is a managed deception platform: it wraps a company's real infrastructure with decoy pages, APIs, servers, and databases so that any interaction with those decoys is a high-confidence signal of malicious activity.

To **demo and test** PhantomLayer, the team needs a believable "real company" to protect — this is that company. Per the reference document's demo story (Section 17):

> "Open PhantomLayer dashboard → Add `demo-company.test` → Verify ownership → Create Deception Environment → Web Decoy ACTIVE / API Decoy ACTIVE / Decoy DB ACTIVE → generate synthetic records → run a controlled test client against the decoy → show events arriving in real time → risk score climbs → open incident → AI summary → show production demo DB untouched, deception DB shows the activity."

MeridianBank **is** `demo-company.test` in that script. This PRD's site is not a component of PhantomLayer's product — it is PhantomLayer's **test fixture**, built to be indistinguishable from a real customer's production banking app.

### 2.1 What this site is NOT
- It is **not** the PhantomLayer product dashboard (Security Center, Events, Incidents, Risk, AI Summary — that's a separate workstream).
- It is **not** PhantomLayer's marketing/landing website.
- It is **not** a real bank. No real money, no real PII, no real regulatory compliance (KYC/AML simulated only, never implemented for real).

---

## 3. Goals

| # | Goal |
|---|---|
| G1 | Build a **believable, modern digital-banking web app** (signup, login, accounts, transactions, transfers, profile) that looks and behaves like production fintech software. |
| G2 | Embed a set of **decoy/honeypot surfaces** inside the same app (fake admin panel, fake internal APIs, honeytoken credentials, fake DB/ops viewer) that are visually indistinguishable from the real app but logically isolated from it. |
| G3 | Wire every decoy interaction (and key real-app auth events) to emit structured events to **PhantomLayer's ingestion endpoint**, so the platform has live signal to detect, score, and summarize during the demo. |
| G4 | Keep the entire site **disposable, isolated, and synthetic-data-only** — safe to attack, reset, and re-run repeatedly during a live demo. |
| G5 | Be buildable **from scratch inside Antigravity**, with a repo structure and spec detailed enough for an agentic build tool to scaffold incrementally without ambiguity (see companion TDS). |
| G6 | Support the exact demo script in Section 17 of the reference document end-to-end, reliably, in front of judges. |

## 4. Non-Goals

- No real payments, real banking rails, real user data, or real external integrations (no Plaid, no real card networks, etc.).
- No production-grade regulatory/compliance features (2FA via real SMS providers, real KYC, real fraud/AML engines) — these are **simulated UI only** where needed for realism.
- No multi-tenant SaaS onboarding for *this* site — MeridianBank is a single, fixed demo tenant. (Multi-tenancy is explicitly P2/out-of-scope for the whole hackathon MVP per the reference doc, Section 14.)
- Not responsible for the detection/scoring/AI-summary logic itself — this site only **emits events**; PhantomLayer consumes and interprets them.

---

## 5. Users / Personas

| Persona | Who they are | What they do on this site |
|---|---|---|
| **Judge / Evaluator** | Hackathon judges watching the live demo | Watches the "real" MeridianBank app work normally, then watches an attacker interact with decoys and PhantomLayer surface the incident |
| **Demo "legitimate customer"** | A team member playing a normal user | Signs up, logs in, checks balance, makes a transfer — generates clean baseline traffic |
| **Demo "attacker"** | A team member (or scripted client) playing a red-team role | Probes the site, finds/hits decoy admin login, decoy APIs, honeytoken credentials |
| **PhantomLayer platform** | The system under test | Consumes MeridianBank's event stream via webhook/API; is the actual product being demonstrated |
| **Antigravity build agent** | The AI coding agent scaffolding this repo | Consumes this PRD + the TDS + the UIS as its build spec |

---

## 6. Functional Requirements

### 6.1 Real Application — Public Marketing Pages
| ID | Requirement |
|---|---|
| FR-01 | Public landing page: hero, product blurbs ("Checking", "Savings", "Cards", "Transfers"), footer, nav to Login/Sign up |
| FR-02 | About / Support / Contact static pages (fintech-standard filler content) |
| FR-03 | Standard `robots.txt`, `sitemap.xml`, favicon, legal footer (Privacy/Terms — placeholder synthetic text) |

### 6.2 Real Application — Auth & Account
| ID | Requirement |
|---|---|
| FR-04 | Sign up (name, email, synthetic SSN-style ID, password) → creates a synthetic customer + one checking account |
| FR-05 | Login / logout with session cookie; "Forgot password" flow (simulated, no real email delivery required for MVP) |
| FR-06 | Session timeout + re-auth for sensitive actions (transfers) — realism only, not a hard security requirement |

### 6.3 Real Application — Banking Core
| ID | Requirement |
|---|---|
| FR-07 | Dashboard: account balance cards (checking/savings), recent transactions widget, quick actions |
| FR-08 | Account detail page: full transaction history, filter/search, pagination |
| FR-09 | Transfer money flow: between own accounts and to a "recipient" (synthetic, no real destination) with confirmation step |
| FR-10 | Profile/settings: edit display info, change password, view linked (fake) cards |
| FR-11 | All banking data (customers, accounts, transactions) is **generated synthetic data** — see Section 8 |

### 6.4 Decoy / Honeypot Layer (embedded in the same app — per elicited scope)
| ID | Requirement |
|---|---|
| FR-12 | **Decoy admin login** at a guessable path (e.g. `/admin`, `/internal-ops`) styled to look like a legitimate internal tool. Any submission is logged and forwarded as an event — never authenticates against anything real. |
| FR-13 | **Decoy internal APIs** (e.g. `/api/internal/users`, `/api/v1/backup`, `/api/v1/export-customers`) that return believable, fully synthetic JSON payloads and log every call. |
| FR-14 | **Honeytoken credentials** planted in realistic locations an attacker might find them: an exposed `.env.example`-style file, an HTML comment, a leaked-looking config/JS bundle string, a fake API key in a public JS file. Any *use* of a honeytoken is a distinct, high-confidence event. |
| FR-15 | **Decoy "database/ops viewer"** page (e.g. `/internal/db-console` or a fake Adminer/phpMyAdmin-style page) showing believable fake tables/rows — read-only, fully synthetic, isolated store. |
| FR-16 | Decoy surfaces must be **visually consistent** with the real app's design system (same nav chrome, same fonts/colors) so they read as authentic parts of the company, not as an obviously bolted-on trap. |
| FR-17 | Decoy surfaces must be **logically isolated**: no code path from any decoy page/API touches the real customer/account/transaction database or real session/auth system. |

### 6.5 Event Forwarding to PhantomLayer
| ID | Requirement |
|---|---|
| FR-18 | Every decoy hit (page load, form submit, API call, honeytoken use) is packaged into a structured event and POSTed to PhantomLayer's ingestion endpoint in real time (see TDS §7 for payload schema). |
| FR-19 | Baseline real-app auth events (login success/failure, signup) are optionally forwarded too, to give PhantomLayer "normal" traffic to contrast against decoy traffic. |
| FR-20 | Event delivery failures must not break the site's UX (fire-and-forget with local fallback logging). |

### 6.6 Demo/Operator Controls
| ID | Requirement |
|---|---|
| FR-21 | A simple, password-gated **"Demo Control" panel** (separate from the decoy admin page) lets the team: reset the environment, re-seed synthetic data, and toggle "attack simulation" traffic for rehearsal. |
| FR-22 | One-command reset (via seed script) so the demo can be re-run cleanly between judge sessions. |

---

## 7. Non-Functional Requirements

| Category | Requirement |
|---|---|
| **Isolation & safety** | Zero real PII, zero real credentials, zero real external network calls from decoy code paths. Entire app runs in an isolated Docker network for the demo. |
| **Realism** | Visual and copywriting quality must read as a genuine, modern fintech product — this is what makes the decoys credible. |
| **Performance** | Page loads < 1.5s on local/demo network; dashboard interactions feel instant (no visible spinner lag for a hackathon judge). |
| **Reliability** | Must survive repeated demo runs without manual DB fixes; reset script must be idempotent. |
| **Responsiveness** | Fully usable on a laptop screen during the live demo; mobile-responsive as a stretch goal. |
| **Accessibility** | Basic WCAG AA: color contrast, keyboard nav, form labels — see UIS. |
| **Portability** | Must build and run cleanly from a fresh clone using the instructions in the TDS, inside Antigravity, with no undocumented manual steps. |

---

## 8. Data Requirements

- All customers, accounts, transactions, and "leaked" internal records are **synthetically generated** (Faker-style), never sourced from real people or real companies.
- A deterministic seed script produces the same demo dataset every reset, so the live demo is reproducible.
- Decoy data (fake user tables, fake backup exports) must look plausible (realistic names, IDs, timestamps, amounts) but must be trivially distinguishable from the real dataset **in the code**, even though it's indistinguishable **in the UI**.

Full schema is specified in the companion **TDS**, Section 6.

---

## 9. Integration Contract with PhantomLayer

This site is a **producer**; PhantomLayer is the **consumer**. The only coupling should be the event webhook.

- Outbound: `POST {PHANTOMLAYER_INGEST_URL}` with a structured event on every decoy interaction (schema in TDS §7.3).
- Configurable via environment variable so the same build can point at a local PhantomLayer instance, a staging instance, or a mocked collector for standalone frontend development.
- If PhantomLayer is not reachable, the site must **still function normally** for demo rehearsal (graceful degradation, local console/log fallback).

---

## 10. Acceptance Criteria (Definition of Done for the hackathon demo)

- [ ] A judge can visit the public site, sign up, log in, see a believable dashboard, and make a transfer — with zero visible bugs.
- [ ] A team member can locate and interact with at least 3 distinct decoy surfaces (admin login, internal API, honeytoken) without those interactions touching real data.
- [ ] Every decoy interaction produces a visible event on the PhantomLayer side within a few seconds.
- [ ] The environment can be fully reset between demo runs with one command.
- [ ] The whole app can be built and started from a clean checkout using only the TDS instructions, inside Antigravity.
- [ ] No real secrets, no real external calls, no real user data exist anywhere in the repo or running containers.

---

## 11. Assumptions & Constraints

- Runs entirely inside an isolated lab/demo network — never exposed to the public internet during testing (per reference doc Section 17 safety note: "All testing should be performed against infrastructure we own or explicitly control").
- Demo domain: `meridianbank.test` (local-only, mapped via hosts file or local DNS — not a real, registered, publicly resolvable domain).
- Single fixed tenant — no onboarding-a-new-company flow needed on this site (that flow belongs to the PhantomLayer product itself, not its test fixture).
- Hackathon timebox — feature set in Section 6 is intentionally scoped to "one complete, believable path," matching the master document's MVP philosophy (Section 14).

## 12. Out of Scope

- Real payment rails, card issuing, or bank-grade compliance.
- PhantomLayer's own dashboard, risk engine, or AI summarization (separate workstream, separate repo/module).
- Multi-company/multi-tenant support on this site.
- Native mobile apps.

## 13. Risks

| Risk | Mitigation |
|---|---|
| Decoys look obviously fake next to the real app | Shared design system (UIS) enforced across both; decoys reuse real nav/shell components |
| Demo breaks live because of leftover attacker state | Deterministic reset/seed script (FR-22), rehearse resets before the actual demo |
| Team confuses "real" and "decoy" data paths during dev | Decoy code isolated into its own route group/module (see TDS §5), reviewed separately |
| PhantomLayer ingestion endpoint not ready when this site is | Mock collector endpoint / local console logging fallback so this site can be built independently |

## 14. Suggested Build Milestones (Hackathon Timeline)

| Phase | Deliverable |
|---|---|
| 1 | Repo scaffold in Antigravity, design tokens applied, public marketing pages, auth (signup/login) |
| 2 | Banking core: dashboard, accounts, transactions, transfer flow, synthetic data seeding |
| 3 | Decoy layer: admin login, internal APIs, honeytokens, fake DB viewer, all wired to design system |
| 4 | Event forwarding to PhantomLayer, demo control panel, reset script |
| 5 | Polish pass, rehearsal of the Section-17 demo script end-to-end, bug fixes |

## 15. References

- Source planning document: *Rags 2 Riches — AI-Powered Cybersecurity Deception Platform, Project Understanding & Build Document*
- Companion documents: **TDS_MeridianBank_TestSite.md** (technical design), **UIS_MeridianBank_TestSite.md** (UI specification)
