import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { revalidatePath } from 'next/cache'
import type { Plan, StoreSubscription } from '@prisma/client'

import { reactivatePlan } from '@/features/billing/actions'
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
  cancelAtPeriodEnd: overrides.cancelAtPeriodEnd ?? true,
  canceledAt: overrides.canceledAt ?? new Date('2026-06-10T00:00:00.000Z'),
  reactivatedAt: overrides.reactivatedAt ?? null,
  createdAt: overrides.createdAt ?? new Date(),
  updatedAt: overrides.updatedAt ?? new Date(),
  plan: createPlan(),
})

describe('reactivatePlan', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-17T12:00:00.000Z'))
    vi.mocked(getUserStoreId).mockResolvedValue('store-1')
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('reactiva una suscripción cancelada antes de expirar y conserva el mismo plan', async () => {
    const subscription = createSubscription()

    vi.mocked(prisma.storeSubscription.findUnique).mockResolvedValue(subscription)
    vi.mocked(prisma.storeSubscription.update).mockResolvedValue({
      ...subscription,
      cancelAtPeriodEnd: false,
      canceledAt: null,
      reactivatedAt: new Date(),
    } as StoreSubscription)

    const result = await reactivatePlan(INITIAL_STATE)

    expect(result).toEqual({
      status: 'success',
      message: 'Plan activo. La renovación de tu suscripción fue reactivada.',
    })
    expect(prisma.storeSubscription.update).toHaveBeenCalledWith({
      where: { storeId: 'store-1' },
      data: {
        cancelAtPeriodEnd: false,
        canceledAt: null,
        reactivatedAt: new Date('2026-06-17T12:00:00.000Z'),
        status: 'ACTIVE',
      },
    })
    expect(prisma.storeSubscription.update).not.toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          planId: expect.any(String),
        }),
      })
    )
    expect(logInfo).toHaveBeenCalledWith(expect.objectContaining({
      event: 'billing.subscription_reactivated',
      storeId: 'store-1',
    }))
    expect(revalidatePath).toHaveBeenCalledWith('/dashboard/billing')
    expect(revalidatePath).toHaveBeenCalledWith('/dashboard')
  })

  it('no reactiva si no hay cancelación programada', async () => {
    vi.mocked(prisma.storeSubscription.findUnique).mockResolvedValue(
      createSubscription({ cancelAtPeriodEnd: false, canceledAt: null })
    )

    const result = await reactivatePlan(INITIAL_STATE)

    expect(result.status).toBe('not_canceling')
    expect(prisma.storeSubscription.update).not.toHaveBeenCalled()
  })

  it('no reactiva si ya expiró la ventana de reactivación', async () => {
    vi.mocked(prisma.storeSubscription.findUnique).mockResolvedValue(
      createSubscription({ currentPeriodEnd: new Date('2026-06-01T00:00:00.000Z') })
    )

    const result = await reactivatePlan(INITIAL_STATE)

    expect(result.status).toBe('expired')
    expect(prisma.storeSubscription.update).not.toHaveBeenCalled()
  })

  it('no reactiva si no hay suscripción', async () => {
    vi.mocked(prisma.storeSubscription.findUnique).mockResolvedValue(null)

    const result = await reactivatePlan(INITIAL_STATE)

    expect(result.status).toBe('not_found')
    expect(prisma.storeSubscription.update).not.toHaveBeenCalled()
  })
})
