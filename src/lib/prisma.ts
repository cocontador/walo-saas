import { PrismaClient } from '../generated/prisma'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Le damos una URL de mentira segura para que el build funcione
const safeUrl = process.env.DATABASE_URL || "postgresql://dummy:dummy@localhost:5432/dummy";

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: safeUrl,
      },
    },
  } as any) // El "as any"  evita que TypeScript se queje de los tipos

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma