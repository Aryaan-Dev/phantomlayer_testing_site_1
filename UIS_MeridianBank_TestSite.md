# UI Specification (UIS)
## MeridianBank — PhantomLayer Test Customer Website

| | |
|---|---|
| **Document type** | UI / Design Specification |
| **Companion to** | PRD_MeridianBank_TestSite.md, TDS_MeridianBank_TestSite.md |
| **Framework target** | Next.js + Tailwind CSS |
| **Status** | Draft v1.0 |

---

## 1. Purpose

This document defines the visual language, components, and page-level layouts for MeridianBank so the site reads as a **credible, modern digital-banking product** — which is what makes both the real banking flows and the embedded decoys convincing (PRD FR-16). It is the single source of truth Antigravity should follow for styling and layout while scaffolding the repo defined in the TDS.

---

## 2. Design Principles

1. **Trustworthy over trendy.** Fintech users (and attackers evaluating a target) expect calm, confident, slightly conservative design — not a flashy consumer app. Avoid anything that looks like a hackathon demo.
2. **One design system, two zones.** The real banking UI and the decoy admin/internal UI must share the exact same primitives (buttons, cards, nav, type) — a visual seam is what would give the decoy away.
3. **Clarity in data-heavy views.** Balances, transactions, and fake internal tables must be scannable at a glance — this is a numbers-first product.
4. **Restraint.** Minimal color, generous whitespace, one accent color used sparingly for actions and status.

---

## 3. Brand Identity

| Element | Spec |
|---|---|
| **Product name** | MeridianBank |
| **Tagline** | "Banking, simplified." |
| **Demo domain** | `meridianbank.test` (local-only) |
| **Logo concept** | Wordmark-first: "Meridian" in Semibold + "Bank" in Regular, or a simple geometric mark (a horizon-line arc, referencing "meridian") — no need for a complex icon; a clean wordmark is enough for the MVP |
| **Voice** | Clear, plain-English, reassuring. No jargon. Short sentences. ("Send money in seconds." not "Leverage instant P2P disbursement.") |

---

## 4. Color Tokens

| Token | Hex | Usage |
|---|---|---|
| `primary-900` | `#0B1E3D` | Headings, nav background (dark), primary buttons |
| `primary-700` | `#14315C` | Hover states on primary |
| `primary-500` | `#3B82F6` | Links, focus rings, active nav item, chart accents |
| `accent-emerald` | `#10B981` | Positive amounts, success states, "credit" transactions |
| `accent-red` | `#EF4444` | Negative amounts, errors, "debit" emphasis where relevant |
| `accent-amber` | `#F59E0B` | Warnings, pending states |
| `neutral-50` | `#F8FAFC` | App background |
| `neutral-100` | `#F1F5F9` | Card/section backgrounds |
| `neutral-200` | `#E2E8F0` | Borders, dividers |
| `neutral-500` | `#64748B` | Secondary text |
| `neutral-900` | `#0F172A` | Body text |
| `white` | `#FFFFFF` | Card surfaces, nav (light mode) |

**Dark mode:** optional stretch goal — invert `neutral-50`/`neutral-900`, keep `primary-500` and `accent-*` tokens as-is for consistency.

Tailwind config should map these directly to `theme.extend.colors` (e.g. `primary.900`, `accent.emerald`) so components reference semantic names, not raw hex.

---

## 5. Typography

| Role | Font | Weight | Notes |
|---|---|---|---|
| Headings | **Sora** (or Manrope as fallback) | 600–700 | Slightly geometric, modern-fintech feel |
| Body / UI | **Inter** | 400–500 | Highly legible at small sizes, standard for data-dense UI |
| Numeric/tabular (balances, tables) | **Inter**, `font-variant-numeric: tabular-nums` | 500–600 | Keeps columns of numbers aligned |

**Scale:**

| Token | Size / Line-height | Use |
|---|---|---|
| `display` | 40px / 48px | Landing page hero only |
| `h1` | 32px / 40px | Page titles |
| `h2` | 24px / 32px | Section headers |
| `h3` | 18px / 28px | Card titles |
| `body` | 15px / 24px | Default text |
| `small` | 13px / 20px | Meta text, labels, timestamps |

---

## 6. Spacing, Radius, Shadow

- **Spacing scale:** Tailwind default (4px base unit) — use `4, 8, 12, 16, 24, 32, 48, 64`.
- **Radius:** `rounded-xl` (12px) for cards, `rounded-lg` (8px) for buttons/inputs, `rounded-full` for avatars/badges.
- **Shadow:** one subtle elevation only — `shadow-sm` for cards on `neutral-50` background. Avoid heavy drop shadows; keep it flat and confident.

---

## 7. Core Components

| Component | Spec |
|---|---|
| **Button — Primary** | `primary-900` bg, white text, `rounded-lg`, hover → `primary-700` |
| **Button — Secondary** | white bg, `neutral-200` border, `primary-900` text |
| **Button — Danger** (e.g. "Close account") | `accent-red` text/border, white bg |
| **Input** | `neutral-200` border, `rounded-lg`, focus ring `primary-500`, label above field, error text in `accent-red` below |
| **Card** | white surface, `neutral-200` border or `shadow-sm`, `rounded-xl`, `p-6` |
| **Balance card** | Large numeric (`h1` size, tabular-nums), account type label above, small trend/status line below |
| **Transaction row** | Left: counterparty + memo (body/small); Right: amount (`accent-emerald` if credit, `neutral-900` or `accent-red` if debit), timestamp in `small`/`neutral-500` |
| **Top nav (real app, authenticated)** | `primary-900` background, white text, logo left, links center/right (Dashboard, Accounts, Transfer, Profile), avatar/logout right |
| **Public nav (marketing)** | white background, `neutral-900` text, logo left, Login/Sign up right |
| **Table** (used for decoy "internal users" / "db console" views) | Standard striped or bordered table, `neutral-100` header row, monospace or tabular-nums for IDs/amounts — styled with the **same** table component the real transaction history might reuse, for visual consistency |
| **Alert / Toast** | Success (`accent-emerald` left border), Error (`accent-red`), Warning (`accent-amber`) — top-right toast, auto-dismiss |
| **Badge** | Small pill, used for account type ("Checking"/"Savings") or fake role tags in decoy admin view ("admin"/"ops") |
| **Modal** | Centered, `rounded-xl`, `neutral-900/50` overlay — used for transfer confirmation |

> **Decoy zone reuses this exact component set** (Top nav, Card, Table, Badge, Button) — no separate "decoy design system." Only the copy/content and route differ.

---

## 8. Page-by-Page Specification

### 8.1 Landing Page (`/`)
- Hero: headline ("Banking, simplified."), subtext, primary CTA ("Open an account"), secondary CTA ("Log in").
- Three-up feature blurbs: Checking, Savings, Instant Transfers — icon + short copy each.
- Simple footer: About, Support, Privacy, Terms, © MeridianBank.

### 8.2 Sign Up (`/signup`)
- Centered card, single-column form: full name, email, password, confirm password.
- Primary button "Create account," link to Login below.

### 8.3 Login (`/login`)
- Centered card: email, password, "Forgot password?" link, primary button "Log in."
- Same shell/card pattern as Sign Up for consistency.

### 8.4 Dashboard (`/dashboard`) — authenticated
- Top nav (authenticated variant).
- Row of **balance cards** (Checking, Savings).
- "Recent transactions" card below — last 5 rows, "View all" link to account detail.
- Quick actions row: "Transfer," "View statements" (stub), "Support" (stub).

### 8.5 Account Detail (`/accounts/[id]`)
- Header: account type + current balance.
- Full transaction table with search/filter bar and pagination.

### 8.6 Transfer (`/transfer`)
- Step form: From account (select), To (own account or "recipient" text field), Amount, Memo → Review step (modal) → Confirmation state.

### 8.7 Profile (`/profile`)
- Editable name/email, change-password section, linked (fake) card display as a styled card component.

### 8.8 Support (`/support`) & About (`/about`)
- Simple static content pages, same public-nav shell.

### 8.9 404 / Error page
- On-brand, centered message, link back to dashboard/home.

### 8.10 Decoy — Admin Login (`/admin` or `/internal-ops`)
- **Deliberately plain/internal-tool aesthetic** *within* the same design system: same fonts/colors, but a sparser layout (no marketing chrome, just a centered login card with a generic internal-sounding label, e.g. "MeridianBank Internal Portal"). Should feel like a real but unglamorous ops tool — believable, not flashy.

### 8.11 Decoy — DB / Ops Console (`/internal/db-console`)
- Looks like an internal data-browsing tool: left sidebar list of "tables" (`decoy_users`, `decoy_backups`, `decoy_customers_export`), main panel shows the styled **Table** component with fake rows. Uses the same Table/Badge components as the real transaction history.

### 8.12 Demo Control Panel (`/demo-control`) — internal/operator only, not part of the shown demo
- Minimal utilitarian screen: "Reset environment," "Re-seed data," "Toggle attack simulation" buttons, gated behind a simple passcode field. Doesn't need to match the polished brand — this is a backstage tool for the team, not for judges or the "attacker."

---

## 9. Navigation / Sitemap

```
/                    (public landing)
├─ /about
├─ /support
├─ /signup
├─ /login
├─ /forgot-password
│
├─ /dashboard         (auth required)
├─ /accounts/[id]      (auth required)
├─ /transfer           (auth required)
├─ /profile            (auth required)
│
├─ /admin              (decoy)
├─ /internal-ops       (decoy)
├─ /internal/db-console (decoy)
├─ /api/internal/*      (decoy APIs)
│
└─ /demo-control        (operator only)
```

---

## 10. Responsive Behavior

| Breakpoint | Target |
|---|---|
| `sm` (< 640px) | Single-column stacking for all cards; nav collapses to hamburger |
| `md` (640–1024px) | Two-column balance cards, table remains scrollable horizontally if needed |
| `lg` (1024px+) | Primary target for the live demo (laptop screen) — full multi-column dashboard layout |

Mobile responsiveness is a stretch goal per the PRD; **desktop/laptop layout is the priority** since that's what judges will see.

---

## 11. Accessibility

- Minimum 4.5:1 contrast for body text against its background (verify `neutral-900` on `neutral-50`, and white text on `primary-900`).
- All form inputs have visible `<label>`s (not placeholder-only).
- Visible focus rings (`primary-500`, 2px) on all interactive elements — important since keyboard navigation may be used during demo/testing.
- Buttons and links have descriptive text (no bare "Click here").

---

## 12. Interaction & State Patterns

| State | Pattern |
|---|---|
| Loading | Skeleton blocks for balance cards/tables rather than spinners, where feasible |
| Empty | Friendly empty-state text ("No transactions yet") with an icon, never a blank void |
| Error (form) | Inline red text under the field + toast for network-level errors |
| Success | Green toast, auto-dismiss after ~3s (e.g. "Transfer complete") |
| Decoy interactions | Behave exactly like a normal form/page from the user's point of view — no visual "gotcha," no warning banner. Believability is the entire point. |

---

## 13. Content / Voice Guidelines

- Plain English, short sentences, no financial jargon in the real app.
- Decoy/internal pages should sound like **internal tooling copy** — terse, slightly bureaucratic ("Export queued.", "User list — internal use only.") — genuinely boring, which is exactly what makes it credible.
- Never break the fourth wall anywhere in the UI (no "this is a fake page" text, no "honeypot" language visible to a user/attacker).

---

## 14. Assets Needed

| Asset | Notes |
|---|---|
| Wordmark logo (SVG) | Simple text-based mark per §3; can be built directly in code (styled text), no external image required for MVP |
| Favicon | Simple monogram "M" on `primary-900`, generated as a static asset |
| Illustrations/icons | Use a lightweight icon set (e.g. Lucide/Heroicons, MIT-licensed, works cleanly with React) for feature blurbs and nav icons — no custom illustration needed for the hackathon timebox |

---

## 15. Tailwind Config Reference (for scaffolding)

```js
// tailwind.config.js (excerpt)
theme: {
  extend: {
    colors: {
      primary: { 900: '#0B1E3D', 700: '#14315C', 500: '#3B82F6' },
      accent: { emerald: '#10B981', red: '#EF4444', amber: '#F59E0B' },
      neutral: { 50: '#F8FAFC', 100: '#F1F5F9', 200: '#E2E8F0', 500: '#64748B', 900: '#0F172A' },
    },
    fontFamily: {
      heading: ['Sora', 'sans-serif'],
      sans: ['Inter', 'sans-serif'],
    },
    borderRadius: {
      xl: '12px',
      lg: '8px',
    },
  },
}
```

---

## 16. References

- PRD_MeridianBank_TestSite.md
- TDS_MeridianBank_TestSite.md
- Source planning document: *Rags 2 Riches — AI-Powered Cybersecurity Deception Platform, Project Understanding & Build Document*
