'use server'

import { getUserStoreId } from '@/server/store'
import { prisma } from '@/lib/prisma'
import type { CurrentPlanInfo } from '@/features/billing/types'

/**
 * Obtiene el plan actual de la tienda autenticada
 * Busca la suscripción activa de la tienda
 * Si no existe suscripción, asigna automáticamente el plan "initial" como fallback
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

  // Fallback: obtener plan inicial como default
  let initialPlan = await prisma.plan.findUnique({
    where: { slug: 'initial' },
  })

  if (!initialPlan) {
    try {
      initialPlan = await prisma.plan.create({
        data: {
          name: 'Inicial',
          slug: 'initial',
          description: 'Plan gratuito para empezar',
          priceMonthly: 0,
          priceYearly: 0,
          currency: 'CLP',
          productLimit: 15,
          customDomain: false,
          analytics: false,
          premiumTemplates: false,
          supportLevel: 'basic',
          features: [
            'Vitrina digital estándar',
            'Carga de logotipo',
            'Pedidos vía WhatsApp',
            'SEO base',
          ],
          isActive: true,
          sortOrder: 1,
        },
      })
    } catch {
      const { FALLBACK_FREE_PLAN } = await import('@/features/billing/utils/limits')
      return {
        plan: FALLBACK_FREE_PLAN,
        subscription: null,
        isTrialing: false,
        isExpired: false,
      }
    }
  }

  // Crear suscripción por defecto al plan inicial
  try {
    const newSubscription = await prisma.storeSubscription.create({
      data: {
        storeId,
        planId: initialPlan.id,
        status: 'ACTIVE',
        billingCycle: 'MONTHLY',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 días
      },
    })

    return {
      plan: initialPlan,
      subscription: newSubscription,
      isTrialing: false,
      isExpired: false,
    }
  } catch {
    return {
      plan: initialPlan,
      subscription: null,
      isTrialing: false,
      isExpired: false,
    }
  }
}
