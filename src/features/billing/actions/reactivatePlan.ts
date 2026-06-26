'use server'

import { revalidatePath } from 'next/cache'

import { logError, logInfo } from '@/lib/logger'
import { prisma } from '@/lib/prisma'
import { getUserStoreId } from '@/server/store'
import type { SubscriptionRenewalActionState } from '@/features/billing/types'

function isExpired(currentPeriodEnd: Date | null): boolean {
  return currentPeriodEnd !== null && currentPeriodEnd <= new Date()
}

export async function reactivatePlan(
  previousState: SubscriptionRenewalActionState,
  formData?: FormData
): Promise<SubscriptionRenewalActionState> {
  void previousState
  void formData

  try {
    const storeId = await getUserStoreId()

    if (!storeId) {
      return {
        status: 'unauthorized',
        message: 'No encontramos una tienda autenticada para reactivar el plan.',
      }
    }

    const subscription = await prisma.storeSubscription.findUnique({
      where: { storeId },
      include: { plan: true },
    })

    if (!subscription) {
      return {
        status: 'not_found',
        message: 'No encontramos una suscripción para reactivar.',
      }
    }

    if (!subscription.cancelAtPeriodEnd) {
      return {
        status: 'not_canceling',
        message: 'Tu plan ya está activo y con renovación vigente.',
      }
    }

    if (isExpired(subscription.currentPeriodEnd)) {
      return {
        status: 'expired',
        message: 'La ventana de reactivación expiró. Elige un plan para continuar.',
      }
    }

    const now = new Date()

    await prisma.storeSubscription.update({
      where: { storeId },
      data: {
        cancelAtPeriodEnd: false,
        canceledAt: null,
        reactivatedAt: now,
        status: 'ACTIVE',
      },
    })

    logInfo({
      event: 'billing.subscription_reactivated',
      scope: 'billing',
      message: 'Store subscription renewal was reactivated.',
      storeId,
      meta: {
        subscriptionId: subscription.id,
        planSlug: subscription.plan.slug,
        currentPeriodEnd: subscription.currentPeriodEnd?.toISOString() ?? null,
        // TODO: Persistir este evento en una tabla formal de auditoria cuando exista.
      },
    })

    revalidatePath('/dashboard/billing')
    revalidatePath('/dashboard')

    return {
      status: 'success',
      message: 'Plan activo. La renovación de tu suscripción fue reactivada.',
    }
  } catch (error) {
    logError({
      event: 'billing.subscription_reactivation_failed',
      scope: 'billing',
      message: 'Failed to reactivate subscription.',
      meta: {
        error: error instanceof Error ? error.message : 'unknown',
      },
    })

    return {
      status: 'error',
      message: 'No pudimos reactivar el plan. Intenta nuevamente.',
    }
  }
}
