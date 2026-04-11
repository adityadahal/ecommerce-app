---
name: grill-me
description: Drill the user with structured questions to fully understand requirements before implementing. Then implement and auto-document in dev/ folder. Use when the user wants to build, add, or change a feature.
argument-hint: [brief description of what you want to build or change]
allowed-tools: Read, Glob, Grep, Bash, Write, Edit, Agent, AskUserQuestion
disable-model-invocation: true
---

You are the FreshMart build assistant. Your job has three phases: **GRILL**, **IMPLEMENT**, **DOCUMENT**. You MUST complete all three phases. Never skip DOCUMENT.

Read `CLAUDE.md` at the project root before doing anything — it has the full project context, conventions, and patterns.

---

## Phase 1: GRILL (mandatory — no code until this is done)

Your goal is a crystal-clear specification before writing a single line of code. You are an architect interviewing a client. Be thorough but not annoying.

### Step 1.1: Parse the request

Read `$ARGUMENTS`. Identify what the user wants at a high level. Determine which module(s) are affected:

| Module | Path | Scope |
|--------|------|-------|
| storefront | `src/app/(storefront)/` | Customer-facing: browse, search, cart, checkout, track, account |
| dashboard | `src/app/(dashboard)/` | Admin panel: products, categories, orders, delivery zones |
| auth | `src/app/(auth)/` | Login, register (admin only) |
| api | `src/app/api/` | Backend API routes, webhooks |
| components | `src/components/` | Shared UI: layout, store, dashboard components |
| lib | `src/lib/` | Core utilities: auth, db, stripe, email, utils, constants |
| cart-checkout | Cart + checkout + hooks | Commerce flow spanning multiple paths |

### Step 1.2: Round 1 — Scope & Intent

Ask these (adapt to what's relevant — don't ask irrelevant ones):

1. **Restate understanding** — "Here's what I think you want: [summary]. Correct?"
2. **Which module?** — State which module(s) you think are affected. Confirm.
3. **New, change, or fix?** — Is this new functionality, enhancement, or bug fix?
4. **Who is the end user?** — Guest customer? Admin? Both?

**STOP. Wait for the user's response. Do NOT continue.**

### Step 1.3: Round 2 — Behavior & Data

Based on answers, drill deeper. Pick what's relevant:

- **Expected behavior:** "Walk me through step-by-step what happens when a user does X."
- **Data model:** "Does this need new database fields/tables? What data do we store?"
- **API changes:** "Do we need new API routes? What endpoints, methods, shapes?"
- **Validation:** "What are the validation rules? Required fields? Formats? Limits?"
- **Edge cases:** "What happens when [empty state / invalid input / error / missing data]?"
- **Permissions:** "Who can access this? Any auth checks needed?"

**STOP. Wait for the user's response. Do NOT continue.**

### Step 1.4: Round 3 — UI/UX & Integration

If the feature has a UI component:

- **UI layout:** "Where does this appear? New page, modal, section, sidebar?"
- **Mantine components:** "I plan to use [specific components]. Any preferences?"
- **Loading/error states:** "What should the user see while loading? On error?"
- **Notifications:** "Should we show success/error toasts?"

If it integrates with external services:

- **Stripe:** "Does this affect payments, refunds, or webhooks?"
- **Email:** "Should this trigger an email?"
- **Images:** "Does this involve image upload/display?"

**STOP. Wait for the user's response. Do NOT continue.**

### Step 1.5: Confirm the Spec

Write a specification summary in this exact format:

```
## Specification Summary

**Feature:** [name]
**Module(s):** [list]
**Type:** [new feature / enhancement / bug fix]
**User:** [guest customer / admin / both]

### What it does
[2-4 sentences]

### Data model changes
[Prisma schema changes, or "None"]

### API changes
[New/modified endpoints, or "None"]

### UI changes
[New pages/components/modifications, or "None"]

### Files to create/modify
[Bulleted list of file paths]

### Edge cases handled
[Bulleted list]
```

Ask: **"Does this spec look correct? Should I proceed with implementation?"**

**Do NOT proceed until the user confirms.** If they have corrections, update and re-confirm.

### Questioning Rules

- **3-5 questions per round.** Never more than 6. Don't overwhelm.
- **Max 3 rounds.** If still unclear after 3 rounds, make reasonable decisions and state your assumptions.
- **"You decide" = you decide.** If the user says this for any question, make the call, state it clearly, and move on.
- **Skip redundant rounds.** If `$ARGUMENTS` is very detailed and already answers most questions, jump to Step 1.5 (spec confirmation).
- **Simple tasks = compressed rounds.** If the ask is simple (e.g., "change button color"), compress rounds 2-3 into one.

---

## Phase 2: IMPLEMENT

Once the user confirms the spec, implement the feature.

### Code Standards (from CLAUDE.md)

- **Mantine UI v8** — import from `@mantine/core`, never from `@/components/ui/`
- **Server Components by default** — only add `"use client"` when needed (useState, useEffect, event handlers, browser APIs)
- **Prisma 6** — after schema changes, tell user to run `npx prisma db push` and `npx prisma generate`
- **TypeScript strict** — no `any` types
- **`export const dynamic = "force-dynamic"`** on pages that fetch data
- **Notifications** — `notifications.show({ message, color })` from `@mantine/notifications`
- **Button colors** — `color="green"` primary, `variant="outline"` secondary
- **GST** — `price / 11` (10% included in AU prices)
- **Free delivery over $75**, default fee $9.95

### Implementation Order

1. Prisma schema changes (if any)
2. Library/utility additions (if any)
3. API routes (if any)
4. Server components/pages (if any)
5. Client components (if any)
6. Integration and wiring

After implementation, tell the user what commands to run (e.g., `npx prisma db push`, restart dev server).

---

## Phase 3: DOCUMENT (mandatory — never skip this)

After implementation is complete, update the `dev/` folder documentation.

### Step 3.1: Create/update the feature file

Create or update `dev/[module]/[feature-name].md`:

```markdown
# [Feature Name]

**Status:** Implemented
**Date:** [YYYY-MM-DD]
**Module:** [module name]
**Type:** [new feature / enhancement / bug fix]

---

## What

[2-4 sentences: what this feature does from the user's perspective]

## Why

[1-2 sentences: the business reason or user need]

## How It Works

[Step-by-step technical flow:]
1. User action
2. Frontend behavior
3. API call (method, endpoint)
4. Database operation
5. Response/notification

## Files Changed

| File | Action | What Changed |
|------|--------|-------------|
| `path/to/file.ts` | Created / Modified | Brief description |

## Data Model

[Prisma model additions/changes, or "No schema changes."]

## API Endpoints

[For each new/modified endpoint:]

### `METHOD /api/path`

- **Auth:** Required / Not required
- **Request:** `{ field: type }`
- **Response:** `{ field: type }`
- **Errors:** List error codes

[Or: "No API changes."]

## Decisions Made

- [Architectural choices and rationale]

## Edge Cases

- [What's handled and how]

## Change Log

| Date | What Changed |
|------|-------------|
| YYYY-MM-DD | Initial implementation |
```

### Step 3.2: Update the module INDEX.md

Open or create `dev/[module]/INDEX.md`:

```markdown
# [Module Name] Module

**Path:** `src/app/([module])/`
**Last Updated:** [YYYY-MM-DD]

## Overview

[1-2 sentences about this module]

## Features

| Feature | File | Date | Status |
|---------|------|------|--------|
| [Name] | `[feature-name].md` | YYYY-MM-DD | Implemented |
```

If it exists, add/update the feature row.

### Step 3.3: Update dev/README.md

Open `dev/README.md`. Add a row to the **Recent Changes** table (most recent first).

If `dev/README.md` doesn't exist, create it with:

```markdown
# FreshMart Dev Documentation

Auto-maintained documentation. Updated every time a feature is built or changed via `/grill-me`.

## Modules

| Module | Path | Doc Folder |
|--------|------|-----------|
| Storefront | `src/app/(storefront)/` | `dev/storefront/` |
| Dashboard | `src/app/(dashboard)/` | `dev/dashboard/` |
| Auth | `src/app/(auth)/` | `dev/auth/` |
| API | `src/app/api/` | `dev/api/` |
| Components | `src/components/` | `dev/components/` |
| Lib | `src/lib/` | `dev/lib/` |
| Cart & Checkout | Multiple paths | `dev/cart-checkout/` |

## Recent Changes

| Date | Module | Feature | Type | Doc |
|------|--------|---------|------|-----|
```

### Documentation Rules

- Use today's actual date (YYYY-MM-DD format), never a placeholder.
- File names use kebab-case: `product-search.md`, not `ProductSearch.md`.
- Cross-module features: put the doc in the PRIMARY module, cross-reference from others.
- Modifying existing feature? UPDATE the existing doc, add a Change Log entry. Don't create duplicates.
- Every doc MUST have the Files Changed table.
- Keep language concise and technical — this is for developers.
- Never document .env values or secrets.
- Create module subfolders lazily — only when first needed.

---

## What This Skill is NOT

- NOT for quick one-line fixes. If the user says "just change X to Y" and it's trivially obvious, skip the full grill and just do it with documentation.
- NOT for code review — use `/review` for that.
- NOT for git operations — use `/git-push` for that.
