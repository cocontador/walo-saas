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

describe('updateProduct - WALO-155, WALO-156, WALO-157, WALO-158', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('WALO-156: debería actualizar producto usando updateProductSchema', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: 'user-123', email: 'test@example.com' },
    } as any)

    vi.mocked(getUserStoreId).mockResolvedValue('store-456')

    const updatedProduct = {
      id: 'prod-1',
      name: 'Producto actualizado',
      price: 60000,
      description: 'Nueva descripción',
      visible: true,
    }

    vi.mocked(prisma.product.findFirst).mockResolvedValue({ id: 'prod-1' } as any)
    vi.mocked(prisma.product.update).mockResolvedValue(updatedProduct as any)

    const result = await updateProduct('prod-1', {
      name: 'Producto actualizado',
      price: 60000,
      description: 'Nueva descripción',
    })

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toEqual(updatedProduct)
    }
    expect(prisma.product.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'prod-1' },
      })
    )
  })

  it('WALO-157: debería mantener tenant - validar que actualiza solo productos de la tienda del usuario', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: 'user-123', email: 'test@example.com' },
    } as any)

    const userStoreId = 'store-456'
    vi.mocked(getUserStoreId).mockResolvedValue(userStoreId)

    vi.mocked(prisma.product.findFirst).mockResolvedValue({ id: 'prod-1' } as any)
    vi.mocked(prisma.product.update).mockResolvedValue({
      id: 'prod-1', name: 'Nuevo nombre', price: 100, description: null, visible: true,
    } as any)

    await updateProduct('prod-1', { name: 'Nuevo nombre' })

    expect(prisma.product.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'prod-1', storeId: userStoreId },
      })
    )
  })

  it('WALO-158: debería rechazar si el producto no pertenece a la tienda del usuario', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: 'user-123', email: 'test@example.com' },
    } as any)

    vi.mocked(getUserStoreId).mockResolvedValue('store-456')
    vi.mocked(prisma.product.findFirst).mockResolvedValue(null)

    const result = await updateProduct('prod-999', { name: 'Intento de cambio' })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toContain('no tienes permiso')
    }
    expect(prisma.product.update).not.toHaveBeenCalled()
  })

  it('debería rechazar si no hay sesión autenticada', async () => {
    vi.mocked(getServerSession).mockResolvedValue(null)

    const result = await updateProduct('prod-1', { name: 'Nuevo nombre' })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toContain('No autenticado')
    }
  })

  it('debería rechazar si el usuario no tiene tienda asociada', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: 'user-123', email: 'test@example.com' },
    } as any)

    vi.mocked(getUserStoreId).mockResolvedValue(null)

    const result = await updateProduct('prod-1', { name: 'Nuevo nombre' })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toContain('No tienes una tienda asociada')
    }
  })

  it('debería limpiar todas las categorías enviando categoryIds: []', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: 'user-123', email: 'test@example.com' },
    } as any)

    vi.mocked(getUserStoreId).mockResolvedValue('store-456')
    vi.mocked(prisma.product.findFirst).mockResolvedValue({ id: 'prod-1' } as any)
    vi.mocked(prisma.product.update).mockResolvedValue({
      id: 'prod-1', name: 'Producto', price: 100, description: null, visible: true,
    } as any)

    const result = await updateProduct('prod-1', { categoryIds: [] })

    expect(result.success).toBe(true)
    expect(prisma.category.findMany).not.toHaveBeenCalled()
    expect(prisma.product.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          categories: { deleteMany: {}, create: [] },
        }),
      })
    )
  })

  it('debería validar que las categorías asignadas pertenecen a la tienda', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: 'user-123', email: 'test@example.com' },
    } as any)

    vi.mocked(getUserStoreId).mockResolvedValue('store-456')
    vi.mocked(prisma.product.findFirst).mockResolvedValue({ id: 'prod-1' } as any)
    // Devuelve solo 1 de las 2 categorías solicitadas → inválido
    vi.mocked(prisma.category.findMany).mockResolvedValue([{ id: 'cat-1' }] as any)

    const result = await updateProduct('prod-1', { categoryIds: ['cat-1', 'cat-ajena'] })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toContain('Una o más categorías')
    }
    expect(prisma.product.update).not.toHaveBeenCalled()
  })
})
