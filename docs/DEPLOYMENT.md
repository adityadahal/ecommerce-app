# Lumbini Meat & Grocery — VPS Deployment Guide

Deploying the app on a Namecheap VPS using Docker Compose with 3 containers:
PostgreSQL, Next.js app, and Caddy (reverse proxy + auto-SSL).

---

## Architecture

```
Internet → Caddy (reverse proxy + auto-SSL) → Next.js App → PostgreSQL
           ┌──────────────────────────────────────────────────────┐
           │  Docker Compose                                      │
           │  ┌─────────┐   ┌──────────┐   ┌──────────────────┐  │
           │  │  Caddy   │──▶│  Next.js  │──▶│  PostgreSQL 17   │  │
           │  │ :80/:443 │   │  :3000    │   │  :5432 (internal)│  │
           │  └─────────┘   └──────────┘   └──────────────────┘  │
           └──────────────────────────────────────────────────────┘
```

| Container | Purpose | Exposed? |
|-----------|---------|----------|
| **db** | PostgreSQL 17 database | No (internal only) |
| **app** | Next.js production build | No (only Caddy reaches it) |
| **caddy** | Reverse proxy + HTTPS | Yes (:80, :443) |

---

## VPS Requirements

| Resource | Minimum | Recommended |
|----------|---------|-------------|
| RAM | 2 GB | 4 GB |
| CPU | 1 vCPU | 2 vCPU |
| Disk | 25 GB SSD | 50 GB SSD |
| OS | Ubuntu 22.04 / 24.04 | Ubuntu 24.04 |

---

## Prerequisites

Before you start, you need:

1. **A domain name** — point its DNS A record to your VPS IP address
2. **VPS SSH access** — Namecheap provides an IP + root password
3. **Stripe live keys** — for real payments (replace test keys from dev)
4. **Resend API key** — for order confirmation emails (optional, app works without it)

---

## Files to Create

You need 4 files in the project root:

### 1. `Dockerfile`

Builds the Next.js app as a production Docker image.

```dockerfile
# Stage 1: Install dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Stage 2: Build the app
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build Next.js
RUN npm run build

# Stage 3: Production image
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built assets
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Copy Prisma schema + migrations (needed for db push/migrate)
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Set ownership
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
```

> **Important:** This uses Next.js standalone output. Add this to `next.config.ts`:
> ```ts
> const nextConfig = {
>   output: "standalone",
> };
> ```

### 2. `docker-compose.prod.yml`

Orchestrates all 3 containers.

```yaml
services:
  db:
    image: postgres:17-alpine
    restart: always
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}"]
      interval: 5s
      timeout: 5s
      retries: 5

  app:
    build: .
    restart: always
    depends_on:
      db:
        condition: service_healthy
    environment:
      DATABASE_URL: postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@db:5432/${POSTGRES_DB}?schema=public
      AUTH_SECRET: ${AUTH_SECRET}
      NEXTAUTH_URL: ${NEXTAUTH_URL}
      STRIPE_SECRET_KEY: ${STRIPE_SECRET_KEY}
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: ${NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY}
      STRIPE_WEBHOOK_SECRET: ${STRIPE_WEBHOOK_SECRET}
      RESEND_API_KEY: ${RESEND_API_KEY}
      NEXT_PUBLIC_APP_URL: ${NEXT_PUBLIC_APP_URL}
    volumes:
      - uploads:/app/public/uploads

  caddy:
    image: caddy:2-alpine
    restart: always
    depends_on:
      - app
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile
      - caddy_data:/data
      - caddy_config:/config

volumes:
  postgres_data:    # Database files — survives container rebuilds
  uploads:          # Product images — survives container rebuilds
  caddy_data:       # SSL certificates
  caddy_config:     # Caddy config cache
```

### 3. `Caddyfile`

Caddy reverse proxy config. Handles HTTPS automatically.

```
yourdomain.com.au {
    reverse_proxy app:3000
}
```

Replace `yourdomain.com.au` with your actual domain.

### 4. `.env.production`

Create this ON THE VPS (never commit to git).

```env
# Database
POSTGRES_USER=lumbini
POSTGRES_PASSWORD=CHANGE_ME_TO_A_STRONG_PASSWORD
POSTGRES_DB=lumbini

# Auth
AUTH_SECRET=GENERATE_A_RANDOM_64_CHAR_STRING
NEXTAUTH_URL=https://yourdomain.com.au

# Stripe (use LIVE keys for production)
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# App URL
NEXT_PUBLIC_APP_URL=https://yourdomain.com.au

# Email (optional)
RESEND_API_KEY=re_...
```

Generate `AUTH_SECRET` with:
```bash
openssl rand -hex 32
```

---

## Step-by-Step Deployment

### Step 1: Set Up the VPS

SSH into your Namecheap VPS:

```bash
ssh root@YOUR_VPS_IP
```

Install Docker:

```bash
# Update system
apt update && apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com | sh

# Install Docker Compose plugin
apt install docker-compose-plugin -y

# Verify
docker --version
docker compose version
```

### Step 2: Point Your Domain

In Namecheap DNS settings (or your domain registrar):

| Type | Host | Value |
|------|------|-------|
| A | @ | YOUR_VPS_IP |
| A | www | YOUR_VPS_IP |

Wait 5-30 minutes for DNS to propagate. Check with:
```bash
ping yourdomain.com.au
```

### Step 3: Clone & Configure

```bash
# Clone the repo
cd /opt
git clone https://github.com/YOUR_USERNAME/mvm.git lumbini
cd lumbini

# Create production env file
nano .env.production
# Paste the .env.production content from above, fill in real values
# Save: Ctrl+X, then Y, then Enter
```

### Step 4: Build & Start

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build
```

This will:
1. Build the Next.js Docker image (takes 2-5 minutes first time)
2. Start PostgreSQL and wait for it to be healthy
3. Start the Next.js app
4. Start Caddy (auto-fetches SSL certificate for your domain)

### Step 5: Set Up the Database

```bash
# Run Prisma migrations
docker compose -f docker-compose.prod.yml exec app npx prisma db push

# Seed initial data (admin user, categories, products)
docker compose -f docker-compose.prod.yml exec app npx prisma db seed
```

### Step 6: Verify

Open `https://yourdomain.com.au` in your browser. You should see your Lumbini store with HTTPS.

Admin login: `admin@lumbinimeat.com.au` / `admin123`

---

## Docker Volumes Explained

Volumes keep your data safe when containers are recreated.

```
  VPS Disk (permanent)              Container (disposable)
┌────────────────────┐          ┌──────────────────────────┐
│  postgres_data     │ ◄══════▶ │  /var/lib/postgresql/data │
│  (all your data)   │  linked  │  (database files)         │
└────────────────────┘          └──────────────────────────┘

┌────────────────────┐          ┌──────────────────────────┐
│  uploads           │ ◄══════▶ │  /app/public/uploads      │
│  (product images)  │  linked  │  (uploaded images)        │
└────────────────────┘          └──────────────────────────┘
```

- `docker compose down` — stops containers, **keeps volumes** (data safe)
- `docker compose down -v` — stops containers, **DELETES volumes** (data gone!)

**Never run `docker compose down -v` on production.**

---

## Common Operations

### View logs
```bash
# All containers
docker compose -f docker-compose.prod.yml logs -f

# Just the app
docker compose -f docker-compose.prod.yml logs -f app

# Just the database
docker compose -f docker-compose.prod.yml logs -f db
```

### Restart services
```bash
docker compose -f docker-compose.prod.yml restart
```

### Deploy updates (after pushing new code)
```bash
cd /opt/lumbini
git pull
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build
```

### Run database commands
```bash
# Open Prisma Studio (accessible at VPS_IP:5555 — close when done)
docker compose -f docker-compose.prod.yml exec app npx prisma studio

# Run raw SQL
docker compose -f docker-compose.prod.yml exec db psql -U lumbini -d lumbini -c "SELECT count(*) FROM \"Order\""
```

### Backup database
```bash
# Create a backup
docker compose -f docker-compose.prod.yml exec db pg_dump -U lumbini lumbini > backup_$(date +%Y%m%d).sql

# Restore from backup
cat backup_20260411.sql | docker compose -f docker-compose.prod.yml exec -T db psql -U lumbini lumbini
```

### Check disk usage
```bash
docker system df
```

---

## Setting Up Stripe Webhooks for Production

1. Go to [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/webhooks)
2. Click **Add endpoint**
3. URL: `https://yourdomain.com.au/api/webhooks/stripe`
4. Select events: `checkout.session.completed`, `charge.refunded`
5. Copy the **Signing secret** (`whsec_...`) into `.env.production` as `STRIPE_WEBHOOK_SECRET`
6. Restart: `docker compose -f docker-compose.prod.yml restart app`

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Site not loading | Check DNS propagated: `ping yourdomain.com.au` |
| SSL error | Caddy needs ports 80+443 open. Check: `ufw allow 80 && ufw allow 443` |
| App crashes | Check logs: `docker compose -f docker-compose.prod.yml logs app` |
| Database connection error | Check db is healthy: `docker compose -f docker-compose.prod.yml ps` |
| Images not showing after rebuild | Make sure `uploads` volume is in docker-compose.prod.yml |
| Out of disk space | Run `docker system prune -a` to clean old images |

---

## Security Checklist

- [ ] Change default admin password after first login
- [ ] Use strong `POSTGRES_PASSWORD` (not `postgres123`)
- [ ] Use strong `AUTH_SECRET` (random 64 chars)
- [ ] Never commit `.env.production` to git
- [ ] Set up firewall: only allow ports 22 (SSH), 80, 443
- [ ] Set up regular database backups
- [ ] Use Stripe LIVE keys (not test keys)

### Firewall setup
```bash
ufw allow 22
ufw allow 80
ufw allow 443
ufw enable
```

This blocks all ports except SSH and web traffic. PostgreSQL (5432) is NOT exposed — only reachable inside Docker's network.
