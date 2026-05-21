/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getServerSession } from 'next-auth'

import { prisma } from '@/lib/prisma'
import { getUserStoreId } from '@/server/store'
import { getProductById } from './getProductById'

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
    },
  },
}))

describe('getProductById - WALO-25', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('debería retornar detalle del producto cuando pertenece al tenant actual', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: 'user-123', email: 'test@example.com' },
    } as any)
    vi.mocked(getUserStoreId).mockResolvedValue('store-456')

    const mockProduct = {
      id: 'prod-1',
      name: 'Producto 1',
      price: 50000,
      description: 'Detalle',
      visible: true,
      storeId: 'store-456',
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    vi.mocked(prisma.product.findFirst).mockResolvedValue(mockProduct as any)

    const result = await getProductById('prod-1')

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toEqual(mockProduct)
    }
    expect(prisma.product.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          id: 'prod-1',
          storeId: 'store-456',
        },
      })
    )
  })

  it('debería bloquear acceso cuando el producto no existe o no pertenece al tenant', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: 'user-123', email: 'test@example.com' },
    } as any)
    vi.mocked(getUserStoreId).mockResolvedValue('store-456')
    vi.mocked(prisma.product.findFirst).mockResolvedValue(null)

    const result = await getProductById('prod-ajeno')

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toContain('Producto no encontrado')
    }
  })

  it('debería rechazar si no hay sesión autenticada', async () => {
    vi.mocked(getServerSession).mockResolvedValue(null)

    const result = await getProductById('prod-1')

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toContain('No autenticado')
    }
  })
})

