import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockPrisma } = vi.hoisted(() => ({
  mockPrisma: {
    store: { findUnique: vi.fn() },
    product: { findMany: vi.fn() },
    storeMember: { findFirst: vi.fn() },
  },
}))

vi.mock('@/lib/prisma', () => ({ prisma: mockPrisma }))

import { getStoreBySlug, getVisibleProducts, canManageStoreByUser } from './queries'

describe('getStoreBySlug', () => {
  beforeEach(() => vi.clearAllMocks())

  it('devuelve la tienda si está activa', async () => {
    mockPrisma.store.findUnique.mockResolvedValue({
      id: 's1', name: 'Tienda', slug: 'tienda', isActive: true,
      description: null, logoUrl: null, whatsappPhone: null,
    })

    const result = await getStoreBySlug('tienda')

    expect(result).not.toBeNull()
    expect(result?.id).toBe('s1')
  })

  it('devuelve null si la tienda no existe', async () => {
    mockPrisma.store.findUnique.mockResolvedValue(null)

    const result = await getStoreBySlug('no-existe')

    expect(result).toBeNull()
  })

  it('devuelve null si la tienda existe pero está inactiva', async () => {
    mockPrisma.store.findUnique.mockResolvedValue({
      id: 's1', name: 'Inactiva', slug: 'inactiva', isActive: false,
      description: null, logoUrl: null, whatsappPhone: null,
    })

    const result = await getStoreBySlug('inactiva')

    expect(result).toBeNull()
  })
})

describe('getVisibleProducts', () => {
  beforeEach(() => vi.clearAllMocks())

  it('devuelve solo los productos visibles de la tienda', async () => {
    mockPrisma.product.findMany.mockResolvedValue([
      { id: 'p1', name: 'Producto', description: null, price: 1000, imageUrl: null, categories: [] },
    ])

    const result = await getVisibleProducts('s1')

    expect(result).toHaveLength(1)
    expect(mockPrisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ storeId: 's1', visible: true }),
      })
    )
  })

  it('filtra por storeId para no exponer productos de otras tiendas', async () => {
    mockPrisma.product.findMany.mockResolvedValue([])

    await getVisibleProducts('s1')

    const callArgs = mockPrisma.product.findMany.mock.calls[0][0]
    expect(callArgs.where.storeId).toBe('s1')
    expect(callArgs.where.visible).toBe(true)
  })
})

describe('canManageStoreByUser', () => {
  beforeEach(() => vi.clearAllMocks())

  it('devuelve true si el usuario es OWNER de la tienda', async () => {
    mockPrisma.storeMember.findFirst.mockResolvedValue({ id: 'm1' })

    const result = await canManageStoreByUser('s1', 'u1')

    expect(result).toBe(true)
  })

  it('devuelve false si el usuario no tiene membresía OWNER', async () => {
    mockPrisma.storeMember.findFirst.mockResolvedValue(null)

    const result = await canManageStoreByUser('s1', 'u-otro')

    expect(result).toBe(false)
  })
})
