# 1. Base image
FROM node:20-alpine AS base

# 2. Dependencies layer
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
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

# [AQUÍ ESTÁ LA SOLUCIÓN AL ERROR]
# Generar Prisma Client usando una URL dummy válida para que no dé error PrismaConfigEnvError
RUN DATABASE_URL="postgresql://dummy:dummy@dummy:5432/dummy" npx prisma generate

# Build Next.js application (no requerirá base de datos si usas llamadas API en Runtime o Fetch simples)
# Usamos un dummy de base de datos también por si algún componente servidor intenta evaluar código de db al compilar
RUN DATABASE_URL="postgresql://dummy:dummy@dummy:5432/dummy" npx next build

# 4. Production Run layer
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

# Uncomment the following line in case you want to disable telemetry during runtime.
# ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copiamos la carpeta de prisma para ejecutar migraciones/push en run-time
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

USER root
# Instalamos la CLI de prisma de manera global para que npx prisma db push funcione sin problemas en producción
RUN npm install -g prisma@7.4.2

USER nextjs

# Exponemos el puerto estandar por el que escuchará el proceso de Node.js adentro de Docker
EXPOSE 3003
# Seteamos PORT env variable en 3003
ENV PORT 3003
# set hostname to localhost
ENV HOSTNAME "0.0.0.0"

# Ejecutar prisma db push antes de arrancar la aplicación
CMD ["sh", "-c", "DATABASE_URL=\"$DATABASE_URL\" npx prisma db push --accept-data-loss && node server.js"]
