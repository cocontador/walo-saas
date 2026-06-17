'use server'

import { revalidatePath } from 'next/cache'

import { logError, logInfo } from '@/lib/logger'
import { prisma } from '@/lib/prisma'
import { getUserStoreId } from '@/server/store'
import type { SubscriptionRenewalActionState } from '@/features/billing/types'

function isExpired(currentPeriodEnd: Date | null): boolean {
  return currentPeriodEnd !== null && currentPeriodEnd <= new Date()
}

function isActiveOrCurrent(status: string, currentPeriodEnd: Date | null): boolean {
  if (status === 'ACTIVE' || status === 'TRIALING') {
    return !isExpired(currentPeriodEnd)
  }

  return status === 'PAST_DUE' && currentPeriodEnd !== null && !isExpired(currentPeriodEnd)
}

export async function cancelPlanRenewal(
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
        message: 'No encontramos una tienda autenticada para cancelar la renovación.',
      }
    }

    const subscription = await prisma.storeSubscription.findUnique({
      where: { storeId },
      include: { plan: true },
    })

    if (!subscription) {
      return {
        status: 'not_found',
        message: 'No encontramos una suscripción activa para tu tienda.',
      }
    }

    if (subscription.cancelAtPeriodEnd) {
      return {
        status: 'already_canceled',
        message: 'La renovación de tu plan ya está cancelada.',
      }
    }

    if (!isActiveOrCurrent(subscription.status, subscription.currentPeriodEnd)) {
      return {
        status: isExpired(subscription.currentPeriodEnd) ? 'expired' : 'invalid_state',
        message: 'No pudimos cancelar la renovación porque la suscripción no está vigente.',
      }
    }

    const now = new Date()

    await prisma.storeSubscription.update({
      where: { storeId },
      data: {
        cancelAtPeriodEnd: true,
        canceledAt: now,
      },
    })

    logInfo({
      event: 'billing.subscription_renewal_canceled',
      scope: 'billing',
      message: 'Store subscription renewal was canceled at period end.',
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
      message: 'Renovación cancelada. Tu plan seguirá activo hasta el fin del período.',
    }
  } catch (error) {
    logError({
      event: 'billing.subscription_renewal_cancel_failed',
      scope: 'billing',
      message: 'Failed to cancel subscription renewal.',
      meta: {
        error: error instanceof Error ? error.message : 'unknown',
      },
    })

    return {
      status: 'error',
      message: 'No pudimos cancelar la renovación. Intenta nuevamente.',
    }
  }
}
