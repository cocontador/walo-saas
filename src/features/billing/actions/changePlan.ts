'use server'

import { revalidatePath } from 'next/cache'

import { prisma } from '@/lib/prisma'
import { getUserStoreId } from '@/server/store'
import type { PlanChangeState, PlanDetails } from '@/features/billing/types'

type BillingAttemptResult = {
  success: boolean
  message?: string
}

async function simulateBillingAttempt(plan: PlanDetails): Promise<BillingAttemptResult> {
  if (plan.priceMonthly === 0) {
    return { success: true }
  }

  // TODO: Reemplazar este mock por integración real con pasarela de pagos.
  if (process.env.WALO_BILLING_MOCK_FAIL === plan.slug) {
    return {
      success: false,
      message: 'No pudimos confirmar el intento de cobro simulado. Intenta nuevamente.',
    }
  }

  return { success: true }
}

function getSuccessMessage(plan: PlanDetails): string {
  return plan.priceMonthly === 0
    ? 'Tu tienda quedó en el Plan Inicial.'
    : `Tu tienda ahora usa el Plan ${plan.name}.`
}

export async function changePlan(
  _previousState: PlanChangeState,
  formData: FormData
): Promise<PlanChangeState> {
  try {
    const storeId = await getUserStoreId()

    if (!storeId) {
      return {
        status: 'unauthorized',
        message: 'No encontramos una tienda autenticada para cambiar el plan.',
      }
    }

    const planSlug = String(formData.get('planSlug') ?? '').trim().toLowerCase()

    if (!planSlug) {
      return {
        status: 'invalid_plan',
        message: 'Selecciona un plan válido para continuar.',
      }
    }

    const selectedPlan = await prisma.plan.findUnique({
      where: { slug: planSlug },
    })

    if (!selectedPlan?.isActive) {
      return {
        status: 'invalid_plan',
        message: 'El plan seleccionado no está disponible.',
      }
    }

    const currentSubscription = await prisma.storeSubscription.findUnique({
      where: { storeId },
      include: { plan: true },
    })

    if (currentSubscription?.plan.slug === selectedPlan.slug) {
      return {
        status: 'current',
        message: `Ya estás usando el Plan ${selectedPlan.name}.`,
      }
    }

    if (!currentSubscription && selectedPlan.slug === 'initial') {
      return {
        status: 'current',
        message: 'Ya estás usando el Plan Inicial.',
      }
    }

    const billingAttempt = await simulateBillingAttempt(selectedPlan)

    if (!billingAttempt.success) {
      return {
        status: 'payment_error',
        message: billingAttempt.message ?? 'No pudimos confirmar el intento de cobro simulado.',
      }
    }

    const now = new Date()
    const subscriptionData = {
      planId: selectedPlan.id,
      status: 'ACTIVE' as const,
      billingCycle: 'MONTHLY' as const,
      currentPeriodStart: selectedPlan.priceMonthly === 0 ? null : now,
      currentPeriodEnd: null,
      cancelAtPeriodEnd: false,
      canceledAt: null,
    }

    if (currentSubscription) {
      await prisma.storeSubscription.update({
        where: { storeId },
        data: {
          ...subscriptionData,
          reactivatedAt: currentSubscription.status === 'CANCELED'
            ? now
            : currentSubscription.reactivatedAt,
        },
      })
    } else {
      await prisma.storeSubscription.create({
        data: {
          storeId,
          ...subscriptionData,
        },
      })
    }

    revalidatePath('/dashboard/billing')
    revalidatePath('/dashboard')

    return {
      status: 'success',
      message: getSuccessMessage(selectedPlan),
    }
  } catch {
    return {
      status: 'error',
      message: 'No pudimos cambiar el plan. Intenta nuevamente.',
    }
  }
}
