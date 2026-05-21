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
      updateMany: vi.fn(),
    },
  },
}))

describe('updateProduct - WALO-155, WALO-156, WALO-157, WALO-158', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('WALO-156: debería actualizar producto usando updateProductSchema', async () => {
    // Arrange
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: 'user-123', email: 'test@example.com' },
    } as any)

    vi.mocked(getUserStoreId).mockResolvedValue('store-456')

    vi.mocked(prisma.product.findFirst).mockResolvedValue({ id: 'prod-1' } as any)

    const updateData = {
      name: 'Producto actualizado',
      price: 60000,
      description: 'Nueva descripción',
    }

    const updatedProduct = {
      id: 'prod-1',
      name: 'Producto actualizado',
      price: 60000,
      description: 'Nueva descripción',
      visible: true,
    }

    vi.mocked(prisma.product.updateMany).mockResolvedValue({ count: 1 } as any)
    vi.mocked(prisma.product.findFirst).mockResolvedValue(updatedProduct as any)

    // Act
    const result = await updateProduct('prod-1', updateData)

    // Assert
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toEqual(updatedProduct)
    }
    expect(prisma.product.updateMany).toHaveBeenCalled()
  })

  it('WALO-157: debería mantener tenant - validar que actualiza solo productos de la tienda del usuario', async () => {
    // Arrange
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: 'user-123', email: 'test@example.com' },
    } as any)

    const userStoreId = 'store-456'
    vi.mocked(getUserStoreId).mockResolvedValue(userStoreId)

    // Simular que el producto pertenece a la tienda del usuario
    vi.mocked(prisma.product.findFirst).mockResolvedValue({ id: 'prod-1' } as any)

    // Act
    await updateProduct('prod-1', { name: 'Nuevo nombre' })

    // Assert
    // Verifica que findFirst filtra por storeId (WALO-157: Mantener tenant)
    expect(prisma.product.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          id: 'prod-1',
          storeId: userStoreId, // WALO-157: Verifica que mantiene tenant
        },
      })
    )
  })

  it('WALO-158: debería rechazar si el producto no pertenece a la tienda del usuario', async () => {
    // Arrange
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: 'user-123', email: 'test@example.com' },
    } as any)

    vi.mocked(getUserStoreId).mockResolvedValue('store-456')

    // El producto no existe en la tienda del usuario
    vi.mocked(prisma.product.findFirst).mockResolvedValue(null)

    // Act
    const result = await updateProduct('prod-999', { name: 'Intento de cambio' })

    // Assert
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toContain('no tienes permiso')
    }
  })

  it('debería rechazar si no hay sesión autenticada', async () => {
    // Arrange
    vi.mocked(getServerSession).mockResolvedValue(null)

    // Act
    const result = await updateProduct('prod-1', { name: 'Nuevo nombre' })

    // Assert
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toContain('No autenticado')
    }
  })

  it('debería rechazar si el usuario no tiene tienda asociada', async () => {
    // Arrange
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: 'user-123', email: 'test@example.com' },
    } as any)

    vi.mocked(getUserStoreId).mockResolvedValue(null)

    // Act
    const result = await updateProduct('prod-1', { name: 'Nuevo nombre' })

    // Assert
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toContain('No tienes una tienda asociada')
    }
  })
})

