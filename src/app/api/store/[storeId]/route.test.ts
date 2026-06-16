import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

const { mockPrisma } = vi.hoisted(() => ({
  mockPrisma: {
    storeMember: { findFirst: vi.fn() },
    store: { findFirst: vi.fn(), update: vi.fn() },
  },
}))

vi.mock('next-auth', () => ({
  getServerSession: vi.fn(),
}))

vi.mock('@/lib/prisma', () => ({
  prisma: mockPrisma,
}))

import { getServerSession } from 'next-auth'
import type { Session } from 'next-auth'
import { PATCH, PUT, DELETE } from './route'

function makeRequest(body?: unknown, storeId = 'store-1') {
  return {
    req: new NextRequest('http://localhost/api/store/' + storeId, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    }),
    params: Promise.resolve({ storeId }),
  }
}

const validPayload = { name: 'Mi Tienda', slug: 'mi-tienda', description: null, whatsappPhone: null }

describe('/api/store/[storeId]', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // --- PATCH ---

  it('PATCH devuelve 401 sin sesión', async () => {
    vi.mocked(getServerSession).mockResolvedValue(null)
    const { req, params } = makeRequest(validPayload)

    const res = await PATCH(req, { params })

    expect(res.status).toBe(401)
  })

  it('PATCH devuelve 403 si el usuario no es OWNER de la tienda (anti-IDOR)', async () => {
    vi.mocked(getServerSession).mockResolvedValue({ user: { id: 'user-1' } } as unknown as Session)
    mockPrisma.storeMember.findFirst.mockResolvedValue(null)
    const { req, params } = makeRequest(validPayload)

    const res = await PATCH(req, { params })

    expect(res.status).toBe(403)
  })

  it('PATCH devuelve 400 con payload inválido (Zod)', async () => {
    vi.mocked(getServerSession).mockResolvedValue({ user: { id: 'user-1' } } as unknown as Session)
    mockPrisma.storeMember.findFirst.mockResolvedValue({ id: 'member-1', role: 'OWNER' })
    const { req, params } = makeRequest({ name: 'x', slug: '!!slug inválido!!' })

    const res = await PATCH(req, { params })

    expect(res.status).toBe(400)
  })

  it('PATCH devuelve 409 si el slug ya está en uso por otra tienda', async () => {
    vi.mocked(getServerSession).mockResolvedValue({ user: { id: 'user-1' } } as unknown as Session)
    mockPrisma.storeMember.findFirst.mockResolvedValue({ id: 'member-1', role: 'OWNER' })
    mockPrisma.store.findFirst.mockResolvedValue({ id: 'store-otra' })
    const { req, params } = makeRequest(validPayload)

    const res = await PATCH(req, { params })

    expect(res.status).toBe(409)
  })

  it('PATCH actualiza la tienda y devuelve 200', async () => {
    vi.mocked(getServerSession).mockResolvedValue({ user: { id: 'user-1' } } as unknown as Session)
    mockPrisma.storeMember.findFirst.mockResolvedValue({ id: 'member-1', role: 'OWNER' })
    mockPrisma.store.findFirst.mockResolvedValue(null)
    mockPrisma.store.update.mockResolvedValue({ id: 'store-1', ...validPayload })
    const { req, params } = makeRequest(validPayload)

    const res = await PATCH(req, { params })

    expect(res.status).toBe(200)
  })

  // --- DELETE ---

  it('DELETE devuelve 401 sin sesión', async () => {
    vi.mocked(getServerSession).mockResolvedValue(null)
    const req = new NextRequest('http://localhost/api/store/store-1', { method: 'DELETE' })

    const res = await DELETE(req, { params: Promise.resolve({ storeId: 'store-1' }) })

    expect(res.status).toBe(401)
  })

  it('DELETE devuelve 403 si el usuario no es OWNER (anti-IDOR)', async () => {
    vi.mocked(getServerSession).mockResolvedValue({ user: { id: 'user-1' } } as unknown as Session)
    mockPrisma.storeMember.findFirst.mockResolvedValue(null)
    const req = new NextRequest('http://localhost/api/store/store-1', { method: 'DELETE' })

    const res = await DELETE(req, { params: Promise.resolve({ storeId: 'store-1' }) })

    expect(res.status).toBe(403)
  })

  it('DELETE desactiva la tienda (isActive: false) y devuelve 200', async () => {
    vi.mocked(getServerSession).mockResolvedValue({ user: { id: 'user-1' } } as unknown as Session)
    mockPrisma.storeMember.findFirst.mockResolvedValue({ id: 'member-1', role: 'OWNER' })
    mockPrisma.store.update.mockResolvedValue({ id: 'store-1', isActive: false })
    const req = new NextRequest('http://localhost/api/store/store-1', { method: 'DELETE' })

    const res = await DELETE(req, { params: Promise.resolve({ storeId: 'store-1' }) })

    expect(res.status).toBe(200)
    expect(mockPrisma.store.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { isActive: false } })
    )
  })

  // --- PUT ---

  it('PUT devuelve 401 sin sesión', async () => {
    vi.mocked(getServerSession).mockResolvedValue(null)
    const req = new NextRequest('http://localhost/api/store/store-1', { method: 'PUT' })

    const res = await PUT(req, { params: Promise.resolve({ storeId: 'store-1' }) })

    expect(res.status).toBe(401)
  })

  it('PUT devuelve 403 si el usuario no es OWNER (anti-IDOR)', async () => {
    vi.mocked(getServerSession).mockResolvedValue({ user: { id: 'user-1' } } as unknown as Session)
    mockPrisma.storeMember.findFirst.mockResolvedValue(null)
    const req = new NextRequest('http://localhost/api/store/store-1', { method: 'PUT' })

    const res = await PUT(req, { params: Promise.resolve({ storeId: 'store-1' }) })

    expect(res.status).toBe(403)
  })

  it('PUT reactiva la tienda (isActive: true) y devuelve 200', async () => {
    vi.mocked(getServerSession).mockResolvedValue({ user: { id: 'user-1' } } as unknown as Session)
    mockPrisma.storeMember.findFirst.mockResolvedValue({ id: 'member-1', role: 'OWNER' })
    mockPrisma.store.update.mockResolvedValue({ id: 'store-1', isActive: true })
    const req = new NextRequest('http://localhost/api/store/store-1', { method: 'PUT' })

    const res = await PUT(req, { params: Promise.resolve({ storeId: 'store-1' }) })

    expect(res.status).toBe(200)
    expect(mockPrisma.store.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { isActive: true } })
    )
  })
})
