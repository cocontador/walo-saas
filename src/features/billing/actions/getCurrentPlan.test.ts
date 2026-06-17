import { describe, it, expect, beforeEach, vi } from 'vitest'
import { getCurrentPlan } from '@/features/billing/actions'
import { prisma } from '@/lib/prisma'
import { getUserStoreId } from '@/server/store'
import type { StoreSubscription } from '@prisma/client'

// Mocks
vi.mock('@/lib/prisma', () => ({
  prisma: {
    storeSubscription: {
      findUnique: vi.fn(),
      create: vi.fn(),
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

describe('getCurrentPlan', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('debe retornar plan actual cuando existe suscripción', async () => {
    const mockPlan = {
      id: '1',
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
    }

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
      plan: mockPlan,
    }

    vi.mocked(getUserStoreId).mockResolvedValue('store-1')
    vi.mocked(prisma.storeSubscription.findUnique).mockResolvedValue(
      mockSubscription as unknown as StoreSubscription
    )

    const result = await getCurrentPlan()

    expect(result.plan.slug).toBe('pro')
    expect(result.subscription).not.toBeNull()
    expect(result.isTrialing).toBe(false)
  })

  it('debe lanzar error si no hay tienda autenticada', async () => {
    vi.mocked(getUserStoreId).mockResolvedValue(null)

    await expect(getCurrentPlan()).rejects.toThrow(
      'No authenticated store found'
    )
  })

  it('debe retornar plan inicial sin crear suscripción si no existe', async () => {
    const initialPlan = {
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
    }

    vi.mocked(getUserStoreId).mockResolvedValue('store-1')
    vi.mocked(prisma.storeSubscription.findUnique).mockResolvedValue(null)
    vi.mocked(prisma.plan.findUnique).mockResolvedValue(initialPlan)

    const result = await getCurrentPlan()

    expect(result.plan.slug).toBe('initial')
    expect(result.subscription).toBeNull()
    expect(prisma.plan.create).not.toHaveBeenCalled()
    expect(prisma.storeSubscription.create).not.toHaveBeenCalled()
  })

  it('debe retornar FALLBACK_FREE_PLAN sin escribir en BD si no existe plan inicial', async () => {
    vi.mocked(getUserStoreId).mockResolvedValue('store-1')
    vi.mocked(prisma.storeSubscription.findUnique).mockResolvedValue(null)
    vi.mocked(prisma.plan.findUnique).mockResolvedValue(null)

    const result = await getCurrentPlan()

    expect(result.plan.slug).toBe('initial')
    expect(result.subscription).toBeNull()
    expect(result.isTrialing).toBe(false)
    expect(result.isExpired).toBe(false)
    expect(prisma.plan.create).not.toHaveBeenCalled()
    expect(prisma.storeSubscription.create).not.toHaveBeenCalled()
  })

  it('debe retornar isTrialing true cuando status es TRIALING', async () => {
    const mockPlan = {
      id: '1',
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
    }

    const mockSubscription = {
      id: 'sub-1',
      storeId: 'store-1',
      planId: '1',
      status: 'TRIALING',
      billingCycle: 'MONTHLY',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      cancelAtPeriodEnd: false,
      canceledAt: null,
      reactivatedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      plan: mockPlan,
    }

    vi.mocked(getUserStoreId).mockResolvedValue('store-1')
    vi.mocked(prisma.storeSubscription.findUnique).mockResolvedValue(
      mockSubscription as unknown as StoreSubscription
    )

    const result = await getCurrentPlan()

    expect(result.isTrialing).toBe(true)
  })
})
