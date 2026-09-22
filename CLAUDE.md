# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

NestJS 11 REST API for a laundry business (customers, services, orders, discount
rules, dashboard metrics). PostgreSQL via Prisma 7. Package manager is **bun**
(`bun.lock`).

## Commands

```bash
bun install
bun run start:dev        # watch mode, the usual dev command
bun run start:prod       # runs dist/main (build first)
bun run build            # nest build

bun run lint             # eslint --fix over src
bun run format           # prettier --write over src

bun run db:migrate       # prisma migrate dev (create + apply a migration locally)
bun run db:deploy        # prisma migrate deploy (apply migrations, no prompts)
bun run db:reset         # drop + re-migrate the DB (destructive)
bun run db:studio        # Prisma Studio GUI
bun run db:generate      # regenerate Prisma client after schema changes
```

There is **no test runner configured** (no jest, no `test` script). Don't invent
`bun run test`; verify changes with `npx tsc --noEmit` and manual/API testing.

After editing `prisma/schema.prisma`, run `db:migrate` then `db:generate`.

## Environment

`.env` (see `.env.example`): `PORT`, `DATABASE_URL` (Postgres), `JWT_SECRET`,
`JWT_EXPIRES_IN`, `CORS_ORIGIN` (comma-separated origins of the **frontend**, not
this API). The server sets a global `api` prefix and serves Swagger.

## Architecture

Feature-module layout: each domain (`auth`, `users`, `customers`, `services`,
`orders`, `discount-rules`, `dashboard`) is a Nest module with
controller + service + `dto/`. Cross-cutting code lives in `common/`.

**Everything is authenticated by default.** Three global guards run in order
(`app.module.ts`): `JwtAuthGuard` → `RolesGuard` → `ThrottlerGuard` (60 req/60s).
To change access on a handler or controller:
- `@Public()` — skip auth entirely (e.g. login/register).
- `@Roles(UserRole.ADMIN, UserRole.OPERATOR)` — restrict to roles. Roles are only
  `ADMIN` and `OPERATOR`; **OPERATOR is the cashier role** (there is no "kasir"
  role). Most write endpoints allow both.

**Uniform response envelope.** `ResponseInterceptor` wraps every response as
`{ message, status, data }`, and as `{ message, status, data, pagination }` when
a service returns a `PaginatedResult` (detected by a `pagination` key — see
`common/dto/paginated.dto.ts`). Set the message with `@ResponseMessage('...')`.
Errors are shaped by `HttpExceptionFilter`. Services return plain data/DTOs and
let the interceptor do the wrapping — don't hand-build the envelope.

**Prisma 7 requires a driver adapter.** `PrismaService` constructs
`PrismaClient` with `new PrismaPg({ connectionString: DATABASE_URL })`. Any
standalone script that news up a `PrismaClient` must pass the same adapter or it
throws at construction. Inject `PrismaService` in app code.

## Domain conventions

- **Soft deletes:** several models have `deletedAt`. "Deleting" sets `deletedAt`;
  it does not remove the row. Read queries must filter `deletedAt: null`, and be
  aware FK relations use `onDelete: Restrict` — a soft-deleted parent still
  blocks a real DELETE of itself.
- **Money is stored as integers** (whole rupiah). Discount math floors with
  `Math.floor`. An order's discount is either `MANUAL` or an auto-matched
  `DiscountRule` (`discountSource`), with optional `maxDiscountAmount` clamp.
- **Order numbers** are `ORD-YYYYMMDD-NNN`, sequential per day. Generation must
  stay inside the create transaction, count including soft-deleted orders (so a
  number is never reused), and retry on a unique collision — see
  `orders.service.ts`.
