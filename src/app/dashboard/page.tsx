import { Suspense } from 'react'
import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { ArrowRight, ExternalLink, FolderTree, Package, Settings, Store, Wallet } from 'lucide-react'

import { StoreStatusButton } from '@/features/store/components/StoreStatusButton'
import { ShareButton } from '@/features/store/components/ShareButton'
import { StoreForm } from '@/features/store/components/StoreForm'
import { authOptions } from '@/server/auth'
import { getCurrentPlan, getPlanUsage } from '@/features/billing/actions'
import { PlanLimitsCard } from '@/features/billing/components/PlanLimitsCard'
import { DateRangeFilter } from '@/features/dashboard/components/DateRangeFilter'
import { getSalesSummary } from '@/features/dashboard/actions/getSalesSummary'
import { getWhatsAppMetrics } from '@/features/dashboard/actions/getWhatsAppMetrics'
import { parseDateRange } from '@/features/dashboard/schemas/dateRange.schema'

const formatter = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' })

type QuickAction = {
  title: string
  description: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  external?: boolean
}

type Props = {
  searchParams: Promise<{ from?: string; to?: string }>
}

export default async function DashboardPage({ searchParams }: Props) {
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

  const params = await searchParams
  const dateRange = parseDateRange(params)

  let planInfo = null
  let usageInfo = null
  let sales = null
  let whatsapp = null

  if (store) {
    ;[planInfo, usageInfo, sales, whatsapp] = await Promise.all([
      getCurrentPlan(),
      getPlanUsage(),
      getSalesSummary(dateRange),
      getWhatsAppMetrics(dateRange),
    ])
  }

  const quickActions: QuickAction[] = store
    ? [
        {
          title: 'Gestionar productos',
          description: 'Agrega, edita y ordena tu catálogo.',
          href: '/dashboard/products',
          icon: Package,
        },
        {
          title: 'Ordenar categorías',
          description: 'Facilita que tus clientes encuentren lo que buscan.',
          href: '/dashboard/categories',
          icon: FolderTree,
        },
        {
          title: 'Ver tienda pública',
          description: 'Revisa cómo se ve tu vitrina online.',
          href: `/${store.slug}`,
          icon: ExternalLink,
          external: true,
        },
        {
          title: 'Mi plan',
          description: 'Consulta límites, beneficios y suscripción.',
          href: '/dashboard/billing',
          icon: Wallet,
        },
      ]
    : []

  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm md:p-8">
        <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-emerald-100/70 blur-3xl" />
        <div className="absolute bottom-0 right-24 h-32 w-32 rounded-full bg-lime-100/70 blur-3xl" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold uppercase tracking-widest text-emerald-800">
              <Store className="h-3.5 w-3.5" />
              Panel de tienda
            </span>
            <h1 className="mt-4 text-3xl font-black tracking-tight text-gray-950 md:text-4xl">
              Hola, {session.user.name ?? session.user.email}
            </h1>
            <p className="mt-3 text-base leading-7 text-gray-600">
              Gestiona tu vitrina WALO, mantén tus productos al día y comparte tu catálogo con una experiencia más clara para tus clientes.
            </p>
          </div>

          {store && (
            <Link
              href={`/${store.slug}`}
              target="_blank"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
            >
              Ver tienda pública
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      </div>

      {!store && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
          <h3 className="font-semibold text-amber-900">No tienes una tienda aún</h3>
          <p className="mt-1 text-sm text-amber-800">Crea tu tienda para empezar a vender.</p>
        </div>
      )}

      {store && (
        <div className="space-y-8">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-gray-900">Métricas del período</h2>
              <Suspense fallback={<div className="h-9 w-64 animate-pulse rounded-xl bg-gray-100" />}>
                <DateRangeFilter currentFrom={params.from} currentTo={params.to} />
              </Suspense>
            </div>

            {sales && whatsapp && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Pedidos</p>
                  <p className="mt-1 text-2xl font-bold text-gray-900">{sales.totalOrders}</p>
                </div>
                <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Ingresos</p>
                  <p className="mt-1 text-2xl font-bold text-gray-900">
                    {formatter.format(sales.totalRevenue)}
                  </p>
                </div>
                <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Clics WhatsApp</p>
                  <p className="mt-1 text-2xl font-bold text-gray-900">{whatsapp.clicks}</p>
                </div>
              </div>
            )}
          </div>

          <section className="grid gap-4 lg:grid-cols-4">
            {quickActions.map((action) => {
              const Icon = action.icon

              return (
                <Link
                  key={action.href}
                  href={action.href}
                  target={action.external ? '_blank' : undefined}
                  className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md"
                >
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 transition group-hover:bg-emerald-600 group-hover:text-white">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-sm font-bold text-gray-950">{action.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-gray-500">{action.description}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-emerald-700">
                    Abrir
                    <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                  </span>
                </Link>
              )
            })}
          </section>

          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
            <div className="flex flex-col gap-5 border-b border-gray-100 pb-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-sm">
                  <Store className="h-6 w-6" />
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-emerald-700">Tienda activa</p>
                  <h2 className="mt-1 text-2xl font-black tracking-tight text-gray-950">{store.name}</h2>
                  <p className="text-sm text-gray-500">/{store.slug}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <span
                  className={`rounded-full px-3 py-1 text-sm font-semibold ${
                    store.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                  }`}
                >
                  {store.isActive ? 'Activa' : 'Inactiva'}
                </span>
                <StoreStatusButton storeId={store.id} isActive={store.isActive} />
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Link de tu tienda</p>
                  <code className="mt-1 block break-all font-mono text-sm font-semibold text-emerald-700">
                    walo.app/{store.slug}
                  </code>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link
                    href={`/${store.slug}`}
                    target="_blank"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-950 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-gray-800"
                  >
                    Ver catálogo
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                  <ShareButton slug={store.slug} />
                </div>
              </div>
            </div>

            <div className="mt-8">
              <div className="mb-4 flex items-center gap-2">
                <Settings className="h-5 w-5 text-emerald-700" />
                <h3 className="font-bold text-gray-950">Editar datos de tienda</h3>
              </div>
              <StoreForm
                storeId={store.id}
                initialName={store.name}
                initialSlug={store.slug}
                initialDescription={store.description}
                initialLogoUrl={store.logoUrl}
                initialWhatsapp={store.whatsappPhone}
                initialAllowPickup={false}
                initialAllowDelivery={false}
                initialPickupAddress={null}
                initialDeliveryCost={null}
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
    </div>
  )
}
