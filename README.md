# Xpenzi

Xpenzi is a Splitwise-style shared expense and budgeting web app built with Next.js 14, TypeScript, and pnpm workspaces. This stage sets up the monorepo structure, basic tooling, and containerization for local development.

## Prerequisites
- Node.js 20+ (`nvm use` reads `.nvmrc`)
- pnpm 8+
- Docker + Docker Compose (for Postgres + app)

## Getting Started
1. Install dependencies:
   ```bash
   pnpm install
   ```
2. Run the web app in development (http://localhost:3000):
   ```bash
   pnpm dev --filter @xpenzi/web
   ```

## Database Setup
Local Postgres via Docker Compose:
1. Start Postgres:
   ```bash
   docker compose -f deploy/docker-compose.yml up -d postgres
   ```
2. Set `DATABASE_URL` (see `apps/web/.env.example`):
   ```
   postgresql://postgres:postgres@localhost:5432/xpenzi?schema=public
   ```
3. Run migrations and seed from `apps/web`:
   ```bash
   pnpm --filter @xpenzi/web db:migrate
   pnpm --filter @xpenzi/web db:seed
   ```
4. Inspect data:
   ```bash
   pnpm --filter @xpenzi/web db:studio
   ```

If you prefer Supabase/Neon/etc., override `DATABASE_URL` with their connection string; Prisma will use it for migrate/seed.

## Docker Compose
To run Postgres and the web app together:
```bash
docker compose -f deploy/docker-compose.yml up --build
```
The app listens on port 3000 and connects to Postgres with the default credentials defined in the compose file.

## Scripts
- `pnpm dev --filter @xpenzi/web` – Next.js dev server
- `pnpm lint` – Lints the web app
- `pnpm typecheck` – TypeScript checks
- `pnpm build` – Builds the web app
- `pnpm start` – Starts the production server after building

## Project Structure
- `apps/web` – Next.js application (App Router)
- `deploy` – Docker Compose and nginx configs
- `.github/workflows` – CI workflow for lint/typecheck/build

## CI
GitHub Actions workflow (`.github/workflows/web.yml`) installs dependencies via pnpm and runs lint, typecheck, and build on pushes and pull requests.
