# Refund Process — Order Cancellation

**Status:** Implemented
**Date:** 5 April 2026
**Author:** Aditya Kishor Dahal

---

## 1. Overview

When an admin cancels a paid order, a full refund is automatically issued via Stripe. The customer sees refund status on the track order page.

### PCI-DSS Compliance

Full card numbers are **never accessible** from Stripe or any payment processor (PCI-DSS legal requirement). We store:
- Card brand (e.g., "visa", "mastercard")
- Last 4 digits (e.g., "4242")
- Stripe Payment Intent ID (used to process refunds)

Refunds are processed using the **Payment Intent ID**. Stripe routes the refund back to the original card.

### Refund Options

| Method | When to Use | Status |
|--------|-------------|--------|
| **Auto-refund on Cancel** | Admin cancels a paid order in the dashboard | Implemented |
| **Stripe Dashboard** | Ad-hoc refunds, quickest manual option | Available (no code needed) |
| **Bank Transfer** | Refunds past Stripe's 180-day limit | Manual process outside Stripe |

---

## 2. Database Schema

### RefundStatus Enum

```prisma
enum RefundStatus {
  NONE
  PENDING
  REFUNDED
  FAILED
}
```

### Refund Fields on Order Model

| Field | Type | Default | Purpose |
|-------|------|---------|---------|
| `refundStatus` | RefundStatus | `NONE` | Tracks refund lifecycle |
| `refundedAt` | DateTime? | null | When the refund was confirmed by Stripe |
| `refundAmount` | Float? | null | Amount refunded (in AUD) |
| `stripeRefundId` | String? | null | Stripe refund ID for reference |

These were added alongside existing fields: `stripePaymentIntentId`, `cardBrand`, `cardLast4`.

---

## 3. Refund Flow

```
Admin selects "CANCELLED" on a paid order
        │
        ▼
┌───────────────────────────────┐
│ 1. Confirmation modal opens   │
│    Shows: refund amount,      │
│    card (brand + last 4),     │
│    customer name              │
└───────────┬───────────────────┘
            │ Admin clicks "Cancel & Refund"
            ▼
┌───────────────────────────────┐
│ 2. API validates:             │
│    - paymentStatus === PAID   │
│    - stripePaymentIntentId    │
│      exists                   │
│    - refundStatus === NONE    │
└───────────┬───────────────────┘
            │
            ▼
┌───────────────────────────────┐
│ 3. stripe.refunds.create({    │
│      payment_intent: id       │
│    })                         │
└───────────┬───────────────────┘
            │
     ┌──────┴──────┐
     │ Success     │ Failure
     ▼             ▼
┌──────────┐  ┌──────────────────┐
│ Update:  │  │ refundStatus →   │
│ status → │  │   FAILED         │
│ CANCELLED│  │ Order NOT        │
│ refund → │  │   cancelled      │
│ PENDING  │  │ Error shown to   │
│ save     │  │   admin          │
│ refundId │  └──────────────────┘
└────┬─────┘
     │
     ▼
┌───────────────────────────────┐
│ 4. Stripe webhook:            │
│    charge.refunded            │
│    - refundStatus → REFUNDED  │
│    - paymentStatus → REFUNDED │
│    - refundedAt → now()       │
│    - refundAmount → from event│
│    - Restore product stock    │
└───────────────────────────────┘
```

---

## 4. Implementation Details

### API: `/api/admin/orders/[id]` (PUT)

When `status` is set to `CANCELLED`:
1. Fetches the order with items
2. If `paymentStatus === PAID` AND `stripePaymentIntentId` exists AND `refundStatus === NONE`:
   - Calls `stripe.refunds.create({ payment_intent })` 
   - Updates order: `status → CANCELLED`, `refundStatus → PENDING`, saves `stripeRefundId`
3. If Stripe errors: sets `refundStatus → FAILED`, does NOT cancel the order, returns error
4. If order is not paid or has no payment intent: cancels without refund

### Webhook: `/api/webhooks/stripe`

**`charge.refunded`:**
1. Extracts `payment_intent` ID from the charge
2. Finds order by `stripePaymentIntentId`
3. Updates: `refundStatus → REFUNDED`, `paymentStatus → REFUNDED`, `refundedAt → now()`, `refundAmount`
4. Restores stock: increments `Product.stock` by `OrderItem.quantity` for each item

**`charge.refund.updated`:**
1. If refund status is `failed`, finds order by `stripeRefundId`
2. Sets `refundStatus → FAILED`

### Admin UI: `/dashboard/orders`

- When admin selects CANCELLED on a paid order with `refundStatus === NONE`, a **confirmation modal** opens
- Modal shows: order number, refund amount, card details (brand + last 4), customer name
- Two buttons: "Keep Order" (close) and "Cancel & Refund" (red, with loading state)
- After cancellation, refund status badge appears in the expanded order row:
  - Yellow "Refund Pending" — waiting for Stripe confirmation
  - Green "Refunded $XX.XX" — confirmed, with date
  - Red "Refund Failed" — Stripe error
- For unpaid orders, cancellation proceeds without the modal

### Track Page: `/track`

When a cancelled order has refund info:
- **REFUNDED**: Green alert — "Refund of $XX.XX issued to your [card] ending in [last4]. Please allow 5–10 business days."
- **PENDING**: Yellow alert — "Your refund is being processed. Please allow a few business days."

---

## 5. Edge Cases

| Scenario | Handling |
|----------|----------|
| Order not paid (PENDING payment) | Just cancel, no refund |
| No `stripePaymentIntentId` stored | Just cancel, no refund |
| Double refund attempt | Blocked: checks `refundStatus !== NONE` |
| Stripe API error | `refundStatus → FAILED`, order NOT cancelled, error shown |
| Webhook not configured (local dev) | Refund stays PENDING — refund still processed by Stripe |
| Refund after 180 days | Stripe rejects — error shown to admin, use bank transfer |
| Partial refund | Not in v1. Stripe supports via `amount` param if needed later |

---

## 6. Files Modified

| File | Changes |
|------|---------|
| `prisma/schema.prisma` | Added `RefundStatus` enum, 4 refund fields on Order |
| `src/lib/constants.ts` | Added `REFUND_STATUS_COLORS` |
| `src/app/api/admin/orders/[id]/route.ts` | Refund logic on CANCELLED + error handling |
| `src/app/api/webhooks/stripe/route.ts` | `charge.refunded` + `charge.refund.updated` handlers |
| `src/app/(dashboard)/dashboard/orders/page.tsx` | Confirmation modal + refund status badge |
| `src/app/(storefront)/track/page.tsx` | Refund alerts for customers |
| `src/app/api/orders/track/route.ts` | Returns refund fields |

---

## 7. Stripe API Reference

### Create Refund
```typescript
const refund = await stripe.refunds.create({
  payment_intent: order.stripePaymentIntentId,
  // amount: optional, omit for full refund
});
```

### Webhook Events
- `charge.refunded` — refund completed successfully
- `charge.refund.updated` — refund status changed (e.g., failed)

### Manual Refund via Stripe Dashboard
1. Go to https://dashboard.stripe.com/payments
2. Find the payment by customer email or amount
3. Click the payment → click "Refund"
4. Choose full or partial refund → confirm

### Test Refunds
Refunds work on test mode payments made with test cards. No additional configuration needed.

---

## 8. Stock Restoration

When `charge.refunded` webhook fires:
```
For each OrderItem in the cancelled order:
  Product.stock += OrderItem.quantity
```

Only restores stock once (checks `refundStatus` transition to prevent double restoration).

---

## 9. Future Enhancements (Not Yet Built)

- **Refund confirmation email** via Resend (needs RESEND_API_KEY)
- **Partial refunds** — Stripe supports via `amount` param
- **Retry refund button** — for admin to retry after FAILED status
- **Manual refund marking** — for bank transfer refunds processed outside Stripe
