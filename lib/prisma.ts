import { PrismaClient } from '@prisma/client'

// Singleton de Prisma para evitar múltiples conexiones en desarrollo
const globalParaPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma = globalParaPrisma.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalParaPrisma.prisma = prisma
}
