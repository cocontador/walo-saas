import { describe, it, expect } from 'vitest'
import { evaluateLimit, normalizePlansForCatalog } from './limits'
import type { PlanDetails } from '../types'

const createPlan = (overrides: Partial<PlanDetails>): PlanDetails => ({
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

describe('evaluateLimit', () => {
  it('debe retornar status unlimited para limite null o menor que 0', () => {
    expect(evaluateLimit(10, null)).toEqual({
      status: 'unlimited',
      percentage: 0,
      isNearLimit: false,
      isReached: false,
    })

    expect(evaluateLimit(10, -1)).toEqual({
      status: 'unlimited',
      percentage: 0,
      isNearLimit: false,
      isReached: false,
    })
  })

  it('debe retornar status OK si el uso es menor al 80%', () => {
    expect(evaluateLimit(5, 10)).toEqual({
      status: 'OK',
      percentage: 50,
      isNearLimit: false,
      isReached: false,
    })

    expect(evaluateLimit(7, 10)).toEqual({
      status: 'OK',
      percentage: 70,
      isNearLimit: false,
      isReached: false,
    })
  })

  it('debe retornar status warning si el uso es >= 80% y < 100%', () => {
    expect(evaluateLimit(8, 10)).toEqual({
      status: 'warning',
      percentage: 80,
      isNearLimit: true,
      isReached: false,
    })

    expect(evaluateLimit(9, 10)).toEqual({
      status: 'warning',
      percentage: 90,
      isNearLimit: true,
      isReached: false,
    })
  })

  it('debe retornar status reached si el uso es >= 100%', () => {
    expect(evaluateLimit(10, 10)).toEqual({
      status: 'reached',
      percentage: 100,
      isNearLimit: false,
      isReached: true,
    })

    expect(evaluateLimit(12, 10)).toEqual({
      status: 'reached',
      percentage: 100,
      isNearLimit: false,
      isReached: true,
    })
  })
})

describe('normalizePlansForCatalog', () => {
  it('normaliza beneficios y marca Pro como Más popular', () => {
    const proPlan = createPlan({
      id: 'pro-id',
      name: 'Pro',
      slug: 'pro',
      priceMonthly: 5990,
      productLimit: null,
      sortOrder: 2,
    })

    const result = normalizePlansForCatalog([proPlan], proPlan)

    expect(result[0]).toMatchObject({
      slug: 'pro',
      price: '$5.990 CLP',
      productLimitLabel: 'Catálogo ilimitado de productos',
      isCurrent: true,
      isPopular: true,
    })
    expect(result[0].features).toContain('Motor de plantillas premium (Próximamente)')
  })

  it('incluye el plan actual fallback si no viene en los planes activos', () => {
    const currentPlan = createPlan({ id: 'fallback-initial', slug: 'initial', name: 'Inicial' })
    const proPlan = createPlan({ id: 'pro-id', slug: 'pro', name: 'Pro', sortOrder: 2 })

    const result = normalizePlansForCatalog([proPlan], currentPlan)

    expect(result.map((plan) => plan.slug)).toEqual(['initial', 'pro'])
    expect(result[0].isCurrent).toBe(true)
  })
})
