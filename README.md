# Ecom Profit — Subscription SaaS

A commercial subscription wrapper around the **Ecom Profit** marketplace P&L tool. Sellers
register, subscribe (Monthly / Quarterly / Annual), pay via **Stripe or Razorpay**, and unlock the
browser-based analytics tool. GST-compliant invoices, renewal/expiry management, email
notifications, a user dashboard, and an admin panel are all included.

The analytics tool itself (`private/tool/index.html`) runs entirely in the browser — customer sales
files never touch the server. It is served only to authenticated users with an active subscription.

## Tech stack

- **Next.js 16** (App Router, TypeScript) — static marketing pages + server API routes
- **PostgreSQL + Prisma** (Neon / Supabase recommended)
- **Auth.js v5** — email/password, email verification, argon2id hashing, JWT sessions, RBAC
- **Stripe + Razorpay** — webhook-driven, signature-verified activation
- **Nodemailer (SMTP)** — transactional email (swappable transport in `src/lib/email/mailer.ts`)
- **pdfkit** — GST tax invoices generated server-side

## Local setup

```bash
npm install
cp .env.example .env.local          # fill in real values
npx prisma migrate deploy           # or: npx prisma db push
npm run db:seed                     # seed the three plans
npm run dev
```

Open http://localhost:3000.

> The first registered email that matches `ADMIN_EMAILS` is granted the ADMIN role and can reach
> `/admin`.

## Environment variables

See [`.env.example`](.env.example). Required to boot: `DATABASE_URL`, `AUTH_SECRET`. Payments and
email are optional locally (the app runs in a degraded mode and logs emails to the console). Seller
GST fields drive the invoice content.

## Deployment (Vercel + Neon/Supabase)

1. Create a Postgres database; set `DATABASE_URL` (pooled) and `DIRECT_URL` (direct).
2. Set all env vars from `.env.example` in the Vercel project.
3. Deploy. `postinstall` runs `prisma generate`; run `npm run db:migrate` + `npm run db:seed` once
   against the database (e.g. from CI or locally pointed at prod).
4. **Webhooks** — register these endpoints in each dashboard:
   - Stripe: `https://YOUR_DOMAIN/api/webhooks/stripe` (event `checkout.session.completed`) → set
     `STRIPE_WEBHOOK_SECRET`.
   - Razorpay: `https://YOUR_DOMAIN/api/webhooks/razorpay` (events `payment.captured`,
     `order.paid`) → set `RAZORPAY_WEBHOOK_SECRET`.
5. **Cron** — [`vercel.json`](vercel.json) schedules a daily call to `/api/cron/subscriptions`
   (expiry transitions + renewal reminders). Vercel sends `Authorization: Bearer $CRON_SECRET`, so
   set `CRON_SECRET`.

## How payment activation works

Activation is **never trusted from the client**. The flow:

1. `/api/checkout` creates a `Payment` (CREATED) + `Subscription` and a gateway order/session.
2. The gateway redirects (Stripe) or opens checkout (Razorpay).
3. The **webhook** (source of truth) fires → signature verified → `activatePaidPayment()` marks the
   payment PAID, extends the subscription window, and issues a sequential GST invoice — all in one
   idempotent transaction. The invoice PDF is emailed.
4. For Razorpay, the client callback also hits `/api/razorpay/verify` (HMAC-verified) for instant
   activation. Both paths are idempotent, so double-firing is safe.

## Security model

- Per-request **CSP with nonce + `strict-dynamic`** (set in `src/middleware.ts`); HSTS,
  `X-Frame-Options: DENY`, `nosniff`, Referrer-Policy, Permissions-Policy in `next.config.ts`.
- The gated tool is served from **outside `/public`** via `/api/tool`, gated on an active
  subscription, with its own scoped CSP and `no-store`.
- argon2id password hashing; email verification required before login; per-email login throttling.
- Webhook signature verification (Stripe `constructEvent`, Razorpay timing-safe HMAC).
- Same-origin checks + SameSite cookies on state-changing routes; zod validation on all input.
- Rate limiting (Postgres-backed) on register/checkout/login; audit log of sensitive actions.
- RBAC enforced in middleware **and** re-checked in server components / route handlers.

## Swapping the analytics tool

Replace `private/tool/index.html` with a new build. No app changes are needed — it is streamed
verbatim to active subscribers. Adjust the tool's scoped CSP in `src/app/api/tool/route.ts` if the
new version loads from different origins.

## Project layout

```
src/
  app/
    (dashboard)/            authed area: dashboard, billing, app, account, admin
    api/                    auth, register, checkout, webhooks, tool, invoices, cron, admin
    page.tsx, pricing, terms, privacy, refund
  components/               marketing + app UI
  lib/                      auth, payments, invoice, email, money/GST, ratelimit, audit
prisma/                     schema, migrations, seed
private/tool/index.html     the gated analytics tool (not public)
```
