FROM node:20-alpine AS base

FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml* ./
RUN pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN DATABASE_URL="postgresql://dummy:dummy@dummy:5432/dummy" npx prisma generate
RUN DATABASE_URL="postgresql://dummy:dummy@dummy:5432/dummy" npx next build

FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=deps --chown=nextjs:nodejs /app/node_modules ./node_modules

COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

COPY --from=builder --chown=nextjs:nodejs /app/server.ts ./
COPY --from=builder --chown=nextjs:nodejs /app/lib ./lib
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./
COPY --from=builder --chown=nextjs:nodejs /app/next.config.ts ./
COPY --from=builder --chown=nextjs:nodejs /app/tsconfig.json ./

COPY --from=builder --chown=nextjs:nodejs /app/generated ./generated

COPY --from=builder --chown=nextjs:nodejs /app/prisma.config.ts ./
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

USER nextjs

# Puerto de la aplicación
EXPOSE 3003
ENV PORT 3003
ENV HOSTNAME "0.0.0.0"

CMD ["sh", "-c", "npx prisma db push --accept-data-loss && npx tsx prisma/seed-bot.ts && npx tsx server.ts"]
