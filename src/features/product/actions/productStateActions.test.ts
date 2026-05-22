/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { revalidatePath } from 'next/cache'
import { hideProductById as hideProduct } from './hideProduct'
import { reactivateProductById as reactivateProduct } from './reactivateProduct'
import { deactivateProductById as deactivateProduct } from './deactivateProduct'
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
    product: {
      findFirst: vi.fn(),
      updateMany: vi.fn(),
    },
  },
}))

describe('product state actions - WALO-27, WALO-28, WALO-29', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('WALO-28: debería ocultar producto cambiando visible a false', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: 'user-123', email: 'test@example.com' },
    } as any)

    vi.mocked(getUserStoreId).mockResolvedValue('store-456')
    vi.mocked(prisma.product.findFirst).mockResolvedValue({ id: 'prod-1' } as any)
    vi.mocked(prisma.product.updateMany).mockResolvedValue({ count: 1 } as any)

    const result = await hideProduct('prod-1')

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toEqual({ id: 'prod-1', visible: false })
    }
    expect(prisma.product.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          id: 'prod-1',
          storeId: 'store-456',
        },
        data: { visible: false },
      })
    )
    expect(revalidatePath).toHaveBeenCalledWith('/dashboard/products')
    expect(revalidatePath).toHaveBeenCalledWith('/dashboard/products/prod-1')
  })

  it('WALO-29: debería reactivar producto cambiando visible a true', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: 'user-123', email: 'test@example.com' },
    } as any)

    vi.mocked(getUserStoreId).mockResolvedValue('store-456')
    vi.mocked(prisma.product.findFirst).mockResolvedValue({ id: 'prod-1' } as any)
    vi.mocked(prisma.product.updateMany).mockResolvedValue({ count: 1 } as any)

    const result = await reactivateProduct('prod-1')

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toEqual({ id: 'prod-1', visible: true })
    }
    expect(prisma.product.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          id: 'prod-1',
          storeId: 'store-456',
        },
        data: { visible: true },
      })
    )
    expect(revalidatePath).toHaveBeenCalledWith('/dashboard/products')
    expect(revalidatePath).toHaveBeenCalledWith('/dashboard/products/prod-1')
  })

  it('WALO-27: debería desactivar producto usando el mismo estado visible false', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: 'user-123', email: 'test@example.com' },
    } as any)

    vi.mocked(getUserStoreId).mockResolvedValue('store-456')
    vi.mocked(prisma.product.findFirst).mockResolvedValue({ id: 'prod-1' } as any)
    vi.mocked(prisma.product.updateMany).mockResolvedValue({ count: 1 } as any)

    const result = await deactivateProduct('prod-1')

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toEqual({ id: 'prod-1', visible: false })
    }
    expect(prisma.product.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          id: 'prod-1',
          storeId: 'store-456',
        },
        data: { visible: false },
      })
    )
    expect(revalidatePath).toHaveBeenCalledWith('/dashboard/products')
    expect(revalidatePath).toHaveBeenCalledWith('/dashboard/products/prod-1')
  })

  it('debería rechazar si no hay sesión autenticada', async () => {
    vi.mocked(getServerSession).mockResolvedValue(null)

    const result = await hideProduct('prod-1')

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

    const result = await reactivateProduct('prod-1')

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toContain('No tienes una tienda asociada')
    }
  })

  it('debería rechazar si el producto no pertenece a la tienda del usuario', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: 'user-123', email: 'test@example.com' },
    } as any)
    vi.mocked(getUserStoreId).mockResolvedValue('store-456')
    vi.mocked(prisma.product.findFirst).mockResolvedValue(null)

    const result = await hideProduct('prod-999')

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toContain('no tienes permiso')
    }
  })
})
