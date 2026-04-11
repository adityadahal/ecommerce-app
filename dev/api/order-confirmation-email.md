# Order Confirmation Email

**Status:** Implemented
**Date:** 2026-04-11
**Module:** API / Storefront
**Type:** Enhancement

---

## What

Sends an order confirmation email to the customer when their payment is verified. The email includes the order number, item list, and total. Sent via Resend.

## Why

Customers need confirmation that their order was placed successfully, with a reference number they can use to track it.

## How It Works

1. Customer completes Stripe checkout
2. Stripe fires `checkout.session.completed` webhook
3. Webhook updates order to PAID/PROCESSING, decrements stock
4. Webhook calls `sendOrderConfirmation()` with customer email, order number, total, and items
5. Customer receives email with subject "Order Confirmed - MVM-XXXXX-XXXX"

Fallback: If webhook doesn't fire (local dev), the success page verifies payment with Stripe directly and sends the email from there. The idempotency guard (only sends when transitioning from PENDING) prevents double-send.

## Files Changed

| File | Action | What Changed |
|------|--------|-------------|
| `src/app/api/webhooks/stripe/route.ts` | Modified | Added `sendOrderConfirmation` call after stock decrement |
| `src/app/(storefront)/order/success/page.tsx` | Modified | Added fallback email send in `verifyAndUpdatePayment` |
| `src/lib/email.ts` | Unchanged | Already had `sendOrderConfirmation` function |

## Data Model

No schema changes.

## API Endpoints

No new endpoints. Modified the existing Stripe webhook handler.

## Decisions Made

- Email sent in both webhook and success page fallback for reliability
- Only sends when order transitions from PENDING → PAID (prevents duplicates)
- Gracefully skips if `RESEND_API_KEY` not set (logs to console)

## Edge Cases

- Missing API key: function logs and returns, no crash
- No customer email: guarded with `if (order.customerEmail)`
- Double-send prevention: success page only sends when it performs the PENDING → PAID transition itself

## Change Log

| Date | What Changed |
|------|-------------|
| 2026-04-11 | Initial implementation — wired existing function into webhook + success page |
