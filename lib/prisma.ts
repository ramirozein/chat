import 'dotenv/config'
import { PrismaClient } from '../generated/prisma/client/client'
import { PrismaPg } from '@prisma/adapter-pg'

// Singleton de Prisma para evitar múltiples conexiones en desarrollo
const globalParaPrisma = globalThis as unknown as { prisma: PrismaClient }

function crearPrismaClient(): PrismaClient {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
  })
  return new PrismaClient({ adapter })
}

export const prisma = globalParaPrisma.prisma || crearPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalParaPrisma.prisma = prisma
}
