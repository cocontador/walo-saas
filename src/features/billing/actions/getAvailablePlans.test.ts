import { describe, it, expect, beforeEach, vi } from 'vitest'
import { getAvailablePlans } from '@/features/billing/actions'
import { prisma } from '@/lib/prisma'

// Mock de prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    plan: {
      findMany: vi.fn(),
    },
  },
}))

describe('getAvailablePlans', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('debe retornar planes activos ordenados por sortOrder', async () => {
    const mockPlans = [
      {
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
      {
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
    ]

    vi.mocked(prisma.plan.findMany).mockResolvedValue(mockPlans)

    const plans = await getAvailablePlans()

    expect(plans).toHaveLength(2)
    expect(plans[0].sortOrder).toBe(1)
    expect(plans[1].sortOrder).toBe(2)
    expect(prisma.plan.findMany).toHaveBeenCalledWith({
      where: {
        isActive: true,
      },
      orderBy: {
        sortOrder: 'asc',
      },
    })
  })

  it('debe retornar solo planes activos', async () => {
    const mockPlans = [
      {
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
    ]

    vi.mocked(prisma.plan.findMany).mockResolvedValue(mockPlans)

    const plans = await getAvailablePlans()

    expect(plans.every((p) => p.isActive)).toBe(true)
  })

  it('debe retornar array vacío si no hay planes activos', async () => {
    vi.mocked(prisma.plan.findMany).mockResolvedValue([])

    const plans = await getAvailablePlans()

    expect(plans).toEqual([])
  })
})
