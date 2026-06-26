import { beforeEach, describe, expect, it, vi } from 'vitest'
import { revalidatePath } from 'next/cache'
import type { Plan, StoreSubscription } from '@prisma/client'

import { changePlan } from '@/features/billing/actions'
import { prisma } from '@/lib/prisma'
import { getUserStoreId } from '@/server/store'

const INITIAL_PLAN_CHANGE_STATE = {
  status: 'idle' as const,
  message: '',
}

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

vi.mock('@/lib/prisma', () => ({
  prisma: {
    plan: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    storeSubscription: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
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

const createSubscription = (
  plan: Plan,
  overrides: Partial<StoreSubscription> = {}
): StoreSubscription & { plan: Plan } => ({
  id: overrides.id ?? 'sub-1',
  storeId: overrides.storeId ?? 'store-1',
  planId: overrides.planId ?? plan.id,
  status: overrides.status ?? 'ACTIVE',
  billingCycle: overrides.billingCycle ?? 'MONTHLY',
  currentPeriodStart: overrides.currentPeriodStart ?? null,
  currentPeriodEnd: overrides.currentPeriodEnd ?? null,
  cancelAtPeriodEnd: overrides.cancelAtPeriodEnd ?? false,
  canceledAt: overrides.canceledAt ?? null,
  reactivatedAt: overrides.reactivatedAt ?? null,
  createdAt: overrides.createdAt ?? new Date(),
  updatedAt: overrides.updatedAt ?? new Date(),
  plan,
})

const toFormData = (planSlug: string) => {
  const formData = new FormData()
  formData.set('planSlug', planSlug)
  return formData
}

describe('changePlan', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    delete process.env.WALO_BILLING_MOCK_FAIL
    vi.mocked(getUserStoreId).mockResolvedValue('store-1')
  })

  it('crea suscripción al cambiar de Inicial fallback a Pro', async () => {
    const proPlan = createPlan({
      id: 'pro-id',
      name: 'Pro',
      slug: 'pro',
      priceMonthly: 5990,
      productLimit: null,
    })

    vi.mocked(prisma.plan.findUnique).mockResolvedValue(proPlan)
    vi.mocked(prisma.storeSubscription.findUnique).mockResolvedValue(null)
    vi.mocked(prisma.storeSubscription.create).mockResolvedValue(
      createSubscription(proPlan) as StoreSubscription
    )

    const result = await changePlan(INITIAL_PLAN_CHANGE_STATE, toFormData('pro'))

    expect(result).toEqual({
      status: 'success',
      message: 'Tu tienda ahora usa el Plan Pro.',
    })
    expect(prisma.storeSubscription.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        storeId: 'store-1',
        planId: 'pro-id',
        status: 'ACTIVE',
        billingCycle: 'MONTHLY',
        currentPeriodStart: expect.any(Date),
        currentPeriodEnd: null,
      }),
    })
    expect(revalidatePath).toHaveBeenCalledWith('/dashboard/billing')
    expect(revalidatePath).toHaveBeenCalledWith('/dashboard')
  })

  it('actualiza suscripción al cambiar de Pro a Business', async () => {
    const proPlan = createPlan({ id: 'pro-id', name: 'Pro', slug: 'pro', priceMonthly: 5990 })
    const businessPlan = createPlan({
      id: 'business-id',
      name: 'Business',
      slug: 'business',
      priceMonthly: 12990,
      productLimit: null,
    })

    vi.mocked(prisma.plan.findUnique).mockResolvedValue(businessPlan)
    vi.mocked(prisma.storeSubscription.findUnique).mockResolvedValue(createSubscription(proPlan))
    vi.mocked(prisma.storeSubscription.update).mockResolvedValue(
      createSubscription(businessPlan) as StoreSubscription
    )

    const result = await changePlan(INITIAL_PLAN_CHANGE_STATE, toFormData('business'))

    expect(result.status).toBe('success')
    expect(prisma.storeSubscription.update).toHaveBeenCalledWith({
      where: { storeId: 'store-1' },
      data: expect.objectContaining({
        planId: 'business-id',
        status: 'ACTIVE',
        billingCycle: 'MONTHLY',
        currentPeriodStart: expect.any(Date),
        currentPeriodEnd: null,
      }),
    })
  })

  it('crea suscripción gratuita con currentPeriodEnd null si no existe suscripción previa y selecciona plan gratuito no actual', async () => {
    const freePlan = createPlan({
      id: 'free-id',
      name: 'Inicial Plus',
      slug: 'initial-plus',
      priceMonthly: 0,
    })

    vi.mocked(prisma.plan.findUnique).mockResolvedValue(freePlan)
    vi.mocked(prisma.storeSubscription.findUnique).mockResolvedValue(null)
    vi.mocked(prisma.storeSubscription.create).mockResolvedValue(
      createSubscription(freePlan) as StoreSubscription
    )

    const result = await changePlan(INITIAL_PLAN_CHANGE_STATE, toFormData('initial-plus'))

    expect(result.status).toBe('success')
    expect(prisma.storeSubscription.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        planId: 'free-id',
        currentPeriodStart: null,
        currentPeriodEnd: null,
      }),
    })
  })

  it('rechaza plan inexistente o inactivo', async () => {
    vi.mocked(prisma.plan.findUnique).mockResolvedValue(null)

    const missingResult = await changePlan(INITIAL_PLAN_CHANGE_STATE, toFormData('missing'))

    expect(missingResult.status).toBe('invalid_plan')
    expect(prisma.storeSubscription.create).not.toHaveBeenCalled()
    expect(prisma.storeSubscription.update).not.toHaveBeenCalled()

    vi.mocked(prisma.plan.findUnique).mockResolvedValue(
      createPlan({ slug: 'pro', isActive: false })
    )

    const inactiveResult = await changePlan(INITIAL_PLAN_CHANGE_STATE, toFormData('pro'))

    expect(inactiveResult.status).toBe('invalid_plan')
  })

  it('no actualiza si selecciona el plan actual', async () => {
    const proPlan = createPlan({ id: 'pro-id', name: 'Pro', slug: 'pro', priceMonthly: 5990 })

    vi.mocked(prisma.plan.findUnique).mockResolvedValue(proPlan)
    vi.mocked(prisma.storeSubscription.findUnique).mockResolvedValue(createSubscription(proPlan))

    const result = await changePlan(INITIAL_PLAN_CHANGE_STATE, toFormData('pro'))

    expect(result).toEqual({
      status: 'current',
      message: 'Ya estás usando el Plan Pro.',
    })
    expect(prisma.storeSubscription.create).not.toHaveBeenCalled()
    expect(prisma.storeSubscription.update).not.toHaveBeenCalled()
  })

  it('no crea suscripción si no existe suscripción previa y selecciona Plan Inicial fallback actual', async () => {
    const initialPlan = createPlan({ id: 'initial-id', name: 'Inicial', slug: 'initial' })

    vi.mocked(prisma.plan.findUnique).mockResolvedValue(initialPlan)
    vi.mocked(prisma.storeSubscription.findUnique).mockResolvedValue(null)

    const result = await changePlan(INITIAL_PLAN_CHANGE_STATE, toFormData('initial'))

    expect(result.status).toBe('current')
    expect(prisma.storeSubscription.create).not.toHaveBeenCalled()
    expect(prisma.storeSubscription.update).not.toHaveBeenCalled()
  })

  it('retorna error si falla el intento de cobro simulado', async () => {
    process.env.WALO_BILLING_MOCK_FAIL = 'pro'
    const proPlan = createPlan({ id: 'pro-id', name: 'Pro', slug: 'pro', priceMonthly: 5990 })

    vi.mocked(prisma.plan.findUnique).mockResolvedValue(proPlan)
    vi.mocked(prisma.storeSubscription.findUnique).mockResolvedValue(null)

    const result = await changePlan(INITIAL_PLAN_CHANGE_STATE, toFormData('pro'))

    expect(result.status).toBe('payment_error')
    expect(prisma.storeSubscription.create).not.toHaveBeenCalled()
    expect(prisma.storeSubscription.update).not.toHaveBeenCalled()
  })

  it('retorna error genérico si falla la actualización de suscripción', async () => {
    const proPlan = createPlan({ id: 'pro-id', name: 'Pro', slug: 'pro', priceMonthly: 5990 })
    const businessPlan = createPlan({ id: 'business-id', name: 'Business', slug: 'business', priceMonthly: 12990 })

    vi.mocked(prisma.plan.findUnique).mockResolvedValue(businessPlan)
    vi.mocked(prisma.storeSubscription.findUnique).mockResolvedValue(createSubscription(proPlan))
    vi.mocked(prisma.storeSubscription.update).mockRejectedValue(new Error('db error'))

    const result = await changePlan(INITIAL_PLAN_CHANGE_STATE, toFormData('business'))

    expect(result).toEqual({
      status: 'error',
      message: 'No pudimos cambiar el plan. Intenta nuevamente.',
    })
  })
})
