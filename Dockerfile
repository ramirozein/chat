# 1. Base image
FROM node:20-alpine AS base

# 2. Dependencies layer
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Enable corepack and pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy dependencies files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml* ./
RUN pnpm install --frozen-lockfile

# 3. Build layer
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generar Prisma Client (prisma.config.ts necesita DATABASE_URL para cargar)
RUN DATABASE_URL="postgresql://dummy:dummy@dummy:5432/dummy" npx prisma generate

# Build Next.js (standalone output)
RUN DATABASE_URL="postgresql://dummy:dummy@dummy:5432/dummy" npx next build

# 4. Production Run layer
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copiar node_modules completos (necesarios para tsx, socket.io, prisma, etc.)
COPY --from=deps --chown=nextjs:nodejs /app/node_modules ./node_modules

# Copiar el build de Next.js standalone y archivos estáticos
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Copiar el servidor personalizado y archivos necesarios
COPY --from=builder --chown=nextjs:nodejs /app/server.ts ./
COPY --from=builder --chown=nextjs:nodejs /app/lib ./lib
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./
COPY --from=builder --chown=nextjs:nodejs /app/next.config.ts ./
COPY --from=builder --chown=nextjs:nodejs /app/tsconfig.json ./

# Copiar Prisma Client generado
COPY --from=builder --chown=nextjs:nodejs /app/generated ./generated

# Copiar configuración de Prisma para db push
COPY --from=builder --chown=nextjs:nodejs /app/prisma.config.ts ./
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

USER nextjs

# Puerto de la aplicación
EXPOSE 3003
ENV PORT 3003
ENV HOSTNAME "0.0.0.0"

# Ejecutar prisma db push y luego arrancar el servidor personalizado con Socket.IO
CMD ["sh", "-c", "npx prisma db push --accept-data-loss && npx tsx server.ts"]
