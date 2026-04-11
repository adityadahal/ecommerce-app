# Lumbini Meat & Grocery — E-Commerce App

## Quick Reference
- **Framework:** Next.js 16 (App Router) + TypeScript + Tailwind CSS v4
- **UI Library:** Mantine UI v8 (@mantine/core, @mantine/notifications)
- **DB:** PostgreSQL 17 via Docker (port 5433), Prisma 6 ORM
- **Auth:** NextAuth.js v5 beta — ADMIN ONLY (customers don't need accounts)
- **Payments:** Stripe Checkout Sessions (AUD) — test keys configured
- **Email:** Resend (not yet configured)
- **Images:** Cloudinary (not yet configured)

## Business Model
- **No customer login required** — guests browse, add to cart, and checkout directly
- Orders identified by random order number (MVM-XXXXX-XXXX)
- Customers track orders via /track page using order number
- Auth/login is only for ADMIN users to access the dashboard

## Brand & Colors
- **Brand:** Lumbini Meat & Grocery
- **Primary (maroon):** `#800000` — general buttons, nav, badges, theme accents
- **Accent (gold):** `#DFA031` — conversion CTAs (Add to Cart, Checkout, Pay)
- **Logo files:** `public/logo.svg` (full), `public/logo-icon.svg` (icon-only), `public/favicon.svg`
- Custom Mantine color palettes: `maroon` and `gold` defined in `src/components/providers.tsx`

## UI Components (Mantine v8)
- Import from `@mantine/core` — NOT from `@/components/ui/` (old, unused)
- Button: `color="maroon"` primary, `color="gold"` conversion CTAs, `variant="outline"` secondary, `variant="subtle"` ghost
- TextInput, PasswordInput, NativeSelect, Textarea — use `e.currentTarget.value`
- Badge: semantic colors — green/red/yellow/blue/gray; brand badge: `color="maroon"`
- Notifications: `notifications.show({ message, color })` from `@mantine/notifications`
- Card: `<Card shadow="sm" padding="lg" radius="md" withBorder>`

## Local Dev
```bash
docker start mvm-postgres          # Start DB
npm run dev                         # Start app at localhost:3000
npx prisma studio                   # DB GUI at localhost:5555
npx prisma db push                  # Push schema changes
npm run db:seed                     # Seed sample data
```

## DB Connection
- Host: localhost:5433 | User: postgres | Pass: postgres123 | DB: mvm

## Admin Login
- admin@lumbinimeat.com.au / admin123

## Stripe Test Cards
- Success: 4242 4242 4242 4242 (any future expiry, any CVC)
- Decline: 4000 0000 0000 0002
- 3D Secure: 4000 0025 0000 3155

## Project Structure
```
src/
├── app/
│   ├── (storefront)/    # Public: home, category, product, search, cart, checkout, track order
│   ├── (auth)/          # Login, register (admin only)
│   ├── (dashboard)/     # Admin panel (ADMIN role only)
│   └── api/             # API routes + Stripe webhooks
├── components/
│   ├── ui/              # OLD — unused. Do NOT import from here
│   ├── layout/          # Header, Footer
│   └── store/           # ProductCard, LiveSearch
├── hooks/               # useLocalCart (per-user via useSyncExternalStore)
├── lib/                 # db.ts, auth.ts, stripe.ts, utils.ts, email.ts
└── types/               # TypeScript types + next-auth augmentation
```

## Key Patterns
- **No customer auth** — checkout collects name/email/phone, Order.userId is optional
- All server-rendered pages use `export const dynamic = "force-dynamic"` to avoid stale cache
- Cart uses `useSyncExternalStore` + localStorage, keyed per user (`mvm-cart-guest` for guests)
- Stripe client is lazy-initialized (proxy) to avoid build-time errors when keys are missing
- Middleware ONLY protects /dashboard (admin)
- Live search with 300ms debounce in header
- Payment verification: webhook + success page both verify Stripe payment (fallback for local dev)
- GST = price / 11 (10% included in AU prices)
- Free delivery over $75, default fee $9.95

## Prisma
- Schema: prisma/schema.prisma
- Use Prisma 6 (NOT 7 — v7 removed `url` from schema.prisma)
- Always run `npx prisma generate` after schema changes
- Order model: userId optional + customerName/customerEmail/customerPhone for guests

## Common Commands
```bash
npx tsc --noEmit                    # Type check
docker exec mvm-postgres psql -U postgres -d mvm -c "SQL"  # Run SQL
```

## Not Yet Configured (needs API keys in .env)
- Cloudinary (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET)
- Resend (RESEND_API_KEY)
- Google OAuth (AUTH_GOOGLE_ID, AUTH_GOOGLE_SECRET)
- Stripe Webhook Secret (STRIPE_WEBHOOK_SECRET) — needed for production webhooks
