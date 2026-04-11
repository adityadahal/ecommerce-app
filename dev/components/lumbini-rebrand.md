# Lumbini Meat & Grocery — Full Rebrand

**Status:** Implemented
**Date:** 2026-04-11
**Module:** components, storefront, dashboard, auth, lib
**Type:** Enhancement (visual rebrand)

---

## What

Rebranded the entire application from "FreshMart" (green theme) to "Lumbini Meat & Grocery" (maroon/gold theme). Replaced all logos, favicons, color themes, metadata, and text references across every module.

## Why

The business is named Lumbini Meat & Grocery. The logo features crossed Nepali khukuri knives in a laurel wreath with chicken and cow silhouettes, using Classic Maroon (#800000) and Golden Orange (#DFA031) as brand colors.

## How It Works

1. SVG logos created: full logo (icon + text), icon-only (dashboard/favicon), and simplified favicon
2. Mantine theme updated with custom `maroon` and `gold` color palettes (10 shades each)
3. `primaryColor` set to `maroon` so all default Mantine components use maroon
4. Conversion CTAs (Add to Cart, Checkout, Pay) use `color="gold"` to stand out
5. General buttons (Save, Submit, Login) use `color="maroon"` (primary)
6. All "FreshMart" text replaced with "Lumbini Meat & Grocery" across UI, metadata, emails, and seed data
7. Favicon set via Next.js metadata in root layout

## Files Changed

| File | Action | What Changed |
|------|--------|-------------|
| `public/logo.svg` | Created | Full logo SVG (icon + "LUMBINI MEAT & GROCERY" text) |
| `public/logo-icon.svg` | Created | Icon-only SVG (khukuri knives, wreath, animal heads) |
| `public/favicon.svg` | Created | Simplified favicon SVG for small sizes |
| `src/components/providers.tsx` | Modified | Added maroon/gold color palettes, primaryColor → maroon |
| `src/components/layout/header.tsx` | Modified | Logo replaced, announcement bar gradient → maroon, nav hover → maroon |
| `src/components/layout/footer.tsx` | Modified | Logo + brand name, email, copyright updated |
| `src/app/(dashboard)/layout.tsx` | Modified | Icon-only logo, NavLink color → maroon, badge → maroon |
| `src/app/(auth)/layout.tsx` | Modified | Gradient → maroon, logo + brand text updated |
| `src/app/(auth)/login/page.tsx` | Modified | Logo, placeholder email, button color → maroon |
| `src/app/(auth)/register/page.tsx` | Modified | Logo, brand text, button color → maroon |
| `src/app/layout.tsx` | Modified | Metadata title/description/keywords, favicon icons |
| `src/app/robots.ts` | Modified | Domain → lumbinimeat.com.au |
| `src/app/sitemap.ts` | Modified | Domain → lumbinimeat.com.au |
| `src/lib/email.ts` | Modified | Sender name, domain, team name |
| `prisma/seed.ts` | Modified | Admin email domain |
| `src/components/store/product-card.tsx` | Modified | Add to Cart → gold, price → maroon.7, notification → gold |
| `src/app/(storefront)/product/[slug]/add-to-cart.tsx` | Modified | Add to Cart → gold, notification → gold |
| `src/app/(storefront)/product/[slug]/page.tsx` | Modified | Breadcrumbs, price, category text → maroon |
| `src/app/(storefront)/page.tsx` | Modified | Hero gradient, CTAs, feature icons → maroon |
| `src/app/(storefront)/cart/page.tsx` | Modified | Checkout → gold, others → maroon |
| `src/app/(storefront)/checkout/page.tsx` | Modified | Pay button → gold, others → maroon |
| `src/app/(storefront)/track/page.tsx` | Modified | Theme icons, buttons, progress → maroon |
| `src/app/(storefront)/order/success/page.tsx` | Modified | Theme icons, badges → maroon |
| `src/app/(storefront)/category/[slug]/page.tsx` | Modified | Breadcrumb link, subcategory badge → maroon |
| `src/app/(storefront)/category/[slug]/filters.tsx` | Modified | Checkbox → maroon |
| `src/app/(storefront)/search/page.tsx` | Modified | Metadata title → Lumbini |
| `src/app/(storefront)/account/page.tsx` | Modified | Save button, notifications → maroon |
| `src/app/(storefront)/account/addresses/page.tsx` | Modified | Buttons, notifications, badge → maroon |
| `src/app/(storefront)/account/orders/page.tsx` | Modified | Link color → maroon |
| `src/app/(dashboard)/dashboard/page.tsx` | Modified | Stat card, buttons → maroon |
| `src/app/(dashboard)/dashboard/products/page.tsx` | Modified | Buttons, notifications → maroon |
| `src/app/(dashboard)/dashboard/products/new/page.tsx` | Modified | Button, notification → maroon |
| `src/app/(dashboard)/dashboard/products/[id]/page.tsx` | Modified | Button, notifications → maroon |
| `src/app/(dashboard)/dashboard/orders/page.tsx` | Modified | Notifications, price text → maroon |
| `src/app/(dashboard)/dashboard/categories/page.tsx` | Modified | Button, notification → maroon |
| `src/app/(dashboard)/dashboard/delivery-zones/page.tsx` | Modified | Button, notification → maroon |
| `src/components/dashboard/product-modal.tsx` | Modified | Button, notifications → maroon |
| `src/components/dashboard/category-modal.tsx` | Modified | Button, notification → maroon |
| `src/components/dashboard/delivery-zone-modal.tsx` | Modified | Button, notification → maroon |
| `src/components/store/order-summary.tsx` | Modified | Free delivery text, alert → maroon |
| `src/app/not-found.tsx` | Modified | Button → maroon |
| `src/app/error.tsx` | Modified | Button → maroon |
| `CLAUDE.md` | Modified | Brand name, colors, admin email, button conventions |

## Data Model

No schema changes.

## API Endpoints

No API changes.

## Decisions Made

- **Button color strategy:** Gold (#DFA031) for conversion CTAs (Add to Cart, Checkout, Pay) creates visual hierarchy — the money-action stands out against the maroon theme. General primary buttons use maroon.
- **Semantic colors preserved:** "In Stock" badges stay green, "Delivered" status stays green, refund confirmation alert stays green. These are UX conventions that shouldn't change with branding.
- **SVG logos created by hand** — simplified but recognizable representations of the original logo with crossed khukuri knives, laurel wreath, and animal silhouettes.
- **Custom Mantine color palettes** (maroon/gold) with 10 shades each, enabling light/filled/outline variants to work correctly throughout the app.

## Edge Cases

- SVG favicon degrades gracefully at 16x16 — simplified version with just crossed blades and gold dots
- Maroon text on white backgrounds maintains good contrast (WCAG compliant)
- Gold buttons use white text for readability
- Dark mode not affected (app uses light scheme only)

## Change Log

| Date | What Changed |
|------|-------------|
| 2026-04-11 | Initial implementation — full rebrand from FreshMart to Lumbini Meat & Grocery |
