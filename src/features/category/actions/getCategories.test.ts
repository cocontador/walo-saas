/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getCategories } from './getCategories'
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
    category: {
      findMany: vi.fn(),
    },
  },
}))

describe('getCategories - WALO-41, WALO-450', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('debería retornar solo categorías de la tienda del usuario autenticado', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: 'user-123', email: 'test@example.com' },
    } as any)

    vi.mocked(getUserStoreId).mockResolvedValue('store-456')

    const mockCategories = [
      { id: 'cat-1', name: 'Ropa', isActive: true, visible: true },
      { id: 'cat-2', name: 'Accesorios', isActive: true, visible: false },
    ]

    vi.mocked(prisma.category.findMany).mockResolvedValue(mockCategories as any)

    const result = await getCategories()

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toEqual(mockCategories)
      expect(result.data[0]).toHaveProperty('isActive')
      expect(result.data[0]).toHaveProperty('visible')
    }
    expect(prisma.category.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          storeId: 'store-456',
        },
        select: {
          id: true,
          name: true,
          isActive: true,
          visible: true,
        },
      })
    )
  })

  it('debería retornar arreglo vacío cuando no hay categorías', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: 'user-123', email: 'test@example.com' },
    } as any)

    vi.mocked(getUserStoreId).mockResolvedValue('store-456')
    vi.mocked(prisma.category.findMany).mockResolvedValue([])

    const result = await getCategories()

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toEqual([])
    }
  })

  it('debería rechazar cuando el usuario no tiene tienda asociada', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: 'user-123', email: 'test@example.com' },
    } as any)

    vi.mocked(getUserStoreId).mockResolvedValue(null)

    const result = await getCategories()

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toContain('No tienes una tienda asociada')
    }
  })
})
