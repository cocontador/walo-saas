import { describe, it, expect, beforeEach, vi } from 'vitest'
import { getPlanUsage } from '@/features/billing/actions'
import { prisma } from '@/lib/prisma'
import { getUserStoreId } from '@/server/store'
import type { Prisma } from '@prisma/client'

type StoreSubscriptionWithPlan = Prisma.StoreSubscriptionGetPayload<{
  include: { plan: true }
}>
// Mocks
vi.mock('@/lib/prisma', () => ({
  prisma: {
    storeSubscription: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    product: {
      count: vi.fn(),
    },
    plan: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}))

vi.mock('@/server/store', () => ({
  getUserStoreId: vi.fn(),
}))

describe('getPlanUsage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('debe calcular uso correcto para plan con límite', async () => {
    const mockSubscription = {
      id: 'sub-1',
      storeId: 'store-1',
      planId: '1',
      status: 'ACTIVE',
      billingCycle: 'MONTHLY',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      cancelAtPeriodEnd: false,
      canceledAt: null,
      reactivatedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      plan: {
        id: '1',
        name: 'Inicial',
        slug: 'initial',
        description: 'Plan gratuito',
        priceMonthly: 0,
        priceYearly: 0,
        currency: 'CLP',
        productLimit: 15,
        customDomain: false,
        analytics: false,
        premiumTemplates: false,
        supportLevel: 'basic',
        features: [],
        limitations: null,
        isActive: true,
        sortOrder: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    }

    vi.mocked(getUserStoreId).mockResolvedValue('store-1')
    vi.mocked(prisma.storeSubscription.findUnique).mockResolvedValue(
      mockSubscription as unknown as StoreSubscriptionWithPlan
    )
    vi.mocked(prisma.product.count).mockResolvedValue(10)

    const result = await getPlanUsage()

    expect(result.activeProducts).toBe(10)
    expect(result.productLimit).toBe(15)
    expect(result.isUnlimited).toBe(false)
    expect(result.usagePercentage).toBeCloseTo((10 / 15) * 100)
    expect(result.isNearLimit).toBe(false)
    expect(result.shouldUpgrade).toBe(false)
  })

  it('debe retornar isUnlimited true para plan sin límite', async () => {
    const mockSubscription = {
      id: 'sub-1',
      storeId: 'store-1',
      planId: '2',
      status: 'ACTIVE',
      billingCycle: 'MONTHLY',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      cancelAtPeriodEnd: false,
      canceledAt: null,
      reactivatedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      plan: {
        id: '2',
        name: 'Pro',
        slug: 'pro',
        description: 'Plan profesional',
        priceMonthly: 5990,
        priceYearly: null,
        currency: 'CLP',
        productLimit: null,
        customDomain: true,
        analytics: true,
        premiumTemplates: true,
        supportLevel: 'email',
        features: [],
        limitations: null,
        isActive: true,
        sortOrder: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    }

    vi.mocked(getUserStoreId).mockResolvedValue('store-1')
    vi.mocked(prisma.storeSubscription.findUnique).mockResolvedValue(
      mockSubscription as unknown as StoreSubscriptionWithPlan
    )
    vi.mocked(prisma.product.count).mockResolvedValue(100)

    const result = await getPlanUsage()

    expect(result.isUnlimited).toBe(true)
    expect(result.productLimit).toBe(-1)
    expect(result.usagePercentage).toBe(0)
    expect(result.isNearLimit).toBe(false)
    expect(result.shouldUpgrade).toBe(false)
  })

  it('debe retornar isNearLimit true cuando >= 80% del límite', async () => {
    const mockSubscription = {
      id: 'sub-1',
      storeId: 'store-1',
      planId: '1',
      status: 'ACTIVE',
      billingCycle: 'MONTHLY',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      cancelAtPeriodEnd: false,
      canceledAt: null,
      reactivatedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      plan: {
        id: '1',
        name: 'Inicial',
        slug: 'initial',
        description: 'Plan gratuito',
        priceMonthly: 0,
        priceYearly: 0,
        currency: 'CLP',
        productLimit: 15,
        customDomain: false,
        analytics: false,
        premiumTemplates: false,
        supportLevel: 'basic',
        features: [],
        limitations: null,
        isActive: true,
        sortOrder: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    }

    vi.mocked(getUserStoreId).mockResolvedValue('store-1')
    vi.mocked(prisma.storeSubscription.findUnique).mockResolvedValue(
      mockSubscription as unknown as StoreSubscriptionWithPlan
    )
    vi.mocked(prisma.product.count).mockResolvedValue(12) // 80% de 15

    const result = await getPlanUsage()

    expect(result.isNearLimit).toBe(true)
    expect(result.shouldUpgrade).toBe(true)
  })

  it('debe retornar shouldUpgrade true cuando está al límite', async () => {
    const mockSubscription = {
      id: 'sub-1',
      storeId: 'store-1',
      planId: '1',
      status: 'ACTIVE',
      billingCycle: 'MONTHLY',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      cancelAtPeriodEnd: false,
      canceledAt: null,
      reactivatedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      plan: {
        id: '1',
        name: 'Inicial',
        slug: 'initial',
        description: 'Plan gratuito',
        priceMonthly: 0,
        priceYearly: 0,
        currency: 'CLP',
        productLimit: 15,
        customDomain: false,
        analytics: false,
        premiumTemplates: false,
        supportLevel: 'basic',
        features: [],
        limitations: null,
        isActive: true,
        sortOrder: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    }

    vi.mocked(getUserStoreId).mockResolvedValue('store-1')
    vi.mocked(prisma.storeSubscription.findUnique).mockResolvedValue(
      mockSubscription as unknown as StoreSubscriptionWithPlan
    )
    vi.mocked(prisma.product.count).mockResolvedValue(15) // Al límite

    const result = await getPlanUsage()

    expect(result.shouldUpgrade).toBe(true)
  })

  it('debe lanzar error si no hay tienda autenticada', async () => {
    vi.mocked(getUserStoreId).mockResolvedValue(null)

    await expect(getPlanUsage()).rejects.toThrow(
      'No authenticated store found'
    )
  })

  it('debe hacer fallback al plan inicial si no existe suscripción', async () => {
    const mockInitialPlan = {
      id: 'plan-initial-fallback',
      name: 'Inicial',
      slug: 'initial',
      description: 'Plan gratuito',
      priceMonthly: 0,
      priceYearly: 0,
      currency: 'CLP',
      productLimit: 15,
      customDomain: false,
      analytics: false,
      premiumTemplates: false,
      supportLevel: 'basic',
      features: [],
      limitations: null,
      isActive: true,
      sortOrder: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    vi.mocked(getUserStoreId).mockResolvedValue('store-1')
    vi.mocked(prisma.storeSubscription.findUnique).mockResolvedValue(null)
    vi.mocked(prisma.plan.findUnique).mockResolvedValue(mockInitialPlan)
    vi.mocked(prisma.product.count).mockResolvedValue(5)

    const result = await getPlanUsage()

    expect(result.activeProducts).toBe(5)
    expect(result.productLimit).toBe(15)
    expect(result.isUnlimited).toBe(false)
    expect(result.usagePercentage).toBeCloseTo((5 / 15) * 100)
    expect(result.isNearLimit).toBe(false)
    expect(result.shouldUpgrade).toBe(false)
  })
})
