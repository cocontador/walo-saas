import React from 'react'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'

import { authOptions } from '@/server/auth'
import { getCurrentPlan, getPlanCatalog, getPlanUsage } from '@/features/billing/actions'
import { PlanComparisonCards } from '@/features/billing/components/PlanComparisonCards'
import { PlanLimitsCard } from '@/features/billing/components/PlanLimitsCard'
import { SubscriptionRenewalForm } from '@/features/billing/components/SubscriptionRenewalForm'

function formatBillingDate(date: Date) {
  return new Date(date).toLocaleDateString('es-CL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export default async function BillingPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/login')
  }

  // Fetch plan current data
  const planInfo = await getCurrentPlan()
  const usageInfo = await getPlanUsage()
  const planCatalog = await getPlanCatalog()
  const subscription = planInfo.subscription
  const hasScheduledCancellation = Boolean(subscription?.cancelAtPeriodEnd)
  const canManageRenewal = Boolean(subscription && !planInfo.isExpired)
  const statusLabel = hasScheduledCancellation
    ? 'Renovación cancelada'
    : ({ ACTIVE: 'Plan activo', TRIALING: 'En prueba', PAST_DUE: 'Pago pendiente', CANCELED: 'Cancelada' } as Record<string, string>)[subscription?.status ?? ''] ?? 'Plan gratuito'
  const statusClasses = hasScheduledCancellation
    ? 'bg-amber-50 text-amber-800'
    : subscription
      ? 'bg-green-50 text-green-700'
      : 'bg-gray-100 text-gray-700'

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:py-12">
      {/* Encabezado de la página */}
      <div className="mb-8 border-b border-gray-200 pb-5">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Mi Plan</h1>
        <p className="mt-2 text-sm text-gray-500">
          Revisa el estado de tu suscripción actual, consumo de recursos y mejora tu plan.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Tarjeta de Límites y Consumo actual (toma 2 columnas) */}
        <div className="lg:col-span-2">
          <PlanLimitsCard plan={planInfo.plan} usage={usageInfo} upgradeHref="#upgrade-plans" />
        </div>

        {/* Sección de Soporte o Detalles Adicionales */}
        <div className="flex flex-col gap-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Detalles de Suscripción</h3>
            <dl className="mt-4 space-y-4 text-sm">
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <dt className="text-gray-500">Estado</dt>
                <dd className={`rounded-full px-2 py-0.5 text-xs font-semibold ${statusClasses}`}>
                  {statusLabel}
                </dd>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <dt className="text-gray-500">Ciclo de Cobro</dt>
                <dd className="font-medium text-gray-950">
                  {subscription
                    ? subscription.billingCycle === 'MONTHLY' ? 'Mensual' : 'Anual'
                    : 'Sin cobro'}
                </dd>
              </div>
              {subscription?.currentPeriodEnd && (
                <div className="flex justify-between pb-2">
                  <dt className="text-gray-500">Plan vigente</dt>
                  <dd className="font-medium text-gray-950">
                    {formatBillingDate(subscription.currentPeriodEnd)}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {hasScheduledCancellation && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <h4 className="text-sm font-semibold text-amber-900">Renovación cancelada</h4>
              <p className="mt-2 text-xs leading-relaxed text-amber-800">
                Tu plan seguirá activo hasta el fin del período
                {subscription?.currentPeriodEnd ? ` (${formatBillingDate(subscription.currentPeriodEnd)})` : ''}.
              </p>
            </div>
          )}

          {canManageRenewal && (
            <SubscriptionRenewalForm
              actionType={hasScheduledCancellation ? 'reactivate' : 'cancel'}
            />
          )}

          <div className="rounded-xl bg-gray-50 p-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">¿Necesitas ayuda?</h4>
            <p className="mt-2 text-xs text-gray-600 leading-relaxed">
              Si tienes dudas con tus límites o deseas un plan personalizado, contacta a nuestro equipo de soporte.
            </p>
            <a
              // TODO: Reemplazar soporte@walo.local por el correo real de soporte antes de producción.
              href="mailto:soporte@walo.local"
              className="mt-3 inline-block text-xs font-semibold text-green-600 hover:text-green-700"
            >
              Contactar Soporte →
            </a>
          </div>
        </div>
      </div>

      <section id="upgrade-plans" className="mt-12">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900">Planes disponibles</h2>
          <p className="mt-1 text-sm text-gray-500">
            Compara beneficios, límites y opciones para elegir el plan ideal para tu negocio.
          </p>
        </div>

        <PlanComparisonCards
          plans={planCatalog.plans}
          isCurrentPlanRenewalCanceled={hasScheduledCancellation}
        />
      </section>
    </main>
  )
}
