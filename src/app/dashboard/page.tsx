import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'

import { StoreStatusButton } from '@/features/store/components/StoreStatusButton'
import { ShareButton } from '@/features/store/components/ShareButton'
import { StoreForm } from '@/features/store/components/StoreForm'
import { authOptions } from '@/server/auth'
import { getCurrentPlan, getPlanUsage } from '@/features/billing/actions'
import { PlanLimitsCard } from '@/features/billing/components/PlanLimitsCard'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/login')
  }

  const { prisma } = await import('@/lib/prisma')

  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
    include: {
      memberships: {
        include: { store: true },
      },
    },
  })

  const store = user?.memberships[0]?.store

  // Fetch billing/plan information only if store exists
  let planInfo = null
  let usageInfo = null
  if (store) {
    planInfo = await getCurrentPlan()
    usageInfo = await getPlanUsage()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="mx-auto max-w-4xl px-6 py-12">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900">
            ¡Bienvenido/a, {session.user.name ?? session.user.email}! 👋
          </h1>
          <p className="mt-2 text-gray-500">
            Tu tienda está lista. Empieza a agregar productos y comparte tu catálogo.
          </p>
        </div>

        {!store && (
          <div className="mb-6 rounded-2xl border border-yellow-200 bg-yellow-50 p-6">
            <h3 className="font-semibold text-yellow-800">No tienes una tienda aún</h3>
            <p className="mt-1 text-sm text-yellow-700">Crea tu tienda para empezar a vender.</p>
          </div>
        )}

        {store && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500">
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
                  <path
                    d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <polyline
                    points="9 22 9 12 15 12 15 22"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-900">{store.name}</h2>
                <p className="text-sm text-gray-500">/{store.slug}</p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-sm text-gray-500">Link de tu tienda:</span>
              <code className="rounded-lg bg-gray-100 px-3 py-1 font-mono text-sm text-green-700">
                walo.app/{store.slug}
              </code>
              <Link
                href={`/${store.slug}`}
                target="_blank"
                className="inline-flex items-center gap-1.5 rounded-lg bg-green-500 px-3 py-1 text-sm font-semibold text-white transition-colors hover:bg-green-600"
              >
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
                Ver catálogo
              </Link>
              <ShareButton slug={store.slug} />
            </div>

            <div className="mt-4 flex items-center gap-3">
              <span
                className={`rounded-full px-3 py-1 text-sm font-medium ${
                  store.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}
              >
                {store.isActive ? 'Activa' : 'Inactiva'}
              </span>
              <StoreStatusButton storeId={store.id} isActive={store.isActive} />
            </div>

            <div className="mt-6 border-t border-gray-100 pt-6">
              <h3 className="mb-4 font-semibold text-gray-900">Editar datos de tienda</h3>
              <StoreForm
                storeId={store.id}
                initialName={store.name}
                initialSlug={store.slug}
                initialDescription={store.description}
                initialLogoUrl={store.logoUrl}
              />
            </div>
          </div>

          {planInfo && usageInfo && (
            <PlanLimitsCard
              plan={planInfo.plan}
              usage={usageInfo}
              upgradeHref="/dashboard/billing#upgrade-plans"
            />
          )}
        </div>
      )}
      </main>
    </div>
  )
}
