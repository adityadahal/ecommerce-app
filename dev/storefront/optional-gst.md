# Optional Manual GST Per Product

**Status:** Implemented
**Date:** 2026-04-11
**Module:** Storefront, Dashboard, API
**Type:** Enhancement

---

## What

Admin manually enters the GST dollar amount per product. Products can be GST-free ($0) or have a specific GST amount. At checkout, total GST = sum of per-item GST + delivery fee GST. Delivery fee still uses standard 10% AU GST calculation.

## Why

Not all products have GST. The previous auto-calculation (price/11) applied GST uniformly, which was incorrect for GST-free items.

## How It Works

1. Admin creates/edits product with a GST ($) input field
2. On create, GST auto-suggests from price/11; admin can override or set to 0
3. Product page shows "Incl. GST ($X.XX)" or "GST free"
4. Cart stores `gst` per item alongside `price`
5. Cart/checkout pages sum per-item GST + delivery GST
6. Checkout API sums `product.gst * quantity` for all items + `deliveryFee / 11`
7. GST is snapshotted to OrderItem at purchase time

## Files Changed

| File | Action | What Changed |
|------|--------|-------------|
| `prisma/schema.prisma` | Modified | Added `gst Float @default(0)` to Product and OrderItem |
| `prisma/seed.ts` | Modified | Added gst values to seed products, backfill for existing |
| `src/hooks/use-cart.ts` | Modified | Added `gst` to LocalCartItem, added `gstTotal` return |
| `src/app/(dashboard)/dashboard/products/new/page.tsx` | Modified | GST input field with auto-suggest |
| `src/app/(dashboard)/dashboard/products/[id]/page.tsx` | Modified | GST input field |
| `src/app/api/admin/products/route.ts` | Modified | Accept `gst` in POST |
| `src/app/api/admin/products/[id]/route.ts` | Modified | Accept `gst` in PUT |
| `src/components/store/product-card.tsx` | Modified | Added `gst` prop, pass to cart |
| `src/app/(storefront)/page.tsx` | Modified | Pass `gst` to ProductCard |
| `src/app/(storefront)/category/[slug]/page.tsx` | Modified | Pass `gst` to ProductCard |
| `src/app/(storefront)/search/page.tsx` | Modified | Pass `gst` to ProductCard |
| `src/app/(storefront)/product/[slug]/page.tsx` | Modified | Pass `gst`, show GST/GST-free |
| `src/app/(storefront)/product/[slug]/add-to-cart.tsx` | Modified | Added `gst` prop |
| `src/app/api/checkout/route.ts` | Modified | Sum per-item GST + delivery GST |
| `src/app/(storefront)/cart/page.tsx` | Modified | Use `gstTotal` from hook |
| `src/app/(storefront)/checkout/page.tsx` | Modified | Use `gstTotal` from hook |
| `src/components/store/order-summary.tsx` | Modified | Label "GST (included)" to "GST" |
| `src/lib/utils.ts` | Modified | Updated comment on calculateGST |

## Data Model

```prisma
// Added to Product
gst Float @default(0)

// Added to OrderItem
gst Float @default(0)
```

## Decisions Made

- GST is a dollar amount per unit, not a percentage
- Existing products backfilled with `price / 11` via seed script
- Delivery fee retains standard GST calculation (`deliveryFee / 11`)
- OrderItem snapshots GST at purchase time (like price)
- `(i.gst || 0)` in cart hook handles old localStorage carts without `gst`

## Edge Cases

- Existing localStorage carts without `gst` field: handled via `|| 0` fallback
- Product with `gst: 0`: shown as "GST free" on product page, contributes $0 to total
- Floating point rounding: `parseFloat(gst.toFixed(2))` in checkout API

## Change Log

| Date | What Changed |
|------|-------------|
| 2026-04-11 | Initial implementation |
