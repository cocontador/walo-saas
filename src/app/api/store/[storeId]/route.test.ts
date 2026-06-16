/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

const { mockGetServerSession, mockStoreMemberFindFirst, mockStoreFindFirst, mockStoreUpdate } = vi.hoisted(() => ({
  mockGetServerSession: vi.fn(),
  mockStoreMemberFindFirst: vi.fn(),
  mockStoreFindFirst: vi.fn(),
  mockStoreUpdate: vi.fn(),
}))

vi.mock('next-auth', () => ({ getServerSession: mockGetServerSession }))
vi.mock('@/server/auth', () => ({ authOptions: {} }))
vi.mock('@/lib/prisma', () => ({
  prisma: {
    storeMember: { findFirst: mockStoreMemberFindFirst },
    store: { findFirst: mockStoreFindFirst, update: mockStoreUpdate },
  },
}))

import { PATCH, DELETE, PUT } from './route'

function makeRequest(method: string, body: object) {
  return new NextRequest(`http://localhost/api/store/store-1`, {
    method,
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })
}

const params = Promise.resolve({ storeId: 'store-1' })

describe('PATCH /api/store/[storeId] - WALO-18: Edición de tienda', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('debería actualizar la tienda cuando los datos son válidos', async () => {
    mockGetServerSession.mockResolvedValue({ user: { id: 'user-1' } })
    mockStoreMemberFindFirst.mockResolvedValue({ id: 'member-1', role: 'OWNER' })
    mockStoreFindFirst.mockResolvedValue(null) // slug no duplicado
    mockStoreUpdate.mockResolvedValue({ id: 'store-1', name: 'Tienda Actualizada', slug: 'tienda-actualizada' })

    const req = makeRequest('PATCH', { name: 'Tienda Actualizada', slug: 'tienda-actualizada' })
    const res = await PATCH(req, { params })

    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.store).toBeDefined()
  })

  it('debería rechazar la edición sin sesión activa (401)', async () => {
    mockGetServerSession.mockResolvedValue(null)

    const req = makeRequest('PATCH', { name: 'Tienda', slug: 'tienda' })
    const res = await PATCH(req, { params })

    expect(res.status).toBe(401)
  })

  it('debería rechazar edición de tienda ajena (403)', async () => {
    mockGetServerSession.mockResolvedValue({ user: { id: 'user-1' } })
    // No hay membresía — usuario no pertenece a esta tienda
    mockStoreMemberFindFirst.mockResolvedValue(null)

    const req = makeRequest('PATCH', { name: 'Tienda', slug: 'tienda' })
    const res = await PATCH(req, { params })

    expect(res.status).toBe(403)
  })

  it('debería rechazar campos inválidos (400)', async () => {
    mockGetServerSession.mockResolvedValue({ user: { id: 'user-1' } })
    mockStoreMemberFindFirst.mockResolvedValue({ id: 'member-1', role: 'OWNER' })

    // Nombre demasiado corto (min 2 chars)
    const req = makeRequest('PATCH', { name: 'A', slug: 'tienda' })
    const res = await PATCH(req, { params })

    expect(res.status).toBe(400)
  })
})

describe('PATCH /api/store/[storeId] - WALO-19: Validación de slug', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('debería rechazar slug duplicado (409)', async () => {
    mockGetServerSession.mockResolvedValue({ user: { id: 'user-1' } })
    mockStoreMemberFindFirst.mockResolvedValue({ id: 'member-1', role: 'OWNER' })
    // Otro store ya usa ese slug
    mockStoreFindFirst.mockResolvedValue({ id: 'otro-store' })

    const req = makeRequest('PATCH', { name: 'Mi Tienda', slug: 'slug-en-uso' })
    const res = await PATCH(req, { params })

    expect(res.status).toBe(409)
    const data = await res.json()
    expect(data.error).toContain('slug')
  })

  it('debería aceptar slug único', async () => {
    mockGetServerSession.mockResolvedValue({ user: { id: 'user-1' } })
    mockStoreMemberFindFirst.mockResolvedValue({ id: 'member-1', role: 'OWNER' })
    mockStoreFindFirst.mockResolvedValue(null) // slug libre
    mockStoreUpdate.mockResolvedValue({ id: 'store-1', slug: 'slug-libre' })

    const req = makeRequest('PATCH', { name: 'Mi Tienda', slug: 'slug-libre' })
    const res = await PATCH(req, { params })

    expect(res.status).toBe(200)
  })

  it('debería rechazar slug con espacios (formato inválido)', async () => {
    mockGetServerSession.mockResolvedValue({ user: { id: 'user-1' } })
    mockStoreMemberFindFirst.mockResolvedValue({ id: 'member-1', role: 'OWNER' })

    const req = makeRequest('PATCH', { name: 'Mi Tienda', slug: 'slug con espacios' })
    const res = await PATCH(req, { params })

    expect(res.status).toBe(400)
  })
})

describe('PATCH /api/store/[storeId] - WALO-20: Campo WhatsApp', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('debería guardar el número de WhatsApp cuando se provee', async () => {
    mockGetServerSession.mockResolvedValue({ user: { id: 'user-1' } })
    mockStoreMemberFindFirst.mockResolvedValue({ id: 'member-1', role: 'OWNER' })
    mockStoreFindFirst.mockResolvedValue(null)
    mockStoreUpdate.mockResolvedValue({ id: 'store-1', whatsappPhone: '+56912345678' })

    const req = makeRequest('PATCH', {
      name: 'Mi Tienda',
      slug: 'mi-tienda',
      whatsappPhone: '+56912345678',
    })
    const res = await PATCH(req, { params })

    expect(res.status).toBe(200)
    expect(mockStoreUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ whatsappPhone: '+56912345678' }),
      })
    )
  })

  it('debería permitir guardar la tienda sin número de WhatsApp (opcional)', async () => {
    mockGetServerSession.mockResolvedValue({ user: { id: 'user-1' } })
    mockStoreMemberFindFirst.mockResolvedValue({ id: 'member-1', role: 'OWNER' })
    mockStoreFindFirst.mockResolvedValue(null)
    mockStoreUpdate.mockResolvedValue({ id: 'store-1', whatsappPhone: null })

    const req = makeRequest('PATCH', { name: 'Mi Tienda', slug: 'mi-tienda' })
    const res = await PATCH(req, { params })

    expect(res.status).toBe(200)
  })
})

describe('DELETE /api/store/[storeId] - WALO-21: Desactivación de tienda', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('debería desactivar la tienda (isActive: false)', async () => {
    mockGetServerSession.mockResolvedValue({ user: { id: 'user-1' } })
    mockStoreMemberFindFirst.mockResolvedValue({ id: 'member-1', role: 'OWNER' })
    mockStoreUpdate.mockResolvedValue({ id: 'store-1', isActive: false })

    const req = new NextRequest('http://localhost/api/store/store-1', { method: 'DELETE' })
    const res = await DELETE(req, { params })

    expect(res.status).toBe(200)
    expect(mockStoreUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'store-1' },
        data: { isActive: false },
      })
    )
  })

  it('debería rechazar desactivación de tienda ajena (403)', async () => {
    mockGetServerSession.mockResolvedValue({ user: { id: 'user-1' } })
    mockStoreMemberFindFirst.mockResolvedValue(null)

    const req = new NextRequest('http://localhost/api/store/store-1', { method: 'DELETE' })
    const res = await DELETE(req, { params })

    expect(res.status).toBe(403)
    expect(mockStoreUpdate).not.toHaveBeenCalled()
  })
})

describe('PUT /api/store/[storeId] - WALO-22: Reactivación de tienda', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('debería reactivar la tienda (isActive: true)', async () => {
    mockGetServerSession.mockResolvedValue({ user: { id: 'user-1' } })
    mockStoreMemberFindFirst.mockResolvedValue({ id: 'member-1', role: 'OWNER' })
    mockStoreUpdate.mockResolvedValue({ id: 'store-1', isActive: true })

    const req = new NextRequest('http://localhost/api/store/store-1', { method: 'PUT' })
    const res = await PUT(req, { params })

    expect(res.status).toBe(200)
    expect(mockStoreUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'store-1' },
        data: { isActive: true },
      })
    )
  })

  it('debería rechazar reactivación sin sesión activa (401)', async () => {
    mockGetServerSession.mockResolvedValue(null)

    const req = new NextRequest('http://localhost/api/store/store-1', { method: 'PUT' })
    const res = await PUT(req, { params })

    expect(res.status).toBe(401)
    expect(mockStoreUpdate).not.toHaveBeenCalled()
  })
})
