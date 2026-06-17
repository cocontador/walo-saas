import { describe, it, expect, beforeEach, vi } from 'vitest'
import { getPlanCatalog } from '@/features/billing/actions'
import { prisma } from '@/lib/prisma'
import { getUserStoreId } from '@/server/store'
import type { Plan, StoreSubscription } from '@prisma/client'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    plan: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    storeSubscription: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}))

vi.mock('@/server/store', () => ({
  getUserStoreId: vi.fn(),
}))

const createPlan = (overrides: Partial<Plan>): Plan => ({
  id: overrides.id ?? 'plan-1',
  name: overrides.name ?? 'Inicial',
  slug: overrides.slug ?? 'initial',
  description: overrides.description ?? 'Plan disponible',
  priceMonthly: overrides.priceMonthly ?? 0,
  priceYearly: overrides.priceYearly ?? null,
  currency: overrides.currency ?? 'CLP',
  productLimit: overrides.productLimit ?? 15,
  customDomain: overrides.customDomain ?? false,
  analytics: overrides.analytics ?? false,
  premiumTemplates: overrides.premiumTemplates ?? false,
  supportLevel: overrides.supportLevel ?? 'basic',
  features: overrides.features ?? [],
  limitations: overrides.limitations ?? null,
  isActive: overrides.isActive ?? true,
  sortOrder: overrides.sortOrder ?? 1,
  createdAt: overrides.createdAt ?? new Date(),
  updatedAt: overrides.updatedAt ?? new Date(),
})

const initialPlan = createPlan({ id: 'initial-id', name: 'Inicial', slug: 'initial', sortOrder: 1 })
const proPlan = createPlan({
  id: 'pro-id',
  name: 'Pro',
  slug: 'pro',
  priceMonthly: 5990,
  productLimit: null,
  customDomain: true,
  analytics: true,
  premiumTemplates: true,
  supportLevel: 'email',
  sortOrder: 2,
})
const businessPlan = createPlan({
  id: 'business-id',
  name: 'Business',
  slug: 'business',
  priceMonthly: 12990,
  productLimit: null,
  customDomain: true,
  analytics: true,
  premiumTemplates: true,
  supportLevel: 'priority',
  sortOrder: 3,
})

describe('getPlanCatalog', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(getUserStoreId).mockResolvedValue('store-1')
    vi.mocked(prisma.plan.findMany).mockResolvedValue([initialPlan, proPlan, businessPlan])
  })

  it('lista planes activos normalizados en orden visual', async () => {
    vi.mocked(prisma.storeSubscription.findUnique).mockResolvedValue({
      id: 'sub-1',
      storeId: 'store-1',
      planId: 'pro-id',
      status: 'ACTIVE',
      billingCycle: 'MONTHLY',
      currentPeriodStart: null,
      currentPeriodEnd: null,
      cancelAtPeriodEnd: false,
      canceledAt: null,
      reactivatedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      plan: proPlan,
    } as StoreSubscription & { plan: Plan })

    const result = await getPlanCatalog()

    expect(result.plans.map((plan) => plan.slug)).toEqual(['initial', 'pro', 'business'])
    expect(result.plans[0].features).toContain('Catálogo de hasta 15 productos activos')
    expect(result.plans[1].price).toBe('$5.990 CLP')
    expect(result.plans[2].ctaLabel).toBe('Hablar con ventas')
    expect(prisma.plan.findMany).toHaveBeenCalledWith({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    })
  })

  it('identifica claramente el plan actual del emprendedor', async () => {
    vi.mocked(prisma.storeSubscription.findUnique).mockResolvedValue({
      id: 'sub-1',
      storeId: 'store-1',
      planId: 'pro-id',
      status: 'ACTIVE',
      billingCycle: 'MONTHLY',
      currentPeriodStart: null,
      currentPeriodEnd: null,
      cancelAtPeriodEnd: false,
      canceledAt: null,
      reactivatedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      plan: proPlan,
    } as StoreSubscription & { plan: Plan })

    const result = await getPlanCatalog()

    expect(result.currentPlanSlug).toBe('pro')
    expect(result.plans.find((plan) => plan.slug === 'pro')?.isCurrent).toBe(true)
    expect(result.plans.find((plan) => plan.slug === 'initial')?.isCurrent).toBe(false)
  })

  it('usa fallback seguro a Plan Inicial si no hay suscripción', async () => {
    vi.mocked(prisma.storeSubscription.findUnique).mockResolvedValue(null)
    vi.mocked(prisma.plan.findUnique).mockResolvedValue(null)

    const result = await getPlanCatalog()

    expect(result.currentPlanSlug).toBe('initial')
    expect(result.plans.find((plan) => plan.slug === 'initial')?.isCurrent).toBe(true)
    expect(prisma.plan.create).not.toHaveBeenCalled()
    expect(prisma.storeSubscription.create).not.toHaveBeenCalled()
  })
})
