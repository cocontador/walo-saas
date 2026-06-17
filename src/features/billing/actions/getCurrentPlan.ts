'use server'

import { getUserStoreId } from '@/server/store'
import { prisma } from '@/lib/prisma'
import type { CurrentPlanInfo } from '@/features/billing/types'
import { FALLBACK_FREE_PLAN } from '@/features/billing/utils/limits'

/**
 * Obtiene el plan actual de la tienda autenticada
 * Busca la suscripción activa de la tienda
 * Si no existe suscripción, retorna un plan gratuito fallback sin escribir en BD
 */
export async function getCurrentPlan(): Promise<CurrentPlanInfo> {
  const storeId = await getUserStoreId()

  if (!storeId) {
    throw new Error('No authenticated store found')
  }

  // Buscar suscripción existente
  const subscription = await prisma.storeSubscription.findUnique({
    where: { storeId },
    include: { plan: true },
  })

  if (subscription) {
    return {
      plan: subscription.plan,
      subscription,
      isTrialing: subscription.status === 'TRIALING',
      isExpired:
        subscription.currentPeriodEnd !== null &&
        subscription.currentPeriodEnd < new Date(),
    }
  }

  const initialPlan = await prisma.plan.findUnique({
    where: { slug: 'initial' },
  })

  return {
    plan: initialPlan ?? FALLBACK_FREE_PLAN,
    subscription: null,
    isTrialing: false,
    isExpired: false,
  }
}
