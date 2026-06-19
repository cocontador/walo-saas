/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockStoreFindUnique, mockProductFindMany } = vi.hoisted(() => ({
  mockStoreFindUnique: vi.fn(),
  mockProductFindMany: vi.fn(),
}))

vi.mock('@/lib/prisma', () => ({
  prisma: {
    store: { findUnique: mockStoreFindUnique },
    product: { findMany: mockProductFindMany },
  },
}))

import { getStoreBySlug, getVisibleProducts } from './queries'

describe('getStoreBySlug - WALO-33: Catálogo público por slug', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('debería retornar la tienda cuando el slug es válido y la tienda está activa', async () => {
    const mockStore = {
      id: 'store-1',
      name: 'Mi Tienda',
      slug: 'mi-tienda',
      description: 'Tienda de ropa',
      logoUrl: null,
      whatsappPhone: '+56912345678',
      isActive: true,
    }
    mockStoreFindUnique.mockResolvedValue(mockStore)

    const result = await getStoreBySlug('mi-tienda')

    expect(result).toEqual(mockStore)
  })

  it('debería retornar null para slug inexistente (404)', async () => {
    mockStoreFindUnique.mockResolvedValue(null)

    const result = await getStoreBySlug('slug-que-no-existe')

    // El caller debe llamar notFound() cuando esto es null
    expect(result).toBeNull()
  })

  it('debería retornar null cuando la tienda está inactiva', async () => {
    mockStoreFindUnique.mockResolvedValue({
      id: 'store-1',
      name: 'Mi Tienda',
      slug: 'mi-tienda',
      isActive: false,
    })

    const result = await getStoreBySlug('mi-tienda')

    // Tienda inactiva no se expone públicamente
    expect(result).toBeNull()
  })
})

describe('getVisibleProducts - WALO-33: Productos visibles por tienda', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('debería retornar solo productos visibles de la tienda solicitada', async () => {
    const mockProducts = [
      { id: 'prod-1', name: 'Camiseta', price: 10000, description: null, imageUrl: null, categories: [] },
      { id: 'prod-2', name: 'Pantalón', price: 25000, description: 'Jean azul', imageUrl: null, categories: [] },
    ]
    mockProductFindMany.mockResolvedValue(mockProducts)

    const result = await getVisibleProducts('store-1')

    expect(result).toEqual(mockProducts)
    // Solo consulta productos visibles del storeId dado — aislamiento de tenant
    expect(mockProductFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          storeId: 'store-1',
          visible: true,
        }),
      })
    )
  })

  it('debería retornar arreglo vacío cuando la tienda no tiene productos visibles', async () => {
    mockProductFindMany.mockResolvedValue([])

    const result = await getVisibleProducts('store-sin-productos')

    expect(result).toEqual([])
  })

  it('no debería mezclar productos de otras tiendas', async () => {
    mockProductFindMany.mockResolvedValue([])

    await getVisibleProducts('store-A')

    const callArg = mockProductFindMany.mock.calls[0][0]
    // El filtro de storeId nunca debe estar ausente
    expect(callArg.where.storeId).toBe('store-A')
  })
})
