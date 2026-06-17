import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { revalidatePath } from 'next/cache'
import type { Plan, StoreSubscription } from '@prisma/client'

import { cancelPlanRenewal } from '@/features/billing/actions'
import { logInfo } from '@/lib/logger'
import { prisma } from '@/lib/prisma'
import { getUserStoreId } from '@/server/store'

const INITIAL_STATE = {
  status: 'idle' as const,
  message: '',
}

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

vi.mock('@/lib/logger', () => ({
  logError: vi.fn(),
  logInfo: vi.fn(),
}))

vi.mock('@/lib/prisma', () => ({
  prisma: {
    storeSubscription: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}))

vi.mock('@/server/store', () => ({
  getUserStoreId: vi.fn(),
}))

const createPlan = (overrides: Partial<Plan> = {}): Plan => ({
  id: overrides.id ?? 'plan-pro',
  name: overrides.name ?? 'Pro',
  slug: overrides.slug ?? 'pro',
  description: overrides.description ?? 'Plan profesional',
  priceMonthly: overrides.priceMonthly ?? 5990,
  priceYearly: overrides.priceYearly ?? null,
  currency: overrides.currency ?? 'CLP',
  productLimit: overrides.productLimit ?? null,
  customDomain: overrides.customDomain ?? true,
  analytics: overrides.analytics ?? true,
  premiumTemplates: overrides.premiumTemplates ?? true,
  supportLevel: overrides.supportLevel ?? 'email',
  features: overrides.features ?? [],
  limitations: overrides.limitations ?? null,
  isActive: overrides.isActive ?? true,
  sortOrder: overrides.sortOrder ?? 2,
  createdAt: overrides.createdAt ?? new Date(),
  updatedAt: overrides.updatedAt ?? new Date(),
})

const createSubscription = (
  overrides: Partial<StoreSubscription> = {}
): StoreSubscription & { plan: Plan } => ({
  id: overrides.id ?? 'sub-1',
  storeId: overrides.storeId ?? 'store-1',
  planId: overrides.planId ?? 'plan-pro',
  status: overrides.status ?? 'ACTIVE',
  billingCycle: overrides.billingCycle ?? 'MONTHLY',
  currentPeriodStart: overrides.currentPeriodStart ?? new Date('2026-06-01T00:00:00.000Z'),
  currentPeriodEnd: overrides.currentPeriodEnd ?? new Date('2026-07-01T00:00:00.000Z'),
  cancelAtPeriodEnd: overrides.cancelAtPeriodEnd ?? false,
  canceledAt: overrides.canceledAt ?? null,
  reactivatedAt: overrides.reactivatedAt ?? null,
  createdAt: overrides.createdAt ?? new Date(),
  updatedAt: overrides.updatedAt ?? new Date(),
  plan: createPlan(),
})

describe('cancelPlanRenewal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-17T12:00:00.000Z'))
    vi.mocked(getUserStoreId).mockResolvedValue('store-1')
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('cancela la renovación de un plan activo sin cambiar el plan ni el status', async () => {
    const subscription = createSubscription()

    vi.mocked(prisma.storeSubscription.findUnique).mockResolvedValue(subscription)
    vi.mocked(prisma.storeSubscription.update).mockResolvedValue({
      ...subscription,
      cancelAtPeriodEnd: true,
      canceledAt: new Date(),
    } as StoreSubscription)

    const result = await cancelPlanRenewal(INITIAL_STATE)

    expect(result).toEqual({
      status: 'success',
      message: 'Renovación cancelada. Tu plan seguirá activo hasta el fin del período.',
    })
    expect(prisma.storeSubscription.update).toHaveBeenCalledWith({
      where: { storeId: 'store-1' },
      data: {
        cancelAtPeriodEnd: true,
        canceledAt: new Date('2026-06-17T12:00:00.000Z'),
      },
    })
    expect(prisma.storeSubscription.update).not.toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          planId: expect.any(String),
          status: 'CANCELED',
        }),
      })
    )
    expect(logInfo).toHaveBeenCalledWith(expect.objectContaining({
      event: 'billing.subscription_renewal_canceled',
      storeId: 'store-1',
    }))
    expect(revalidatePath).toHaveBeenCalledWith('/dashboard/billing')
    expect(revalidatePath).toHaveBeenCalledWith('/dashboard')
  })

  it('no cancela si no hay suscripción', async () => {
    vi.mocked(prisma.storeSubscription.findUnique).mockResolvedValue(null)

    const result = await cancelPlanRenewal(INITIAL_STATE)

    expect(result.status).toBe('not_found')
    expect(prisma.storeSubscription.update).not.toHaveBeenCalled()
  })

  it('no cancela si la renovación ya está cancelada', async () => {
    vi.mocked(prisma.storeSubscription.findUnique).mockResolvedValue(
      createSubscription({ cancelAtPeriodEnd: true })
    )

    const result = await cancelPlanRenewal(INITIAL_STATE)

    expect(result.status).toBe('already_canceled')
    expect(prisma.storeSubscription.update).not.toHaveBeenCalled()
  })

  it('no cancela si la suscripción ya expiró', async () => {
    vi.mocked(prisma.storeSubscription.findUnique).mockResolvedValue(
      createSubscription({ currentPeriodEnd: new Date('2026-06-01T00:00:00.000Z') })
    )

    const result = await cancelPlanRenewal(INITIAL_STATE)

    expect(result.status).toBe('expired')
    expect(prisma.storeSubscription.update).not.toHaveBeenCalled()
  })
})
