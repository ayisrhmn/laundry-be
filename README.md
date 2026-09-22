# Laundry Management API

A REST API for managing a laundry business — customers, service catalog, orders
with automatic discount rules, and dashboard metrics. Built with
[NestJS](https://nestjs.com/) and PostgreSQL.

## Tech Stack

| Area           | Choice                                    |
| -------------- | ----------------------------------------- |
| Runtime        | Node.js (bun as package manager)          |
| Framework      | NestJS 11                                  |
| Database       | PostgreSQL                                 |
| ORM            | Prisma 7 (with the `@prisma/adapter-pg` driver adapter) |
| Auth           | JWT (Passport) with role-based access      |
| Validation     | class-validator / class-transformer        |
| API docs       | Swagger (OpenAPI)                          |
| Security       | Helmet, CORS, rate limiting (Throttler)    |

## Features

- **Authentication & roles** — JWT login/register; every endpoint is protected by
  default. Two roles: `ADMIN` and `OPERATOR` (cashier).
- **Customers** — CRUD with soft delete and a per-customer transaction counter.
- **Services** — laundry service catalog (price per unit).
- **Orders** — multi-item orders with per-day sequential numbers
  (`ORD-YYYYMMDD-NNN`), payment/order status tracking, and discount handling.
- **Discount rules** — automatic discounts matched by a customer's transaction
  count (one-off or repeatable), with an optional maximum discount cap; manual
  discounts are also supported per order.
- **Dashboard** — revenue, order, discount, and top customer/service metrics.
- **Consistent responses** — a uniform `{ message, status, data }` envelope
  (with `pagination` on list endpoints) and centralized error formatting.

## Getting Started

### Prerequisites

- [bun](https://bun.sh/)
- A running PostgreSQL instance

### Setup

```bash
bun install
cp .env.example .env      # then fill in the values below
bun run db:migrate        # create the schema
bun run start:dev
```

The API runs on `http://localhost:<PORT>` with a global `/api` prefix.
Interactive API docs are served at `http://localhost:<PORT>/docs`.

### Environment variables

| Variable         | Description                                                  |
| ---------------- | ------------------------------------------------------------ |
| `PORT`           | Port the API listens on.                                     |
| `DATABASE_URL`   | PostgreSQL connection string.                                |
| `JWT_SECRET`     | Secret used to sign JWTs (use a long random string).         |
| `JWT_EXPIRES_IN` | Token lifetime, e.g. `1d`.                                   |
| `CORS_ORIGIN`    | Allowed frontend origin(s), comma-separated.                 |

## Scripts

```bash
# Development
bun run start:dev        # watch mode
bun run start:prod       # run the compiled build
bun run build            # compile to dist/

# Code quality
bun run lint             # ESLint (auto-fix)
bun run format           # Prettier

# Database (Prisma)
bun run db:migrate       # create & apply a migration (local)
bun run db:deploy        # apply migrations (CI/production)
bun run db:reset         # reset the database (destructive)
bun run db:studio        # open Prisma Studio
bun run db:generate      # regenerate the Prisma client
```

## Project Structure

```
src/
  auth/            Authentication, JWT strategy, login/register
  users/           User management (ADMIN/OPERATOR accounts)
  customers/       Customer CRUD
  services/        Laundry service catalog
  orders/          Orders and order items
  discount-rules/  Discount rule configuration
  dashboard/       Aggregated business metrics
  common/          Shared guards, interceptors, filters, decorators, DTOs
  prisma/          Prisma client provider
prisma/            Schema and migrations
```

## API Documentation

Once the server is running, open **`/docs`** for the full Swagger UI. Endpoints
require a Bearer token except `POST /api/auth/register`, `POST /api/auth/login`,
and `GET /api/health`.
