FROM node:22-slim AS base
# Prisma's schema engine (used by `migrate deploy`) links against OpenSSL.
RUN apt-get update -y && apt-get install -y --no-install-recommends openssl \
  && rm -rf /var/lib/apt/lists/*
COPY --from=oven/bun:1.3 /usr/local/bin/bun /usr/local/bin/bun
WORKDIR /app

FROM base AS build
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY . .
# prisma.config.ts reads DATABASE_URL; generate does not connect, so a placeholder is enough.
RUN DATABASE_URL=postgresql://build:build@localhost:5432/build bun run db:generate \
  && bun run build

FROM base AS runtime
ENV NODE_ENV=production
# The Prisma CLI is a devDependency but is needed at startup for migrations,
# so the full node_modules from the build stage is kept.
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package.json prisma.config.ts ./
COPY prisma ./prisma
EXPOSE 3000
CMD ["sh", "-c", "node_modules/.bin/prisma migrate deploy && exec node dist/main"]
