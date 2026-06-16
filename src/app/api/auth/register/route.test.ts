import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

const { mockPrisma } = vi.hoisted(() => ({
  mockPrisma: {
    user: { findUnique: vi.fn(), create: vi.fn() },
    store: { findUnique: vi.fn(), create: vi.fn() },
    $transaction: vi.fn(),
  },
}))

vi.mock('@/lib/prisma', () => ({ prisma: mockPrisma }))

import { POST } from './route'

function makeRequest(body: unknown) {
  return new NextRequest('http://localhost/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

const validBody = {
  name: 'Ana Torres',
  storeName: 'Tienda Ana',
  email: 'ana@ejemplo.com',
  password: 'secreta123',
}

describe('/api/auth/register', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('crea usuario y tienda, devuelve 201', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null)
    mockPrisma.store.findUnique.mockResolvedValue(null)
    mockPrisma.$transaction.mockImplementation(async (cb: (tx: typeof mockPrisma) => Promise<unknown>) =>
      cb(mockPrisma)
    )
    mockPrisma.user.create.mockResolvedValue({ id: 'u1', email: 'ana@ejemplo.com', name: 'Ana Torres' })
    mockPrisma.store.create.mockResolvedValue({ id: 's1', slug: 'tienda-ana', name: 'Tienda Ana' })

    const res = await POST(makeRequest(validBody))
    const data = await res.json()

    expect(res.status).toBe(201)
    expect(data.message).toBe('Cuenta creada exitosamente.')
    expect(data.user.email).toBe('ana@ejemplo.com')
  })

  it('normaliza el email a minúsculas antes de buscar/crear', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null)
    mockPrisma.store.findUnique.mockResolvedValue(null)
    mockPrisma.$transaction.mockImplementation(async (cb: (tx: typeof mockPrisma) => Promise<unknown>) =>
      cb(mockPrisma)
    )
    mockPrisma.user.create.mockResolvedValue({ id: 'u1', email: 'ana@ejemplo.com', name: 'Ana Torres' })
    mockPrisma.store.create.mockResolvedValue({ id: 's1', slug: 'tienda-ana', name: 'Tienda Ana' })

    // Zod valida el email antes de normalizar, así que enviamos uppercase sin espacios
    await POST(makeRequest({ ...validBody, email: 'ANA@EJEMPLO.COM' }))

    expect(mockPrisma.user.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { email: 'ana@ejemplo.com' } })
    )
  })

  it('devuelve 201 con mensaje genérico si el correo ya existe (anti-enumeración)', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({ id: 'u-existente' })

    const res = await POST(makeRequest(validBody))
    const data = await res.json()

    expect(res.status).toBe(201)
    expect(data.message).toBeDefined()
    // No debe confirmar que el email existe
    expect(JSON.stringify(data)).not.toContain('correo')
    expect(JSON.stringify(data)).not.toContain('existe')
    expect(mockPrisma.$transaction).not.toHaveBeenCalled()
  })

  it('devuelve 400 con payload inválido (Zod)', async () => {
    const res = await POST(makeRequest({ name: 'x', storeName: '', email: 'no-es-email', password: '123' }))

    expect(res.status).toBe(400)
    expect(mockPrisma.user.findUnique).not.toHaveBeenCalled()
  })

  it('devuelve 429 si se superan los intentos por IP', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null)
    mockPrisma.store.findUnique.mockResolvedValue(null)
    mockPrisma.$transaction.mockResolvedValue(null)
    mockPrisma.user.create.mockResolvedValue({ id: 'u1', email: 'a@b.com', name: 'A' })
    mockPrisma.store.create.mockResolvedValue({ id: 's1', slug: 'a', name: 'A' })

    // La IP "test-rate-limit" no se ha usado antes, consumimos los 5 intentos permitidos
    const headers = { 'Content-Type': 'application/json', 'x-forwarded-for': '10.0.0.99' }
    for (let i = 0; i < 5; i++) {
      await POST(new NextRequest('http://localhost/api/auth/register', {
        method: 'POST', headers, body: JSON.stringify(validBody),
      }))
    }

    // El 6.º intento debe ser rechazado
    const res = await POST(new NextRequest('http://localhost/api/auth/register', {
      method: 'POST', headers, body: JSON.stringify(validBody),
    }))

    expect(res.status).toBe(429)
  })
})
