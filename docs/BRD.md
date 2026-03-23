# Business Requirements Document (BRD)
# FreshMart — Grocery Store E-Commerce Application

**Version:** 2.1
**Date:** 22 March 2026
**Last Updated:** 23 March 2026
**Author:** Aditya Kishor Dahal

---

## 1. Executive Summary

FreshMart is a single-store grocery e-commerce application built for the Australian market. Customers can browse, add to cart, and order directly **without creating an account**. Orders are tracked via a unique order number. The platform includes a full admin dashboard for managing products, orders, categories, and delivery zones.

**Target Market:** Melbourne, Victoria, Australia
**Currency:** AUD (Australian Dollars)
**Business Model:** Single-store online grocery with home delivery

---

## 2. Problem Statement

Local grocery stores lack affordable, modern e-commerce solutions tailored to the Australian market. Existing platforms (Shopify, WooCommerce) charge ongoing fees and don't handle AU-specific requirements like GST display, postcode-based delivery zones, and Afterpay out of the box.

FreshMart provides a custom-built, self-hosted solution with:
- Zero platform fees (self-hosted on Vercel + Railway)
- Australian tax compliance (GST included in price, displayed separately)
- Postcode-based delivery zone management
- Stripe integration with AU payment methods

---

## 3. Tech Stack

| Layer          | Technology                                   |
|----------------|----------------------------------------------|
| Framework      | Next.js 16 (App Router, TypeScript)          |
| Styling        | Tailwind CSS v4, custom UI components        |
| Database       | PostgreSQL 17 (Docker locally, Railway prod) |
| ORM            | Prisma 6                                     |
| Authentication | NextAuth.js v5 (Auth.js) — admin only (customers don't need accounts) |
| Payments       | Stripe Checkout (AUD)                        |
| Email          | Resend (transactional emails)                |
| File Storage   | Cloudinary (product images)                  |
| Deployment     | Vercel (app) + Railway (database)            |

---

## 4. User Roles

| Role     | Access                                                  |
|----------|---------------------------------------------------------|
| Customer (Guest) | Browse, search, add to cart, checkout with name/email/phone, track order by order number. **No account needed.** |
| Admin    | Login required. Full dashboard: manage products, categories, orders, delivery zones, inventory |

---

## 5. Functional Requirements

### 5.1 Authentication (Admin Only)
| ID    | Requirement                                      | Status |
|-------|--------------------------------------------------|--------|
| AUTH-1 | Admin email/password login                      | Done   |
| AUTH-2 | Middleware protects /dashboard only              | Done   |
| AUTH-3 | Session management via JWT                      | Done   |
| AUTH-4 | ~~Customer registration~~ (removed — no accounts needed) | N/A |
| AUTH-5 | Google OAuth for admin                          | Done (needs keys) |

### 5.2 Product Catalog
| ID    | Requirement                                      | Status |
|-------|--------------------------------------------------|--------|
| CAT-1 | Homepage with hero banner, featured products, on-sale section | Done |
| CAT-2 | Category pages with product grid                | Done   |
| CAT-3 | Product filtering (price range, in-stock, sort) | Done   |
| CAT-4 | Pagination on category/search pages             | Done   |
| CAT-5 | Product detail page with image gallery          | Done   |
| CAT-6 | Product search (name + description full-text)   | Done   |
| CAT-7 | Related products on product page                | Done   |
| CAT-8 | Nested/subcategories                            | Done   |

### 5.3 Shopping Cart
| ID    | Requirement                                      | Status |
|-------|--------------------------------------------------|--------|
| CART-1 | Add/remove/update cart items                    | Done   |
| CART-2 | localStorage cart for guests                    | Done   |
| CART-3 | Cart page with full summary                     | Done   |
| CART-4 | Quantity selector with stock limit              | Done   |
| CART-5 | Cart count badge in header (live sync via useSyncExternalStore) | Done |
| CART-6 | Per-user cart isolation (keyed by user ID in localStorage) | Done |

### 5.4 Checkout & Payments (Guest Checkout)
| ID    | Requirement                                      | Status |
|-------|--------------------------------------------------|--------|
| PAY-1 | **Guest checkout** — no login needed, collects name/email/phone | Done |
| PAY-2 | AU address form (street, suburb, state, postcode) | Done |
| PAY-3 | Delivery time slot selection                     | Done   |
| PAY-4 | Order summary with subtotal, delivery fee, GST, total | Done |
| PAY-5 | Random order number generation (MVM-XXXXX-XXXX) | Done   |
| PAY-6 | Stripe Checkout Session creation                 | Done   |
| PAY-7 | Stripe webhook: payment success → order paid    | Done   |
| PAY-8 | Stripe webhook: payment failed → order failed   | Done   |
| PAY-9 | Order confirmation page with prominent order number | Done |
| PAY-10 | Auto stock decrement on successful payment      | Done   |
| PAY-11 | Store card details (brand + last 4 digits) on order | Done |
| PAY-12 | Store Stripe Payment Intent ID for refunds      | Done   |
| PAY-13 | Display card info on order success, track, admin, account pages | Done |
| PAY-14 | Auto-refund via Stripe when order is cancelled  | Planned |
| PAY-15 | Refund status tracking (NONE → PENDING → REFUNDED → FAILED) | Planned |
| PAY-16 | Stripe webhook: charge.refunded → update refund status | Planned |
| PAY-17 | Apple Pay / Google Pay / Afterpay               | Planned (Stripe config) |

### 5.5 Order Tracking (Public)
| ID    | Requirement                                      | Status |
|-------|--------------------------------------------------|--------|
| TRK-1 | Public order tracking page (/track)             | Done   |
| TRK-2 | Track by order number — shows status steps      | Done   |
| TRK-3 | Visual status tracker (Placed → Processing → Out for Delivery → Delivered) | Done |
| TRK-4 | Track API (GET /api/orders/track?order=XXX)     | Done   |
| TRK-5 | "Track Order" button in header and footer       | Done   |

### 5.6 ~~Customer Account~~ (Removed)
_Customers no longer need accounts. The account pages (profile, orders, addresses) are legacy and may be removed._

| ID    | Requirement                                      | Status |
|-------|--------------------------------------------------|--------|
| ACC-1 | ~~Profile settings~~ (removed — no accounts)   | N/A    |
| ACC-2 | Order history list                               | Done   |
| ACC-3 | Order detail view                                | Done   |
| ACC-4 | Manage saved addresses (add/delete)              | Done   |
| ACC-5 | Change password                                  | Planned |

### 5.6 Admin Dashboard
| ID    | Requirement                                      | Status |
|-------|--------------------------------------------------|--------|
| ADM-1 | Overview: today's orders, revenue, low stock    | Done   |
| ADM-2 | Product CRUD (create, edit, delete)              | Done   |
| ADM-3 | Category CRUD                                    | Done   |
| ADM-4 | Order management with status updates             | Done   |
| ADM-5 | Order status flow: Pending → Processing → Out for Delivery → Delivered | Done |
| ADM-6 | Delivery zone management (postcode ranges, fees) | Done   |
| ADM-7 | Low stock alerts                                 | Done   |
| ADM-8 | Bulk product upload via CSV                      | Planned |
| ADM-9 | Image upload to Cloudinary                       | Planned |

### 5.7 Delivery
| ID    | Requirement                                      | Status |
|-------|--------------------------------------------------|--------|
| DEL-1 | Delivery zones by postcode ranges               | Done   |
| DEL-2 | Delivery fee per zone                            | Done   |
| DEL-3 | Free delivery threshold (min order amount)       | Done   |
| DEL-4 | Delivery time slot selection                     | Done   |
| DEL-5 | Dynamic fee calculation based on customer postcode | Planned |

### 5.8 Notifications
| ID    | Requirement                                      | Status |
|-------|--------------------------------------------------|--------|
| NOT-1 | Order confirmation email (Resend)               | Done (code ready, needs API key) |
| NOT-2 | Order status update emails                       | Done (code ready, needs API key) |
| NOT-3 | Toast notifications for cart actions             | Done   |
| NOT-4 | Password reset email                             | Planned |

### 5.9 SEO & Performance
| ID    | Requirement                                      | Status |
|-------|--------------------------------------------------|--------|
| SEO-1 | Dynamic meta tags + Open Graph per page         | Done   |
| SEO-2 | Auto-generated sitemap.xml                       | Done   |
| SEO-3 | robots.txt                                       | Done   |
| SEO-4 | Next.js Image optimization                       | Done   |
| SEO-5 | Loading skeletons                                | Done   |
| SEO-6 | Error boundary + 404 page                        | Done   |

---

## 6. Data Model

### Core Entities

```
User
├── id, email, password, name, phone, role (CUSTOMER/ADMIN)
├── → Account (OAuth providers)
├── → Session
├── → Address[]
├── → Cart → CartItem[]
└── → Order[]

Category
├── id, name, slug, image, parentId (self-referencing for subcategories)
└── → Product[]

Product
├── id, name, slug, description, price, compareAtPrice
├── images[], categoryId, stock, unit, isActive, isFeatured
├── → CartItem[]
└── → OrderItem[]

Order
├── id, orderNumber, userId (optional), status, paymentStatus
├── subtotal, deliveryFee, gst, total
├── deliveryAddress (JSON), deliverySlot, stripeSessionId
├── stripePaymentIntentId, cardBrand, cardLast4 (payment details)
├── customerName, customerEmail, customerPhone (guest info)
└── → OrderItem[]

DeliveryZone
└── id, name, postcodeFrom, postcodeTo, deliveryFee, minOrderForFree, isActive
```

### Enums
- **OrderStatus:** PENDING → PROCESSING → OUT_FOR_DELIVERY → DELIVERED | CANCELLED
- **PaymentStatus:** PENDING → PAID | FAILED | REFUNDED
- **Role:** CUSTOMER | ADMIN

---

## 7. Page Map

### Public (Storefront) — No Login Required
| Route                    | Page                        |
|--------------------------|-----------------------------|
| `/`                      | Homepage (landing page)     |
| `/category/[slug]`       | Category product listing    |
| `/product/[slug]`        | Product detail              |
| `/search?q=`             | Search results (+ live search in header) |
| `/cart`                  | Shopping cart                |
| `/checkout`              | Guest checkout (name/email/phone + address) |
| `/order/success`         | Order confirmation with order number |
| `/track`                 | Track order by order number |

### Admin Only (Login Required)
| Route                    | Page                        |
|--------------------------|-----------------------------|
| `/login`                 | Admin sign in               |

### Admin
| Route                          | Page                   |
|--------------------------------|------------------------|
| `/dashboard`                   | Overview + stats       |
| `/dashboard/products`          | Product list           |
| `/dashboard/products/new`      | Create product         |
| `/dashboard/products/[id]`     | Edit product           |
| `/dashboard/categories`        | Category management    |
| `/dashboard/orders`            | Order management       |
| `/dashboard/delivery-zones`    | Delivery zone config   |

### API Routes
| Route                              | Method | Purpose                     |
|------------------------------------|--------|-----------------------------|
| `/api/auth/[...nextauth]`          | *      | NextAuth handlers           |
| `/api/auth/register`               | POST   | User registration           |
| `/api/checkout`                    | POST   | Guest checkout → Stripe session |
| `/api/webhooks/stripe`             | POST   | Stripe webhook handler      |
| `/api/orders/track`               | GET    | Public order tracking by order number |
| `/api/search`                      | GET    | Live search (returns top 6 matches) |
| `/api/profile`                     | GET/PUT| User profile (legacy)       |
| `/api/addresses`                   | GET/POST| User addresses (legacy)    |
| `/api/addresses/[id]`              | DELETE | Delete address (legacy)     |
| `/api/admin/products`              | GET/POST| Product CRUD               |
| `/api/admin/products/[id]`         | GET/PUT/DELETE | Single product       |
| `/api/admin/categories`            | GET/POST| Category CRUD              |
| `/api/admin/categories/[id]`       | PUT/DELETE | Single category          |
| `/api/admin/orders`                | GET    | List orders                 |
| `/api/admin/orders/[id]`           | PUT    | Update order status         |
| `/api/admin/delivery-zones`        | GET/POST| Delivery zones             |
| `/api/admin/delivery-zones/[id]`   | DELETE | Delete zone                 |

---

## 8. Business Rules

| Rule | Description |
|------|-------------|
| GST  | 10% GST is included in all product prices (Australian standard). Displayed separately as `price / 11` |
| Free Delivery | Orders over $75 qualify for free delivery |
| Default Delivery Fee | $9.95 for orders under $75 |
| Stock | Products cannot be added to cart beyond available stock |
| Stock Decrement | Stock is decremented automatically when Stripe payment succeeds |
| Order Numbers | Format: `MVM-{timestamp_base36}-{random}` (e.g., MVM-L5K2F-A3B1) |
| No Customer Login | Customers order as guests with name/email/phone. No account needed |
| Order Tracking | Customers track orders via order number at /track |
| Password | Admin passwords: minimum 8 characters, hashed with bcrypt (12 rounds) |
| Admin Access | Only users with role=ADMIN can access `/dashboard/*` |
| Card Details | Card brand and last 4 digits are captured from Stripe on successful payment and stored on the order |
| Refund on Cancel | When admin cancels a PAID order, a full refund is issued automatically via Stripe Refunds API (Planned) |
| Refund Eligibility | Only orders with paymentStatus=PAID and a stored stripePaymentIntentId can be refunded |
| Stock Restoration | When a paid order is cancelled and refunded, stock should be restored (incremented back) |

### Stripe Test Cards
| Card Number | Result |
|------------|--------|
| `4242 4242 4242 4242` | Payment succeeds |
| `4000 0000 0000 0002` | Payment declines |
| `4000 0025 0000 3155` | Requires 3D Secure |
| Use any future expiry date and any 3-digit CVC ||

---

## 9. Third-Party Integrations

| Service    | Purpose                | Setup Required                         |
|------------|------------------------|----------------------------------------|
| Stripe     | Payment processing     | Create account → get test/live keys    |
| Cloudinary | Product image hosting  | Create account → get cloud name + keys |
| Resend     | Transactional emails   | Create account → get API key + verify domain |
| Google     | OAuth login            | Google Cloud Console → OAuth credentials |

---

## 10. Local Development Setup

### Prerequisites
- Node.js 18+
- Docker Desktop
- npm

### Steps
```bash
# 1. Start PostgreSQL
docker start mvm-postgres
# (or: docker run -d --name mvm-postgres -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres123 -e POSTGRES_DB=mvm -p 5433:5432 postgres:17-alpine)

# 2. Install dependencies
npm install

# 3. Push schema to DB
npx prisma db push

# 4. Seed sample data
npm run db:seed

# 5. Start dev server
npm run dev
```

### Default Accounts
| Role     | Email                       | Password     |
|----------|-----------------------------|--------------|
| Admin    | admin@freshmart.com.au      | admin123     |
| Customer | customer@example.com        | customer123  |

### Environment Variables
See `.env.example` for all required variables.

---

## 11. Deployment Plan

| Component | Platform | Details                              |
|-----------|----------|--------------------------------------|
| App       | Vercel   | Auto-deploy from `main` branch       |
| Database  | Railway  | Managed PostgreSQL                   |
| Domain    | Namecheap| `.com.au` or `.com`, DNS → Vercel    |
| SSL       | Vercel   | Automatic                            |

---

## 12. Future Enhancements (Post-Launch)

| Priority | Feature                                |
|----------|----------------------------------------|
| High     | Auto-refund on order cancellation (see [REFUND-PROCESS.md](REFUND-PROCESS.md)) |
| High     | DB-backed cart for logged-in users     |
| High     | Cloudinary image upload in admin       |
| High     | CSV bulk product import                |
| High     | Password reset flow                    |
| Medium   | Coupon/promo code system               |
| Medium   | Real-time order tracking               |
| Medium   | Dynamic delivery fee by postcode       |
| Medium   | Apple Pay / Google Pay / Afterpay      |
| Low      | Mobile app (React Native)              |
| Low      | Loyalty/rewards program                |
| Low      | Multi-store / franchise support        |
| Low      | Supplier/vendor portal                 |
| Low      | AI product recommendations             |

---

## 13. File Count Summary

| Area              | Files |
|-------------------|-------|
| Pages/Routes      | 25    |
| API Routes        | 14    |
| Components        | 12    |
| Libraries/Hooks   | 7     |
| Config/Types      | 6     |
| Prisma (schema + seed) | 2 |
| **Total**         | **~70** |
