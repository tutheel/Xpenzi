## Xpenzi Monorepo (Stage 0 Scaffolding)

Xpenzi is a Splitwise-inspired SaaS with AI budgeting insights, optimized for serverless AWS and Vercel delivery. Stage 0 establishes the monorepo scaffolding, tooling, and CI so future stages can layer in domain features.

### Workspace Layout

- `apps/web` – Next.js App Router + Tailwind + shadcn-style tokens, Clerk wiring, Vitest setup.
- `services` – Lambda TypeScript starter with Powertools logger, zod validation, esbuild bundling.
- `packages/api-client` – Typed fetch SDK scaffold with zod response validation.
- `packages/db` – Prisma schema and scripts for Postgres (Neon/Supabase/Aurora ready).
- `infra/terraform` – Terraform root module stubs with AWS + random providers and remote state placeholders.
- `.github/workflows` – CI pipelines for web, lambdas, and DB migrations.

### Toolchain

- Node 20.x, pnpm workspaces, turborepo pipelines.
- ESLint (TypeScript strict), Prettier, Vitest for unit tests.
- Docker Compose for Postgres + Localstack + Mailhog in local development.
- Structured JSON logging via AWS Powertools logger in Lambdas.

### Getting Started

1. Install dependencies:
   ```bash
   pnpm install
   ```
2. Start local services (Postgres, Localstack, Mailhog):
   ```bash
   docker-compose up -d
   ```
3. Run the Next.js app:
   ```bash
   pnpm dev:web
   ```
4. Run Lambda offline harness (invokes sample handler):
   ```bash
   pnpm dev:lambdas:offline
   ```

### Quality Gates

- `pnpm lint` – Lints all workspaces via ESLint.
- `pnpm test` – Executes Vitest suites across packages/apps/services.
- `pnpm build` – Runs build pipeline (Next build, tsc builds, esbuild bundle, Prisma generate).
- `pnpm format:check` – Ensures Prettier formatting compliance.

### Database Workflow

- Configure `.env`/`.env.local` from the provided `.env.example` files.
- Generate Prisma client:
  ```bash
  pnpm --filter db prisma:generate
  ```
- Apply migrations (placeholder command until migration files are added):
  ```bash
  pnpm --filter db migrate:dev
  ```
- Seed (Stage 0 placeholder ping):
  ```bash
  pnpm seed
  ```

### Infrastructure Notes

- Terraform backend placeholders expect you to supply remote state bucket/table variables.
- CI workflows lint, test, and build on pushes/PRs; secrets (Clerk, Stripe, etc.) must be configured via GitHub/Vercel.

### Next Steps

- Flesh out domain-specific pages and API routes.
- Expand Lambda services per module prompt.
- Implement Prisma migrations + seeds for core data model.
- Wire CI artifacts to deployment targets (Vercel + AWS).
