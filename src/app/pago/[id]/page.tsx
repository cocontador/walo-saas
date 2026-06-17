import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import RetryButton from './RetryButton'

type Props = {
    params: Promise<{ id: string }>
}

type CartItem = { id: string; name: string; price: number; quantity: number }

const formatter = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' })

export default async function PagoStatusPage({ params }: Props) {
    const { id } = await params

    const order = await prisma.order.findUnique({
        where: { id },
        include: { store: { select: { slug: true, name: true } } },
    })

    if (!order) notFound()

    const items = (order.itemsSnapshot ?? []) as CartItem[]
    const storeSlug = order.store?.slug

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-6">
            <div className="w-full max-w-sm space-y-4">

                {/* Tarjeta de estado */}
                {order.status === 'PAID' && (
                    <div className="rounded-2xl border border-green-100 bg-white p-8 text-center shadow-sm">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-50 text-green-600">
                            <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold text-green-600">¡Pago Exitoso!</h2>
                        <p className="mt-2 text-sm text-gray-500">Tu pedido ha sido confirmado. ¡Gracias por tu compra!</p>
                    </div>
                )}

                {order.status === 'PENDING' && (
                    <div className="rounded-2xl border border-yellow-100 bg-white p-8 text-center shadow-sm">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-50 text-yellow-600">
                            <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold text-yellow-600">Pago en Proceso</h2>
                        <p className="mt-2 text-sm text-gray-500">Tu pago está siendo procesado por Khipu. Esto puede tardar unos segundos.</p>
                    </div>
                )}

                {order.status === 'FAILED' && (
                    <div className="rounded-2xl border border-red-100 bg-white p-8 text-center shadow-sm">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-600">
                            <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold text-red-600">Pago Rechazado</h2>
                        <p className="mt-2 text-sm text-gray-500">Ocurrió un problema con el pago. Puedes intentarlo de nuevo.</p>
                        <div className="mt-4">
                            <RetryButton orderId={id} />
                        </div>
                    </div>
                )}

                {/* Resumen del pedido */}
                {items.length > 0 && (
                    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                        <h3 className="mb-3 text-sm font-semibold text-gray-700">Resumen del pedido</h3>
                        <div className="space-y-2">
                            {items.map((item) => (
                                <div key={item.id} className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600">
                                        {item.quantity}x {item.name}
                                    </span>
                                    <span className="font-medium text-gray-900">
                                        {formatter.format(item.price * item.quantity)}
                                    </span>
                                </div>
                            ))}
                        </div>
                        <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3">
                            <span className="text-sm font-semibold text-gray-700">Total</span>
                            <span className="text-base font-bold text-gray-900">{formatter.format(order.totalAmount)}</span>
                        </div>
                        {order.customerNotes && (
                            <p className="mt-3 rounded-lg bg-gray-50 p-2.5 text-xs text-gray-500">
                                <span className="font-semibold">Nota:</span> {order.customerNotes}
                            </p>
                        )}
                    </div>
                )}

                {/* Volver a la tienda */}
                {storeSlug && (
                    <Link
                        href={`/tienda/${storeSlug}`}
                        className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-200 bg-white py-2.5 text-sm font-semibold text-gray-600 shadow-sm transition-colors hover:bg-gray-50"
                    >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Volver a {order.store?.name ?? 'la tienda'}
                    </Link>
                )}
            </div>
        </div>
    )
}
