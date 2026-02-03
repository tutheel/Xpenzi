# Xpenzi

Xpenzi is a production-ready MVP for group expense tracking. It centralizes shared costs, partial splits, and settlements in one ledger, with strict money math, deterministic rounding, and clear balances.

## Features
- Clerk authentication with first-login user upsert
- Group creation and member management (admins only)
- Expense creation with partial splits and 4 split methods
- Expense editing (admin or creator) and soft deletion
- Per-group balances and settlement history
- Suggested settlements via greedy matching
- Modern UI with Tailwind + shadcn/ui

## Assumptions
- Users must already exist in the system to be added to a group (no invites in MVP).
- Money is stored as integer minor units (2 decimal places).
- Percent splits are whole-number percentages and must sum to 100.
- Group currency is fixed for all expenses and settlements in that group.

## Tech Stack
- Next.js App Router + TypeScript
- Tailwind CSS + shadcn/ui
- Clerk authentication
- Prisma + PostgreSQL
- Docker (local Postgres)

## Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy env file:
   ```bash
   cp .env.example .env
   ```
3. Start Postgres:
   ```bash
   docker-compose up -d
   ```
4. Apply migrations:
   ```bash
   npx prisma migrate dev
   ```
5. Run the app:
   ```bash
   npm run dev
   ```

## Environment Variables
```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/xpenzi?schema=public
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/app
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/app
```

## Money & Rounding Rules
- All money values are stored as integer minor units (e.g., cents/paise).
- For EQUAL, PERCENTAGES, and SHARES:
  - Base amounts are computed using floor division.
  - Any remainder is distributed deterministically by ascending `userId`, adding +1 minor unit until balanced.
- EXACT_AMOUNTS requires the sum of participant amounts to equal the total exactly.

## API Endpoints
- `POST /api/groups`
- `GET /api/groups`
- `GET /api/groups/:id`
- `POST /api/groups/:id/members`
- `POST /api/groups/:id/expenses`
- `GET /api/groups/:id/expenses`
- `GET /api/expenses/:id`
- `PATCH /api/expenses/:id`
- `DELETE /api/expenses/:id`
- `POST /api/groups/:id/settlements`
- `GET /api/groups/:id/settlements`
- `GET /api/groups/:id/balances`
- `GET /api/groups/:id/suggestions`

## Settlement Suggestions
Suggested settlements use a greedy algorithm:
1. Split balances into creditors (net > 0) and debtors (net < 0).
2. Match the largest debtor with the largest creditor.
3. Transfer the minimum amount needed to settle one side.
4. Repeat until all balances are settled.

## Scripts
- `npm run dev` - start local dev server
- `npm run build` - production build
- `npm run lint` - ESLint
- `npm run typecheck` - TypeScript check
- `npm run format` - Prettier

## Deployment Notes
- Configure Clerk keys and Postgres connection in production.
- Run `npx prisma migrate deploy` during release.
- Set `NEXT_PUBLIC_CLERK_*` URLs to match your deployed routes.