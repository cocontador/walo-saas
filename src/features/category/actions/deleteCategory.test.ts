/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { deleteCategory } from './deleteCategory'
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
      deleteMany: vi.fn(),
    },
  },
}))

describe('deleteCategory', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('debería eliminar categoría perteneciente a la tienda del usuario', async () => {
    vi.mocked(getServerSession).mockResolvedValue({ user: { id: 'user-1' } } as any)
    vi.mocked(getUserStoreId).mockResolvedValue('store-1')

    vi.mocked(prisma.category.deleteMany).mockResolvedValue({ count: 1 } as any)

    const result = await deleteCategory('cat-1')

    expect(result.success).toBe(true)
  })

  it('debería rechazar si la categoría no pertenece a la tienda', async () => {
    vi.mocked(getServerSession).mockResolvedValue({ user: { id: 'user-1' } } as any)
    vi.mocked(getUserStoreId).mockResolvedValue('store-1')

    vi.mocked(prisma.category.deleteMany).mockResolvedValue({ count: 0 } as any)

    const result = await deleteCategory('cat-999')

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toContain('no tienes permiso')
    }
  })
})
