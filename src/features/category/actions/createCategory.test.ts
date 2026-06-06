/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createCategory } from './createCategory'
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
      create: vi.fn(),
    },
  },
}))

describe('createCategory - WALO-41, WALO-450', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('debería crear categoría válida y asociarla a la tienda del usuario', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: 'user-123', email: 'test@example.com' },
    } as any)

    vi.mocked(getUserStoreId).mockResolvedValue('store-456')
    vi.mocked(prisma.category.create).mockResolvedValue({
      id: 'cat-1',
      name: 'Ropa',
      isActive: true,
      visible: true,
    } as any)

    const result = await createCategory({ name: 'Ropa' })

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toEqual({ id: 'cat-1', name: 'Ropa', isActive: true, visible: true })
      expect(result.data).toHaveProperty('isActive')
      expect(result.data).toHaveProperty('visible')
    }
    expect(prisma.category.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          storeId: 'store-456',
          name: 'Ropa',
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

  it('debería rechazar nombre vacío', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: 'user-123', email: 'test@example.com' },
    } as any)

    vi.mocked(getUserStoreId).mockResolvedValue('store-456')

    const result = await createCategory({ name: '' } as any)

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toContain('El nombre es requerido')
    }
    expect(prisma.category.create).not.toHaveBeenCalled()
  })

  it('debería rechazar si se intenta enviar storeId desde el cliente', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: 'user-123', email: 'test@example.com' },
    } as any)

    vi.mocked(getUserStoreId).mockResolvedValue('store-456')

    const result = await createCategory({ name: 'Ropa', storeId: 'store-999' } as any)

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toContain('Unrecognized key')
    }
    expect(prisma.category.create).not.toHaveBeenCalled()
  })

  it('debería rechazar si el usuario no tiene tienda asociada', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: 'user-123', email: 'test@example.com' },
    } as any)

    vi.mocked(getUserStoreId).mockResolvedValue(null)

    const result = await createCategory({ name: 'Ropa' })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toContain('No tienes una tienda asociada')
    }
    expect(prisma.category.create).not.toHaveBeenCalled()
  })

  it('debería manejar categoría duplicada', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: 'user-123', email: 'test@example.com' },
    } as any)

    vi.mocked(getUserStoreId).mockResolvedValue('store-456')

    const error = new Error('Unique constraint failed') as any
    error.code = 'P2002'
    vi.mocked(prisma.category.create).mockRejectedValue(error)

    const result = await createCategory({ name: 'Ropa' })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toContain('Ya existe una categoría con ese nombre')
    }
  })
})
