import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Plan } from '@prisma/client'

import { getPlanCatalog } from '@/features/billing/actions/getPlanCatalog'
import { getAvailablePlans } from '@/features/billing/actions/getAvailablePlans'
import { getCurrentPlan } from '@/features/billing/actions/getCurrentPlan'

vi.mock('@/features/billing/actions/getAvailablePlans', () => ({
  getAvailablePlans: vi.fn(),
}))

vi.mock('@/features/billing/actions/getCurrentPlan', () => ({
  getCurrentPlan: vi.fn(),
}))

const createPlan = (overrides: Partial<Plan>): Plan => ({
  id: overrides.id ?? 'plan-1',
  name: overrides.name ?? 'Inicial',
  slug: overrides.slug ?? 'initial',
  description: overrides.description ?? 'Plan disponible',
  priceMonthly: overrides.priceMonthly ?? 0,
  priceYearly: overrides.priceYearly ?? null,
  currency: overrides.currency ?? 'CLP',
  productLimit: overrides.productLimit === undefined ? 15 : overrides.productLimit,
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
    vi.mocked(getAvailablePlans).mockResolvedValue([initialPlan, proPlan, businessPlan])
    vi.mocked(getCurrentPlan).mockResolvedValue({
      plan: proPlan,
      subscription: null,
      isTrialing: false,
      isExpired: false,
    })
  })

  it('devuelve el catálogo normalizado de planes disponibles', async () => {
    const result = await getPlanCatalog()

    expect(result.plans.map((plan) => plan.slug)).toEqual(['initial', 'pro', 'business'])
    expect(result.plans[0].features).toContain('Catálogo de hasta 15 productos activos')
    expect(result.plans[1].price).toBe('$5.990 CLP')
    expect(result.plans[1].productLimit).toBeNull()
    expect(result.plans[2].ctaLabel).toBe('Hablar con ventas')
    expect(getAvailablePlans).toHaveBeenCalledTimes(1)
  })

  it('marca el plan actual del emprendedor', async () => {
    const result = await getPlanCatalog()

    expect(result.currentPlanSlug).toBe('pro')
    expect(result.plans.find((plan) => plan.slug === 'pro')?.isCurrent).toBe(true)
    expect(result.plans.find((plan) => plan.slug === 'initial')?.isCurrent).toBe(false)
  })

  it('incluye el plan actual fallback si no viene entre los disponibles', async () => {
    vi.mocked(getAvailablePlans).mockResolvedValue([proPlan, businessPlan])
    vi.mocked(getCurrentPlan).mockResolvedValue({
      plan: initialPlan,
      subscription: null,
      isTrialing: false,
      isExpired: false,
    })

    const result = await getPlanCatalog()

    expect(result.currentPlanSlug).toBe('initial')
    expect(result.plans.map((plan) => plan.slug)).toEqual(['initial', 'pro', 'business'])
    expect(result.plans.find((plan) => plan.slug === 'initial')?.isCurrent).toBe(true)
  })
})
