import React from 'react'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'

import { authOptions } from '@/server/auth'
import { getCurrentPlan, getPlanUsage, getAvailablePlans } from '@/features/billing/actions'
import { PlanLimitsCard } from '@/features/billing/components/PlanLimitsCard'
import { PLAN_DETAILS_MAP } from '@/features/billing/utils/limits'

export default async function BillingPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/login')
  }

  // Fetch plan current data
  const planInfo = await getCurrentPlan()
  const usageInfo = await getPlanUsage()
  const availablePlans = await getAvailablePlans()

  // Filtramos planes para la sección de comparación/upgrade
  const upgradePlans = availablePlans.filter(p => p.slug !== planInfo.plan.slug)

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
                <dd className="font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded-full text-xs">
                  {({ ACTIVE: 'Activa', TRIALING: 'En prueba', PAST_DUE: 'Vencida', CANCELED: 'Cancelada' } as Record<string, string>)[planInfo.subscription?.status ?? ''] ?? 'Plan gratuito'}
                </dd>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <dt className="text-gray-500">Ciclo de Cobro</dt>
                <dd className="font-medium text-gray-950">
                  {planInfo.subscription
                    ? planInfo.subscription.billingCycle === 'MONTHLY' ? 'Mensual' : 'Anual'
                    : 'Sin cobro'}
                </dd>
              </div>
              {planInfo.subscription?.currentPeriodEnd && (
                <div className="flex justify-between pb-2">
                  <dt className="text-gray-500">Plan vigente</dt>
                  <dd className="font-medium text-gray-950">
                    {new Date(planInfo.subscription.currentPeriodEnd).toLocaleDateString('es-CL', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </dd>
                </div>
              )}
            </dl>
          </div>

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

      {/* Grid de comparación para mejorar el plan */}
      {upgradePlans.length > 0 && (
        <div id="upgrade-plans" className="mt-12">
          <h2 className="text-xl font-bold text-gray-900">Planes Disponibles para Upgrade</h2>
          <p className="mt-1 text-sm text-gray-500 mb-6">Elige el plan ideal para expandir tu negocio en WALO.</p>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {upgradePlans.map((upPlan) => {
              const details = PLAN_DETAILS_MAP[upPlan.slug.toLowerCase()] || {
                price: `${upPlan.priceMonthly} CLP`,
                features: upPlan.features as string[],
              }

              return (
                <div
                  key={upPlan.id}
                  className="flex flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow justify-between"
                >
                  <div>
                    <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                      Plan {upPlan.name}
                    </span>
                    <div className="mt-4">
                      <span className="text-3xl font-extrabold text-gray-950">{details.price}</span>
                    </div>
                    <p className="mt-2 text-xs text-gray-500">{upPlan.description}</p>

                    <ul className="mt-6 space-y-3">
                      {details.features.slice(0, 5).map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-gray-600">
                          <svg className="h-4.5 w-4.5 text-blue-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                          </svg>
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-8">
                    <button className="w-full rounded-xl bg-blue-600 py-3 text-center text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors">
                      Subir al Plan {upPlan.name}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </main>
  )
}
