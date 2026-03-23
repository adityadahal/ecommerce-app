# Refund Process — Order Cancellation

**Status:** Planned
**Date:** 23 March 2026
**Author:** Aditya Kishor Dahal

---

## 1. Overview

When an admin cancels a paid order, the customer should receive a full refund. This document outlines the complete refund flow, manual refund options, database changes, and implementation steps.

### Important: PCI-DSS Compliance

Full card numbers are **never accessible** from Stripe or any payment processor. This is a legal requirement (PCI-DSS). We can only store:
- Card brand (e.g., "visa", "mastercard")
- Last 4 digits (e.g., "4242")
- Stripe Payment Intent ID (used to process refunds)

Refunds are always processed using the **Payment Intent ID**, not card numbers. Stripe internally routes the refund back to the original card.

### Manual Refund Options

If auto-refund is not suitable, admins have three manual paths:

| Method | When to Use | How |
|--------|-------------|-----|
| **Stripe Dashboard** | Ad-hoc refunds, quickest option | Go to dashboard.stripe.com → find payment → click "Refund" |
| **Admin Refund Button** | In-app refund without leaving the dashboard | Button in orders page calls `stripe.refunds.create()` using stored Payment Intent ID (Planned) |
| **Bank Transfer** | Refunds past Stripe's 180-day limit | Collect customer's BSB + account number, process manual bank transfer outside Stripe |

---

## 2. Prerequisites (Already Done)

These fields are already added to the Order model:

| Field | Type | Purpose |
|-------|------|---------|
| `stripePaymentIntentId` | String? | Required to issue refunds via Stripe API |
| `cardBrand` | String? | Display card brand (visa, mastercard, etc.) |
| `cardLast4` | String? | Display last 4 digits of card |

These are populated when a payment succeeds (via webhook or success page fallback).

---

## 3. New Database Fields Needed

Add these fields to the Order model in `prisma/schema.prisma`:

| Field | Type | Default | Purpose |
|-------|------|---------|---------|
| `refundStatus` | RefundStatus enum | `NONE` | Tracks refund lifecycle |
| `refundedAt` | DateTime? | null | When the refund was completed |
| `refundAmount` | Float? | null | Amount refunded (supports partial refunds later) |
| `stripeRefundId` | String? | null | Stripe refund ID for reference |

### New Enum

```prisma
enum RefundStatus {
  NONE
  PENDING
  REFUNDED
  FAILED
}
```

---

## 4. Refund Flow

### Step-by-Step Process

```
Admin clicks "Cancel Order" on a PAID order
        │
        ▼
┌───────────────────────────┐
│ 1. Validate refund        │
│    - paymentStatus = PAID │
│    - stripePaymentIntentId│
│      exists               │
│    - refundStatus = NONE  │
└───────────┬───────────────┘
            │
            ▼
┌───────────────────────────┐
│ 2. Call Stripe Refunds API│
│    stripe.refunds.create({│
│      payment_intent: id   │
│    })                     │
└───────────┬───────────────┘
            │
            ▼
┌───────────────────────────┐
│ 3. Update Order           │
│    - status → CANCELLED   │
│    - refundStatus →       │
│      PENDING              │
│    - stripeRefundId       │
└───────────┬───────────────┘
            │
            ▼
┌───────────────────────────┐
│ 4. Stripe sends webhook   │
│    charge.refunded        │
└───────────┬───────────────┘
            │
            ▼
┌───────────────────────────┐
│ 5. Webhook handler        │
│    - refundStatus →       │
│      REFUNDED             │
│    - refundedAt → now()   │
│    - refundAmount → total │
│    - Restore product stock│
│    - Send refund email    │
└───────────────────────────┘
```

---

## 5. Implementation Steps

### Step 1: Update Prisma Schema

```prisma
model Order {
  // ... existing fields ...
  refundStatus  RefundStatus @default(NONE)
  refundedAt    DateTime?
  refundAmount  Float?
  stripeRefundId String?
}

enum RefundStatus {
  NONE
  PENDING
  REFUNDED
  FAILED
}
```

Run `npx prisma db push` and `npx prisma generate` after changes.

### Step 2: Update Admin Order Status API (`/api/admin/orders/[id]`)

When status is changed to `CANCELLED`:

```
1. Check if order.paymentStatus === "PAID"
2. Check if order.stripePaymentIntentId exists
3. Check if order.refundStatus === "NONE" (prevent double refund)
4. Call stripe.refunds.create({ payment_intent: order.stripePaymentIntentId })
5. Update order:
   - status → CANCELLED
   - refundStatus → PENDING
   - stripeRefundId → refund.id
6. Return success response
```

If the order is not paid or has no payment intent, just cancel without refunding.

### Step 3: Add Stripe Webhook Handler for `charge.refunded`

In `/api/webhooks/stripe/route.ts`, add a new case:

```
case "charge.refunded":
  1. Extract payment_intent ID from the charge
  2. Find order by stripePaymentIntentId
  3. Update order:
     - refundStatus → REFUNDED
     - refundedAt → new Date()
     - refundAmount → refund amount from event
  4. Restore stock: increment product quantities for each order item
  5. Send refund confirmation email to customer (if Resend configured)
```

### Step 4: Handle Refund Failures

If `stripe.refunds.create()` throws an error:

```
1. Update order:
   - refundStatus → FAILED
   - status remains unchanged (don't cancel if refund fails)
2. Show error notification to admin
3. Log error for debugging
```

Also listen for `charge.refund.updated` webhook with status `failed`.

### Step 5: Update Admin UI

In the orders page, when admin changes status to CANCELLED:

```
1. Show a confirmation modal:
   "Cancel this order? A full refund of $XX.XX will be issued to the
    customer's [cardBrand] ending in [cardLast4]."
2. After confirmation, call the API
3. Show refund status badge on the order:
   - PENDING → yellow "Refund Pending"
   - REFUNDED → green "Refunded"
   - FAILED → red "Refund Failed"
```

### Step 6: Update Track Order Page

Show refund info to customers on the track page:

```
If order is CANCELLED and refundStatus is REFUNDED:
  "Your order has been cancelled. A refund of $XX.XX has been issued
   to your [cardBrand] ending in [cardLast4]. Please allow 5-10
   business days for the refund to appear on your statement."

If order is CANCELLED and refundStatus is PENDING:
  "Your order has been cancelled. Your refund is being processed."
```

---

## 6. Edge Cases

| Scenario | Handling |
|----------|----------|
| Order cancelled but payment was never completed (PENDING) | Just cancel, no refund needed |
| Order cancelled but no stripePaymentIntentId stored | Just cancel, log warning |
| Double refund attempt | Check refundStatus !== NONE before processing |
| Stripe API is down | Set refundStatus to FAILED, admin can retry later |
| Partial refund | Not in v1. Stripe supports it via `amount` param if needed later |
| Refund after 180 days | Stripe does not allow refunds after 180 days. Show error to admin with message: "This payment is older than 180 days. Use a manual bank transfer to refund the customer." |
| Manual bank transfer needed | Admin contacts customer for BSB + account number, processes bank transfer outside Stripe. Mark order as REFUNDED manually |
| Webhook not configured (local dev) | Add a "Retry Refund" button in admin for manual trigger |
| Full card number needed | Not possible. PCI-DSS prohibits storage/access of full card numbers. Use Stripe Dashboard or Payment Intent ID for refunds |

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

This is the fastest option for one-off manual refunds and requires no code changes.

### Test Refunds
Refunds work on test mode payments made with test cards. No additional Stripe configuration needed for testing.

---

## 8. Stock Restoration

When a refund is confirmed (via webhook):

```
For each OrderItem in the cancelled order:
  Product.stock += OrderItem.quantity
```

This reverses the stock decrement that happened on payment success.

**Important:** Only restore stock once (check refundStatus transition to avoid double restoration).

---

## 9. Email Notifications (When Resend is Configured)

### Refund Confirmation Email
- **To:** customerEmail
- **Subject:** "Your FreshMart order has been refunded"
- **Content:**
  - Order number
  - Refund amount
  - Card details (brand + last 4)
  - Estimated timeline (5-10 business days)
  - Contact support link

---

## 10. Summary of Files to Modify

| File | Changes |
|------|---------|
| `prisma/schema.prisma` | Add RefundStatus enum, add refund fields to Order |
| `src/app/api/admin/orders/[id]/route.ts` | Trigger Stripe refund on CANCELLED status |
| `src/app/api/webhooks/stripe/route.ts` | Handle `charge.refunded` event |
| `src/app/(dashboard)/dashboard/orders/page.tsx` | Show refund status badge, cancel confirmation modal |
| `src/app/(storefront)/track/page.tsx` | Show refund info to customer |
| `src/app/(storefront)/account/orders/[id]/page.tsx` | Show refund info |
| `src/lib/constants.ts` | Add REFUND_STATUS_COLORS |
| `src/lib/email.ts` | Add refund confirmation email template |
