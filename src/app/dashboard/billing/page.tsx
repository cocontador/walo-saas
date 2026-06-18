import React from 'react'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'

import { authOptions } from '@/server/auth'
import { getPlanCatalog, getPlanUsage } from '@/features/billing/actions'
import { PlanComparisonCards } from '@/features/billing/components/PlanComparisonCards'
import { PlanLimitsCard } from '@/features/billing/components/PlanLimitsCard'

export default async function BillingPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/login')
  }

  const [usageInfo, planCatalog] = await Promise.all([
    getPlanUsage(),
    getPlanCatalog(),
  ])
  const currentPlan = planCatalog.plans.find((plan) => plan.isCurrent) ?? planCatalog.plans[0]

  if (!currentPlan) {
    throw new Error('No billing plans available')
  }

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
          <PlanLimitsCard plan={currentPlan} usage={usageInfo} upgradeHref="#upgrade-plans" />
        </div>

        {/* Sección de Soporte o Detalles Adicionales */}
        <div className="flex flex-col gap-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Detalles de Suscripción</h3>
            <dl className="mt-4 space-y-4 text-sm">
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <dt className="text-gray-500">Estado</dt>
                <dd className="font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded-full text-xs">
                  {currentPlan?.slug === 'initial' ? 'Plan gratuito' : 'Plan activo'}
                </dd>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <dt className="text-gray-500">Ciclo de Cobro</dt>
                <dd className="font-medium text-gray-950">
                  {currentPlan?.slug === 'initial' ? 'Sin cobro' : 'Mensual'}
                </dd>
              </div>
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

      <section id="upgrade-plans" className="mt-12">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900">Planes disponibles</h2>
          <p className="mt-1 text-sm text-gray-500">
            Compara beneficios, límites y opciones para elegir el plan ideal para tu negocio.
          </p>
        </div>

        <PlanComparisonCards plans={planCatalog.plans} />
      </section>
    </main>
  )
}
