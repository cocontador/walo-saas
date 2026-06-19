/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { updateProduct } from './updateProduct'
import { getServerSession } from 'next-auth'
import { getUserStoreId } from '@/server/store'
import { prisma } from '@/lib/prisma'

vi.mock('next-auth', () => ({
  getServerSession: vi.fn(),
}))

vi.mock('@/server/store', () => ({
  getUserStoreId: vi.fn(),
}))

vi.mock('@/lib/prisma', () => ({
  prisma: {
    product: {
      findFirst: vi.fn(),
      update: vi.fn(),
    },
    category: {
      findMany: vi.fn(),
    },
  },
}))

describe('updateProduct (asignación de categorías) - WALO-46', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('debería asignar categorías válidas al producto', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: 'user-1' },
    } as any)
    vi.mocked(getUserStoreId).mockResolvedValue('store-1')

    vi.mocked(prisma.product.findFirst).mockResolvedValue({ id: 'prod-1' } as any)

    // Ambas categorías pertenecen a la tienda del usuario
    vi.mocked(prisma.category.findMany).mockResolvedValue([
      { id: 'cat-1' },
      { id: 'cat-2' },
    ] as any)

    vi.mocked(prisma.product.update).mockResolvedValue({
      id: 'prod-1',
      name: 'Camiseta',
      price: 10000,
      description: null,
      visible: true,
    } as any)

    const result = await updateProduct('prod-1', {
      categoryIds: ['cat-1', 'cat-2'],
    })

    expect(result.success).toBe(true)
    // Debe sincronizar las categorías usando deleteMany + create
    expect(prisma.product.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          categories: expect.objectContaining({
            deleteMany: {},
            create: [{ categoryId: 'cat-1' }, { categoryId: 'cat-2' }],
          }),
        }),
      })
    )
  })

  it('debería rechazar categoría que pertenece a otra tienda', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: 'user-1' },
    } as any)
    vi.mocked(getUserStoreId).mockResolvedValue('store-1')

    vi.mocked(prisma.product.findFirst).mockResolvedValue({ id: 'prod-1' } as any)

    // Solo devuelve 1 de las 2 categorías — la otra es de otro tenant
    vi.mocked(prisma.category.findMany).mockResolvedValue([
      { id: 'cat-1' },
    ] as any)

    const result = await updateProduct('prod-1', {
      categoryIds: ['cat-1', 'cat-ajena'],
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toContain('no existen o no pertenecen a tu tienda')
    }
    // No debe persistir nada si hay una categoría inválida
    expect(prisma.product.update).not.toHaveBeenCalled()
  })

  it('debería permitir quitar todas las categorías enviando arreglo vacío', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: 'user-1' },
    } as any)
    vi.mocked(getUserStoreId).mockResolvedValue('store-1')
    vi.mocked(prisma.product.findFirst).mockResolvedValue({ id: 'prod-1' } as any)
    vi.mocked(prisma.product.update).mockResolvedValue({
      id: 'prod-1',
      name: 'Camiseta',
      price: 10000,
      description: null,
      visible: true,
    } as any)

    // categoryIds vacío = no valida categorías, pero tampoco llama findMany
    const result = await updateProduct('prod-1', { categoryIds: [] })

    expect(result.success).toBe(true)
    expect(prisma.category.findMany).not.toHaveBeenCalled()
  })

  it('debería rechazar actualización sobre producto de otra tienda', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: 'user-1' },
    } as any)
    vi.mocked(getUserStoreId).mockResolvedValue('store-1')

    // El producto no existe en esta tienda
    vi.mocked(prisma.product.findFirst).mockResolvedValue(null)

    const result = await updateProduct('prod-ajena', {
      categoryIds: ['cat-1'],
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toContain('no encontrado')
    }
    expect(prisma.product.update).not.toHaveBeenCalled()
  })
})
