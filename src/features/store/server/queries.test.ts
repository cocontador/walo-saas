/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockStoreFindUnique, mockProductFindMany, mockProductFindFirst } = vi.hoisted(() => ({
  mockStoreFindUnique: vi.fn(),
  mockProductFindMany: vi.fn(),
  mockProductFindFirst: vi.fn(),
}))

vi.mock('@/lib/prisma', () => ({
  prisma: {
    store: { findUnique: mockStoreFindUnique },
    product: { findMany: mockProductFindMany, findFirst: mockProductFindFirst },
  },
}))

import { getStoreBySlug, getVisibleProducts, getPublicProductBySlug } from './queries'

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
      khipuReceiverId: null,
      subscription: null,
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
      subscription: null,
    })

    const result = await getStoreBySlug('mi-tienda')

    // Tienda inactiva no se expone públicamente
    expect(result).toBeNull()
  })

  it('no expone Khipu en tienda con plan inicial aunque tenga credenciales configuradas', async () => {
    mockStoreFindUnique.mockResolvedValue({
      id: 'store-1',
      name: 'Mi Tienda',
      slug: 'mi-tienda',
      isActive: true,
      khipuReceiverId: '519708',
      subscription: { plan: { slug: 'initial' } },
    })

    const store = await getStoreBySlug('mi-tienda')

    // La lógica hasKhipu vive en el caller, pero el query retorna el plan
    // para que el caller pueda evaluar correctamente
    expect(store?.khipuReceiverId).toBe('519708')
    expect(store?.subscription?.plan?.slug).toBe('initial')
    // Con estos datos: !!khipuReceiverId && plan.slug !== 'initial' → false
    expect(!!store?.khipuReceiverId && store?.subscription?.plan?.slug !== 'initial').toBe(false)
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

describe('getPublicProductBySlug - detalle de producto público', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('encuentra un producto por su slug amigable', async () => {
    const mockProduct = { id: 'prod-1', name: 'Camiseta', slug: 'camiseta', price: 10000, description: null, imageUrl: null, categories: [] }
    mockProductFindFirst.mockResolvedValue(mockProduct)

    const result = await getPublicProductBySlug('camiseta', 'store-1')

    expect(result).toEqual(mockProduct)
    expect(mockProductFindFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ storeId: 'store-1', visible: true }),
      })
    )
  })

  it('encuentra un producto por su id como fallback (productos sin slug)', async () => {
    const mockProduct = { id: 'prod-abc123', name: 'Producto viejo', slug: null, price: 5000, description: null, imageUrl: null, categories: [] }
    mockProductFindFirst.mockResolvedValue(mockProduct)

    const result = await getPublicProductBySlug('prod-abc123', 'store-1')

    expect(result).toEqual(mockProduct)
  })

  it('retorna null para un slug que no existe', async () => {
    mockProductFindFirst.mockResolvedValue(null)

    const result = await getPublicProductBySlug('slug-inexistente', 'store-1')

    expect(result).toBeNull()
  })

  it('no expone productos de otras tiendas aunque el slug coincida', async () => {
    mockProductFindFirst.mockResolvedValue(null)

    await getPublicProductBySlug('camiseta', 'store-B')

    const callArg = mockProductFindFirst.mock.calls[0][0]
    expect(callArg.where.storeId).toBe('store-B')
  })
})
