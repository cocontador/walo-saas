/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getProducts } from './getProducts'
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
      findMany: vi.fn(),
    },
  },
}))

describe('getProducts - WALO-147, WALO-148, WALO-149, WALO-150', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('WALO-147: debería filtrar productos por tienda del usuario autenticado', async () => {
    // Arrange
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: 'user-123', email: 'test@example.com' },
    } as any)

    vi.mocked(getUserStoreId).mockResolvedValue('store-456')

    const mockProducts = [
      {
        id: 'prod-1',
        name: 'Producto 1',
        price: 50000,
        description: 'Descripción 1',
        visible: true,
        createdAt: new Date(),
      },
    ]

    vi.mocked(prisma.product.findMany).mockResolvedValue(mockProducts as any)

    // Act
    const result = await getProducts()

    // Assert
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toEqual(mockProducts)
    }
    expect(prisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          storeId: 'store-456', // WALO-147: Verifica que filtra por storeId
        },
      })
    )
  })

  it('WALO-148: debería retornar listado con campos: nombre, precio, descripción y estado', async () => {
    // Arrange
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: 'user-123', email: 'test@example.com' },
    } as any)

    vi.mocked(getUserStoreId).mockResolvedValue('store-456')

    const mockProducts = [
      {
        id: 'prod-1',
        name: 'Camiseta azul',
        price: 49900,
        description: 'Camiseta de algodón azul',
        visible: true,
        createdAt: new Date(),
      },
    ]

    vi.mocked(prisma.product.findMany).mockResolvedValue(mockProducts as any)

    // Act
    const result = await getProducts()

    // Assert
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toHaveLength(1)
      const product = result.data[0]
      expect(product).toHaveProperty('name', 'Camiseta azul')
      expect(product).toHaveProperty('price', 49900)
      expect(product).toHaveProperty('description', 'Camiseta de algodón azul')
      expect(product).toHaveProperty('visible', true) // WALO-148: Verificar estado
    }
  })

  it('WALO-149: debería retornar lista vacía cuando no hay productos', async () => {
    // Arrange
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: 'user-123', email: 'test@example.com' },
    } as any)

    vi.mocked(getUserStoreId).mockResolvedValue('store-456')
    vi.mocked(prisma.product.findMany).mockResolvedValue([])

    // Act
    const result = await getProducts()

    // Assert
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toEqual([]) // WALO-149: Estado vacío
    }
  })

  it('debería rechazar si no hay sesión autenticada', async () => {
    // Arrange
    vi.mocked(getServerSession).mockResolvedValue(null)

    // Act
    const result = await getProducts()

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
    const result = await getProducts()

    // Assert
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toContain('No tienes una tienda asociada')
    }
  })
})
