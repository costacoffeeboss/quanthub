# Paywall & accounts — setup / launch checklist

The code is in. Nothing is live until the env vars are set **and**
`VITE_PAYWALL_ENABLED=true`. Until then the site behaves exactly as before:
no sign-in UI, everything unlocked.

## Architecture (recap)

- **Supabase** — Auth (magic link + Google) + Postgres `profiles` table (RLS).
- **Stripe Checkout** — subscriptions (monthly/annual) + one-off passes (week/month) + Customer Portal.
- **Netlify Functions** — hold the secret keys: `create-checkout-session`, `create-portal-session`, `stripe-webhook`.
- Entitlement = **active subscription OR unexpired pass**, written to `profiles` by the webhook, read by the browser.

---

## 1. Database (~2 min)

Open the Supabase **SQL editor** and run [`supabase/migrations/0001_profiles.sql`](../supabase/migrations/0001_profiles.sql).
Creates the `profiles` table, RLS policies, the new-user trigger, and backfills existing users.

## 2. Stripe products & prices (~5 min, test mode)

Create **one product** ("Quant Interview Pro") with **four prices**. Copy each `price_…` id:

| Plan | Type | Env var |
|---|---|---|
| Monthly | Recurring · monthly | `STRIPE_PRICE_MONTHLY` |
| Annual | Recurring · yearly | `STRIPE_PRICE_ANNUAL` |
| 1-week pass | One-time | `STRIPE_PRICE_WEEK` |
| 1-month pass | One-time | `STRIPE_PRICE_MONTH` |

> The display prices in `src/lib/premium.tsx` (`PLANS`) are cosmetic — update those
> strings to match whatever you set here so the paywall doesn't lie.

## 3. Netlify environment variables

Site settings → Environment variables. **Client (public):**

```
VITE_SUPABASE_URL=https://ymplbgcuwgqjkxmfenwj.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_…        # already have this
VITE_PAYWALL_ENABLED=false                      # keep false until step 6
```

**Server (secret — Functions only):**

```
SUPABASE_URL=https://ymplbgcuwgqjkxmfenwj.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sb_secret_…           # Supabase → API keys → secret
STRIPE_SECRET_KEY=sk_test_…
STRIPE_WEBHOOK_SECRET=whsec_…                    # from step 4
SITE_URL=https://quantinterview.netlify.app
STRIPE_PRICE_MONTHLY=price_…
STRIPE_PRICE_ANNUAL=price_…
STRIPE_PRICE_WEEK=price_…
STRIPE_PRICE_MONTH=price_…
```

## 4. Stripe webhook

Stripe Dashboard → Developers → Webhooks → Add endpoint:

- URL: `https://quantinterview.netlify.app/.netlify/functions/stripe-webhook`
- Events: `checkout.session.completed`, `customer.subscription.created`,
  `customer.subscription.updated`, `customer.subscription.deleted`
- Copy the **Signing secret** (`whsec_…`) into `STRIPE_WEBHOOK_SECRET`.

Local testing: `stripe listen --forward-to localhost:8888/.netlify/functions/stripe-webhook`
(run the app with `netlify dev`).

## 5. Google OAuth (optional, deferred)

Google Cloud Console → create an OAuth client → paste Client ID + Secret into
Supabase → Auth → Providers → Google. Magic link works without this.

## 6. Go live

1. Local smoke test: `.env.local` with `VITE_PAYWALL_ENABLED=true`, sign in, pay with Stripe test card `4242 4242 4242 4242`, confirm Pro unlocks.
2. Switch Stripe to **live**, swap to live keys, re-register the live webhook.
3. Set `VITE_PAYWALL_ENABLED=true` on Netlify and redeploy. Done.

---

## Known limitation (worth a follow-up)

This is a static SPA, so premium **content** still ships in the JS bundle — the
gates are a solid UX/most-users boundary, not a hard wall against someone reading
the bundle. To make it airtight later, move the premium content/data behind
authenticated Supabase queries or a function so it's only delivered to entitled
users. Fine for launch; flagging it honestly.
