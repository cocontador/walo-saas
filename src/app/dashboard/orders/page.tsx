import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/server/auth'
import { getUserStoreId } from '@/server/store'

type OrderItem = { id: string; name: string; price: number; quantity: number }

async function getStoreOrders(storeId: string) {
    const { prisma } = await import('@/lib/prisma')
    return prisma.order.findMany({
        where: { storeId },
        orderBy: { createdAt: 'desc' },
        take: 100,
    })
}

const formatter = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' })

const STATUS = {
    PAID:     { label: 'Pagado',    cls: 'bg-emerald-100 text-emerald-700' },
    PENDING:  { label: 'Pendiente', cls: 'bg-amber-100 text-amber-700' },
    FAILED:   { label: 'Fallido',   cls: 'bg-red-100 text-red-700' },
    CANCELED: { label: 'Cancelado', cls: 'bg-gray-100 text-gray-600' },
} as const

export const metadata = { title: 'Pedidos — WALO' }

export default async function OrdersPage() {
    const session = await getServerSession(authOptions)
    if (!session?.user) redirect('/login')

    const storeId = await getUserStoreId()
    if (!storeId) {
        return (
            <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center">
                <p className="text-gray-500">No tienes una tienda configurada.</p>
            </div>
        )
    }

    const orders = await getStoreOrders(storeId)
    const paid = orders.filter(o => o.status === 'PAID').length

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-950">Pedidos</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        {orders.length} pedido{orders.length !== 1 ? 's' : ''} · {paid} pagado{paid !== 1 ? 's' : ''}
                    </p>
                </div>
            </div>

            {orders.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-12 text-center">
                    <p className="text-4xl mb-4">🛒</p>
                    <h3 className="text-base font-semibold text-gray-950">Sin pedidos aún</h3>
                    <p className="mt-2 text-sm text-gray-500">
                        Cuando tus clientes completen una compra, aparecerán aquí.
                    </p>
                </div>
            ) : (
                <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="border-b border-gray-200 bg-gray-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold tracking-wider text-gray-600">FECHA</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold tracking-wider text-gray-600">ESTADO</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold tracking-wider text-gray-600">PRODUCTOS</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold tracking-wider text-gray-600">NOTA DEL CLIENTE</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold tracking-wider text-gray-600">TOTAL</th>
                                    <th className="px-6 py-4" />
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {orders.map((order) => {
                                    const items = (order.itemsSnapshot ?? []) as OrderItem[]
                                    const s = STATUS[order.status as keyof typeof STATUS] ?? STATUS.PENDING
                                    return (
                                        <tr key={order.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                                                {order.createdAt.toLocaleString('es-CL', {
                                                    day: '2-digit', month: '2-digit', year: 'numeric',
                                                    hour: '2-digit', minute: '2-digit',
                                                })}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${s.cls}`}>
                                                    {s.label}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-700">
                                                <ul className="space-y-0.5">
                                                    {items.map((item) => (
                                                        <li key={item.id}>
                                                            <span className="font-medium">{item.quantity}×</span> {item.name}
                                                            <span className="ml-1 text-gray-400">({formatter.format(item.price)} c/u)</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">
                                                {order.customerNotes ?? <span className="text-gray-300">—</span>}
                                            </td>
                                            <td className="px-6 py-4 text-right text-sm font-bold text-gray-900 whitespace-nowrap">
                                                {formatter.format(order.totalAmount)}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Link
                                                    href={`/dashboard/orders/${order.id}`}
                                                    className="text-sm font-medium text-emerald-700 hover:text-emerald-900 hover:underline whitespace-nowrap"
                                                >
                                                    Ver detalle →
                                                </Link>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    )
}
