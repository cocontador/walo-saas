import "server-only"

import { Pool } from 'pg'
import { parse } from 'pg-connection-string'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL

  if (!connectionString) {
    throw new Error('DATABASE_URL is not defined')
  }

  // pg-connection-string v3 trata sslmode=require como verify-full (rechaza certs auto-firmados).
  // Parseamos la URL y controlamos SSL directamente en el Pool para permitir managed DBs
  // como DigitalOcean que usan su propia CA.
  const { host, port, user, password, database } = parse(connectionString)
  const needsSsl = connectionString.includes('ssl')

  const pool = new Pool({
    host: host ?? undefined,
    port: port ? Number(port) : undefined,
    user: user ?? undefined,
    password: password ?? undefined,
    database: database ?? undefined,
    ssl: needsSsl ? { rejectUnauthorized: false } : false,
  })

  const adapter = new PrismaPg(pool)

  return new PrismaClient({ adapter })
}

function getPrisma(): PrismaClient {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient()
  }
  return globalForPrisma.prisma
}

// Inicialización perezosa: el cliente real (y la validación de DATABASE_URL) solo se
// crea en el primer acceso a una propiedad, no al importar el módulo. Esto evita que
// `next build` falle al evaluar módulos durante "Collecting page data", cuando aún no
// existe DATABASE_URL (se inyecta en runtime vía env_file).
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    const client = getPrisma()
    const value = Reflect.get(client, prop, receiver)
    return typeof value === 'function' ? value.bind(client) : value
  },
})
