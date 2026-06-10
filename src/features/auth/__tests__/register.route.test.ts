import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

const mockPrisma = {
  user: {
    findUnique: vi.fn(),
  },
  store: {
    findUnique: vi.fn(),
  },
  $transaction: vi.fn(),
}

vi.mock('@/lib/prisma', () => ({
  prisma: mockPrisma,
}))
vi.mock('bcryptjs', () => {
  const hashMock = vi.fn().mockResolvedValue('hashed-password')
  return {
    default: {
      hash: hashMock,
    },
    hash: hashMock,
  }
})

import { POST } from '@/app/api/auth/register/route'

function buildRequest(body: Record<string, unknown>) {
  return new NextRequest('http://localhost/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'content-type': 'application/json' },
  })
}

describe('register route', () => {
  beforeEach(() => {
    mockPrisma.user.findUnique.mockReset()
    mockPrisma.store.findUnique.mockReset()
    mockPrisma.$transaction.mockReset()
  })

  it('rechaza la creación de tienda sin aceptación de términos', async () => {
    const request = buildRequest({
      name: 'María',
      storeName: 'Tienda Demo',
      email: 'maria@example.com',
      password: '123456',
      acceptedTerms: false,
    })

    const response = await POST(request)
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body.error).toBe('Debes aceptar los Términos y Condiciones para crear tu tienda.')
  })

  it('crea tienda con acceptedTerms true y persiste acceptedTermsAt', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null)
    mockPrisma.store.findUnique.mockResolvedValue(null)
    mockPrisma.$transaction.mockResolvedValue({
      user: { id: 'user-1', name: 'María', email: 'maria@example.com' },
      store: { id: 'store-1', slug: 'tienda-demo', name: 'Tienda Demo' },
    })

    const request = buildRequest({
      name: 'María',
      storeName: 'Tienda Demo',
      email: 'maria@example.com',
      password: '123456',
      acceptedTerms: true,
    })

    const response = await POST(request)
    const body = await response.json()

    expect(response.status).toBe(201)
    expect(body.store).toEqual({ id: 'store-1', slug: 'tienda-demo', name: 'Tienda Demo' })
    expect(mockPrisma.$transaction).toHaveBeenCalledOnce()
  })
})
