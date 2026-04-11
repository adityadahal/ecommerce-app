# Delivery Zone Day-Based Scheduling

**Status:** Implemented
**Date:** 2026-04-11
**Module:** Storefront, Dashboard, API
**Type:** Enhancement

---

## What

Admin configures delivery zones with available delivery days (Mon–Sun). At checkout, customers select a zone from a dropdown — the delivery fee auto-calculates from the zone, and the nearest estimated delivery day is shown. Replaces the old hardcoded delivery slots.

## Why

Delivery availability varies by zone. Hardcoded time slots and fees didn't reflect real delivery schedules or zone-specific pricing.

## How It Works

1. Admin creates/edits a delivery zone with day-of-week checkboxes (e.g., Mon, Wed, Fri)
2. Customer visits checkout, zones are fetched from public API (`GET /api/delivery-zones`)
3. Customer selects a zone from a dropdown
4. Frontend computes the nearest available delivery day (minimum 1 day ahead, never today)
5. Delivery fee comes from the zone (or $0 if subtotal meets `minOrderForFree`)
6. Estimated delivery date shown as alert + in order summary
7. On submit, checkout API validates the zone, computes fee + estimated date server-side
8. `deliverySlot` field stores the formatted estimated delivery date string
9. Success page and track page display the estimated delivery day

## Files Changed

| File | Action | What Changed |
|------|--------|-------------|
| `prisma/schema.prisma` | Modified | Added `availableDays String[]` to DeliveryZone, added `deliveryZoneId` + relation to Order |
| `src/lib/constants.ts` | Modified | Added `getNextDeliveryDate()` and `formatDeliveryDate()` helpers |
| `src/app/api/delivery-zones/route.ts` | Created | Public GET endpoint returning active zones with available days |
| `src/app/api/admin/delivery-zones/route.ts` | Modified | POST accepts `availableDays` |
| `src/app/api/admin/delivery-zones/[id]/route.ts` | Modified | PUT accepts `availableDays` |
| `src/components/dashboard/delivery-zone-modal.tsx` | Modified | Added Mon–Sun checkboxes |
| `src/app/(dashboard)/dashboard/delivery-zones/page.tsx` | Modified | Added "Delivery Days" column with badges |
| `src/app/(storefront)/checkout/page.tsx` | Modified | Replaced delivery slot picker with zone dropdown + estimated date alert |
| `src/app/api/checkout/route.ts` | Modified | Calculates fee from zone, computes estimated date server-side |
| `src/app/(storefront)/order/success/page.tsx` | Modified | Shows estimated delivery day with calendar icon |
| `src/app/(storefront)/track/page.tsx` | Modified | Shows estimated delivery day with calendar icon |
| `prisma/seed.ts` | Modified | Added `availableDays` to seed zones |

## Data Model

```prisma
// Added to DeliveryZone
availableDays   String[]

// Added to Order
deliveryZoneId  String?
deliveryZone    DeliveryZone? @relation(fields: [deliveryZoneId], references: [id])
```

## API Endpoints

### `GET /api/delivery-zones` (new, public)

- **Auth:** Not required
- **Response:** `[{ id, name, deliveryFee, minOrderForFree, availableDays }]`
- **Filter:** Only active zones with at least one available day

### `POST /api/checkout` (modified)

- **New field:** `deliveryZoneId` (required, replaces `deliverySlot`)
- **Removed:** `deliverySlot` no longer sent from frontend
- **Behavior:** Looks up zone, calculates fee from zone threshold, computes estimated delivery day

## Decisions Made

- `deliverySlot` field repurposed to store the formatted estimated delivery date string (e.g., "Wednesday, 16 April 2026") — avoids schema migration
- Estimated date is always at least 1 day ahead (never same-day delivery)
- Zones with no available days are hidden from checkout dropdown
- Fee calculation happens both client-side (for UX) and server-side (for validation)

## Edge Cases

- Zone with no available days → hidden from checkout dropdown
- Today is a delivery day → shows next week's same day (minimum 1 day ahead)
- Order meets free delivery threshold → fee becomes $0
- Zone deleted after order placed → order keeps delivery day string, relation is optional
- No active zones exist → dropdown shows only "-- Select a zone --", can't submit

## Change Log

| Date | What Changed |
|------|-------------|
| 2026-04-11 | Initial implementation |
