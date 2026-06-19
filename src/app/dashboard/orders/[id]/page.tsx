import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/server/auth'
import { getUserStoreId } from '@/server/store'

type OrderItem = { id: string; name: string; price: number; quantity: number }

async function getOrder(id: string, storeId: string) {
    const { prisma } = await import('@/lib/prisma')
    return prisma.order.findFirst({
        where: { id, storeId },
        include: { paymentAttempts: { orderBy: { createdAt: 'desc' } } },
    })
}

const formatter = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' })

const STATUS = {
    PAID:     { label: 'Pagado',    cls: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
    PENDING:  { label: 'Pendiente', cls: 'bg-amber-100 text-amber-700 border-amber-200' },
    FAILED:   { label: 'Fallido',   cls: 'bg-red-100 text-red-700 border-red-200' },
    CANCELED: { label: 'Cancelado', cls: 'bg-gray-100 text-gray-600 border-gray-200' },
} as const

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    return { title: `Pedido ${id.slice(-6).toUpperCase()} — WALO` }
}

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params

    const session = await getServerSession(authOptions)
    if (!session?.user) redirect('/login')

    const storeId = await getUserStoreId()
    if (!storeId) redirect('/dashboard')

    const order = await getOrder(id, storeId)
    if (!order) notFound()

    const items = (order.itemsSnapshot ?? []) as OrderItem[]
    const s = STATUS[order.status as keyof typeof STATUS] ?? STATUS.PENDING

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <Link
                    href="/dashboard/orders"
                    className="text-sm text-gray-500 hover:text-gray-900"
                >
                    ← Pedidos
                </Link>
                <span className="text-gray-300">/</span>
                <span className="text-sm font-mono text-gray-600">#{order.id.slice(-8).toUpperCase()}</span>
            </div>

            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-950">
                        Pedido #{order.id.slice(-8).toUpperCase()}
                    </h1>
                    <p className="mt-1 text-sm text-gray-500">
                        {order.createdAt.toLocaleString('es-CL', {
                            weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
                            hour: '2-digit', minute: '2-digit',
                        })}
                    </p>
                </div>
                <span className={`inline-flex items-center rounded-xl border px-4 py-2 text-sm font-semibold ${s.cls}`}>
                    {s.label}
                </span>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-6">
                    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                        <div className="border-b border-gray-100 px-6 py-4">
                            <h2 className="text-sm font-semibold text-gray-950">Productos</h2>
                        </div>
                        <ul className="divide-y divide-gray-100">
                            {items.map((item) => (
                                <li key={item.id} className="flex items-center justify-between px-6 py-4">
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{item.name}</p>
                                        <p className="text-xs text-gray-400">{formatter.format(item.price)} c/u</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-gray-500">× {item.quantity}</p>
                                        <p className="text-sm font-semibold text-gray-900">
                                            {formatter.format(item.price * item.quantity)}
                                        </p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                        <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-6 py-4">
                            <span className="text-sm font-semibold text-gray-700">Total</span>
                            <span className="text-lg font-bold text-gray-950">{formatter.format(order.totalAmount)}</span>
                        </div>
                    </div>

                    {order.customerNotes && (
                        <div className="rounded-2xl border border-gray-200 bg-white px-6 py-5 shadow-sm">
                            <h2 className="mb-2 text-sm font-semibold text-gray-950">Nota del cliente</h2>
                            <p className="text-sm text-gray-600">{order.customerNotes}</p>
                        </div>
                    )}
                </div>

                <div className="space-y-6">
                    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                        <div className="border-b border-gray-100 px-6 py-4">
                            <h2 className="text-sm font-semibold text-gray-950">Pago Khipu</h2>
                        </div>
                        {order.paymentAttempts.length === 0 ? (
                            <p className="px-6 py-4 text-sm text-gray-400">Sin intentos de pago registrados.</p>
                        ) : (
                            <ul className="divide-y divide-gray-100">
                                {order.paymentAttempts.map((attempt) => (
                                    <li key={attempt.id} className="px-6 py-4 space-y-1">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-medium text-gray-500">Estado</span>
                                            <span className="text-xs font-semibold text-gray-800 capitalize">{attempt.status}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-medium text-gray-500">ID Khipu</span>
                                            <span className="text-xs font-mono text-gray-700">{attempt.khipuPaymentId}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-medium text-gray-500">Fecha</span>
                                            <span className="text-xs text-gray-600">
                                                {attempt.createdAt.toLocaleString('es-CL', {
                                                    day: '2-digit', month: '2-digit', year: 'numeric',
                                                    hour: '2-digit', minute: '2-digit',
                                                })}
                                            </span>
                                        </div>
                                        <a
                                            href={attempt.khipuPaymentUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-block mt-1 text-xs text-emerald-700 hover:underline"
                                        >
                                            Ver en Khipu →
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <div className="rounded-2xl border border-gray-200 bg-white px-6 py-4 shadow-sm">
                        <h2 className="mb-3 text-sm font-semibold text-gray-950">Detalles</h2>
                        <dl className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <dt className="text-gray-500">ID del pedido</dt>
                                <dd className="font-mono text-xs text-gray-700">{order.id}</dd>
                            </div>
                            <div className="flex justify-between text-sm">
                                <dt className="text-gray-500">Creado</dt>
                                <dd className="text-gray-700">
                                    {order.createdAt.toLocaleDateString('es-CL')}
                                </dd>
                            </div>
                            <div className="flex justify-between text-sm">
                                <dt className="text-gray-500">Actualizado</dt>
                                <dd className="text-gray-700">
                                    {order.updatedAt.toLocaleDateString('es-CL')}
                                </dd>
                            </div>
                        </dl>
                    </div>
                </div>
            </div>
        </div>
    )
}
