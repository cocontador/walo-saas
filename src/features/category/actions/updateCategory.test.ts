/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { updateCategory } from './updateCategory'
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

describe('updateCategory', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('debería actualizar nombre de categoría y respetar tenant', async () => {
    vi.mocked(getServerSession).mockResolvedValue({ user: { id: 'user-1' } } as any)
    vi.mocked(getUserStoreId).mockResolvedValue('store-1')

    vi.mocked(prisma.category.findFirst)
      .mockResolvedValueOnce({ id: 'cat-1' } as any) // exists check
      .mockResolvedValueOnce({ id: 'cat-1', name: 'Nuevo', isActive: true, visible: true } as any) // after update

    vi.mocked(prisma.category.updateMany).mockResolvedValue({ count: 1 } as any)

    const result = await updateCategory('cat-1', { name: 'Nuevo' })

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toEqual({ id: 'cat-1', name: 'Nuevo', isActive: true, visible: true })
      expect(result.data).toHaveProperty('isActive')
      expect(result.data).toHaveProperty('visible')
    }

    expect(prisma.category.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'cat-1', storeId: 'store-1' } })
    )

    expect(prisma.category.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'cat-1', storeId: 'store-1' } })
    )
  })

  it('debería actualizar visible sin cambiar nombre', async () => {
    vi.mocked(getServerSession).mockResolvedValue({ user: { id: 'user-1' } } as any)
    vi.mocked(getUserStoreId).mockResolvedValue('store-1')

    vi.mocked(prisma.category.findFirst)
      .mockResolvedValueOnce({ id: 'cat-1' } as any) // exists check
      .mockResolvedValueOnce({ id: 'cat-1', name: 'Ropa', isActive: true, visible: false } as any) // after update

    vi.mocked(prisma.category.updateMany).mockResolvedValue({ count: 1 } as any)

    const result = await updateCategory('cat-1', { visible: false })

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

  it('debería rechazar si la categoría es de otra tienda', async () => {
    vi.mocked(getServerSession).mockResolvedValue({ user: { id: 'user-1' } } as any)
    vi.mocked(getUserStoreId).mockResolvedValue('store-1')

    vi.mocked(prisma.category.findFirst).mockResolvedValue(null)

    const result = await updateCategory('cat-999', { name: 'X' })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toContain('no tienes permiso')
    }
  })
})
