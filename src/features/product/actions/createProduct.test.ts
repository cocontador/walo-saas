/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createProduct } from './createProduct'
import { getServerSession } from 'next-auth'
import { getUserStoreId } from '@/server/store'
import { prisma } from '@/lib/prisma'
import { getPlanUsage } from '@/features/billing/actions'

vi.mock('next-auth', () => ({ getServerSession: vi.fn() }))
vi.mock('@/server/store', () => ({ getUserStoreId: vi.fn() }))
vi.mock('@/lib/prisma', () => ({
  prisma: {
    product: { create: vi.fn() },
    category: { findMany: vi.fn() },
  },
}))
vi.mock('@/features/billing/actions', () => ({ getPlanUsage: vi.fn() }))

const VALID_INPUT = { name: 'Empanada de Pino', price: 2500, description: 'Casera' }

const USAGE_UNDER_LIMIT = {
  activeProducts: 5,
  productLimit: 15,
  isUnlimited: false,
  usagePercentage: 33,
  isNearLimit: false,
  shouldUpgrade: false,
}

const USAGE_AT_LIMIT = {
  activeProducts: 15,
  productLimit: 15,
  isUnlimited: false,
  usagePercentage: 100,
  isNearLimit: false,
  shouldUpgrade: true,
}

const USAGE_UNLIMITED = {
  activeProducts: 200,
  productLimit: -1,
  isUnlimited: true,
  usagePercentage: 0,
  isNearLimit: false,
  shouldUpgrade: false,
}

const USAGE_NEAR_LIMIT = {
  activeProducts: 13,
  productLimit: 15,
  isUnlimited: false,
  usagePercentage: 87,
  isNearLimit: true,
  shouldUpgrade: true,
}

function mockAuthenticatedUser() {
  vi.mocked(getServerSession).mockResolvedValue({ user: { id: 'user-1' } } as any)
  vi.mocked(getUserStoreId).mockResolvedValue('store-1')
}

describe('createProduct — bloqueo por límite de plan', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('crea el producto cuando el uso está bajo el límite', async () => {
    mockAuthenticatedUser()
    vi.mocked(getPlanUsage).mockResolvedValue(USAGE_UNDER_LIMIT)
    vi.mocked(prisma.product.create).mockResolvedValue({
      id: 'prod-1', name: 'Empanada de Pino', price: 2500, description: 'Casera',
    } as any)

    const result = await createProduct(VALID_INPUT)

    expect(result.success).toBe(true)
    expect(prisma.product.create).toHaveBeenCalledOnce()
  })

  it('bloquea la creación cuando el usuario está al límite del plan', async () => {
    mockAuthenticatedUser()
    vi.mocked(getPlanUsage).mockResolvedValue(USAGE_AT_LIMIT)

    const result = await createProduct(VALID_INPUT)

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toContain('15')
      expect(result.error).toContain('Plan Pro')
    }
    expect(prisma.product.create).not.toHaveBeenCalled()
  })

  it('permite crear cuando el plan es ilimitado aunque haya muchos productos', async () => {
    mockAuthenticatedUser()
    vi.mocked(getPlanUsage).mockResolvedValue(USAGE_UNLIMITED)
    vi.mocked(prisma.product.create).mockResolvedValue({
      id: 'prod-2', name: 'Empanada de Pino', price: 2500, description: null,
    } as any)

    const result = await createProduct(VALID_INPUT)

    expect(result.success).toBe(true)
    expect(prisma.product.create).toHaveBeenCalledOnce()
  })

  it('permite crear cuando está cerca del límite pero sin haberlo alcanzado', async () => {
    mockAuthenticatedUser()
    vi.mocked(getPlanUsage).mockResolvedValue(USAGE_NEAR_LIMIT)
    vi.mocked(prisma.product.create).mockResolvedValue({
      id: 'prod-3', name: 'Empanada de Pino', price: 2500, description: null,
    } as any)

    const result = await createProduct(VALID_INPUT)

    expect(result.success).toBe(true)
    expect(prisma.product.create).toHaveBeenCalledOnce()
  })

  it('rechaza si no hay sesión autenticada (sin llegar a verificar plan)', async () => {
    vi.mocked(getServerSession).mockResolvedValue(null)

    const result = await createProduct(VALID_INPUT)

    expect(result.success).toBe(false)
    if (!result.success) expect(result.error).toContain('No autenticado')
    expect(getPlanUsage).not.toHaveBeenCalled()
    expect(prisma.product.create).not.toHaveBeenCalled()
  })

  it('rechaza si el usuario no tiene tienda (sin llegar a verificar plan)', async () => {
    vi.mocked(getServerSession).mockResolvedValue({ user: { id: 'user-1' } } as any)
    vi.mocked(getUserStoreId).mockResolvedValue(null)

    const result = await createProduct(VALID_INPUT)

    expect(result.success).toBe(false)
    if (!result.success) expect(result.error).toContain('tienda asociada')
    expect(getPlanUsage).not.toHaveBeenCalled()
    expect(prisma.product.create).not.toHaveBeenCalled()
  })

  it('rechaza con datos inválidos (Zod) sin llegar a verificar plan', async () => {
    mockAuthenticatedUser()

    const result = await createProduct({ name: '', price: -100 })

    expect(result.success).toBe(false)
    expect(getPlanUsage).not.toHaveBeenCalled()
    expect(prisma.product.create).not.toHaveBeenCalled()
  })
})
