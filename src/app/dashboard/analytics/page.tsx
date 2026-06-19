import { Suspense } from 'react'
import { BarChart3, DollarSign, MessageCircle, ShoppingBag, TrendingUp } from 'lucide-react'
import { getSalesSummary } from '@/features/dashboard/actions/getSalesSummary'
import { getWhatsAppMetrics } from '@/features/dashboard/actions/getWhatsAppMetrics'
import { parseDateRange } from '@/features/dashboard/schemas/dateRange.schema'
import { DateRangeFilter } from '@/features/dashboard/components/DateRangeFilter'

export const metadata = { title: 'Analíticas — WALO' }

const formatter = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' })

type Props = { searchParams: Promise<{ from?: string; to?: string }> }

export default async function AnalyticsPage({ searchParams }: Props) {
    const params = await searchParams
    const dateRange = parseDateRange(params)

    const [sales, whatsapp] = await Promise.all([
        getSalesSummary(dateRange),
        getWhatsAppMetrics(dateRange),
    ])

    const hasData = sales.totalOrders > 0 || whatsapp.clicks > 0

    const kpis = [
        {
            label: 'Pedidos pagados',
            value: sales.totalOrders.toLocaleString('es-CL'),
            icon: ShoppingBag,
        },
        {
            label: 'Ingresos totales',
            value: formatter.format(sales.totalRevenue),
            icon: DollarSign,
        },
        {
            label: 'Ticket promedio',
            value: formatter.format(sales.averageOrderValue),
            icon: TrendingUp,
        },
        {
            label: 'Clics a WhatsApp',
            value: whatsapp.clicks.toLocaleString('es-CL'),
            icon: MessageCircle,
        },
    ]

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-950">Analíticas</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Métricas de tu tienda en el período seleccionado
                    </p>
                </div>
                <Suspense fallback={<div className="h-9 w-64 animate-pulse rounded-xl bg-gray-100" />}>
                    <DateRangeFilter currentFrom={params.from} currentTo={params.to} />
                </Suspense>
            </div>

            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {kpis.map((kpi) => {
                    const Icon = kpi.icon
                    return (
                        <div
                            key={kpi.label}
                            className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
                        >
                            <div className="mb-3 flex items-center gap-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50">
                                    <Icon className="h-4 w-4 text-emerald-700" />
                                </div>
                                <span className="text-xs font-medium text-gray-500">{kpi.label}</span>
                            </div>
                            <p className="text-2xl font-bold tracking-tight text-gray-950">
                                {kpi.value}
                            </p>
                        </div>
                    )
                })}
            </div>

            {!hasData ? (
                <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-12 text-center">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-50">
                        <BarChart3 className="h-7 w-7 text-gray-300" />
                    </div>
                    <h3 className="text-base font-semibold text-gray-950">
                        Sin datos en este período
                    </h3>
                    <p className="mt-2 text-sm text-gray-500">
                        Cuando tus clientes visiten tu tienda y realicen pedidos, las métricas
                        aparecerán aquí.
                    </p>
                </div>
            ) : (
                <div className="rounded-2xl border border-gray-200 bg-white p-6">
                    <h2 className="text-base font-semibold text-gray-950">Resumen del período</h2>
                    <p className="mt-1 text-sm text-gray-500">
                        {sales.totalOrders} pedido{sales.totalOrders !== 1 ? 's' : ''} completado
                        {sales.totalOrders !== 1 ? 's' : ''} · {whatsapp.clicks} clic
                        {whatsapp.clicks !== 1 ? 's' : ''} a WhatsApp
                    </p>
                </div>
            )}

            <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-6">
                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-50">
                        <BarChart3 className="h-4 w-4 text-gray-400" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-gray-950">
                            Top productos — próximamente
                        </p>
                        <p className="text-xs text-gray-400">
                            Podrás ver qué productos generan más visitas y ventas.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
