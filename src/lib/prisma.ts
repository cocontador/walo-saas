import "server-only"

import { Pool } from 'pg'
import { parse } from 'pg-connection-string'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

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

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
