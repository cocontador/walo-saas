/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { hideCategory } from './hideCategory'
import { getServerSession } from 'next-auth'
import { getUserStoreId } from '@/server/store'
import { prisma } from '@/lib/prisma'

vi.mock('next-auth', () => ({
  getServerSession: vi.fn(),
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

vi.mock('@/server/store', () => ({
  getUserStoreId: vi.fn(),
}))

vi.mock('@/lib/prisma', () => ({
  prisma: {
    category: {
      findFirst: vi.fn(),
      updateMany: vi.fn(),
    },
  },
}))

describe('hideCategory - WALO-45', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('debería ocultar categoría (visible: false)', async () => {
    vi.mocked(getServerSession).mockResolvedValue({ user: { id: 'user-1' } } as any)
    vi.mocked(getUserStoreId).mockResolvedValue('store-1')

    vi.mocked(prisma.category.findFirst)
      .mockResolvedValueOnce({ id: 'cat-1' } as any) // exists check
      .mockResolvedValueOnce({ id: 'cat-1', name: 'Ropa', isActive: true, visible: false } as any) // after update

    vi.mocked(prisma.category.updateMany).mockResolvedValue({ count: 1 } as any)

    const result = await hideCategory('cat-1')

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.visible).toBe(false)
    }

    expect(prisma.category.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'cat-1', storeId: 'store-1' },
        data: { visible: false },
      })
    )
  })

  it('debería rechazar si la categoría no pertenece a la tienda', async () => {
    vi.mocked(getServerSession).mockResolvedValue({ user: { id: 'user-1' } } as any)
    vi.mocked(getUserStoreId).mockResolvedValue('store-1')

    vi.mocked(prisma.category.findFirst).mockResolvedValue(null)

    const result = await hideCategory('cat-999')

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toContain('no tienes permiso')
    }
  })
})
