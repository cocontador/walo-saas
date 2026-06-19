import { notFound } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, Clock, XCircle, ArrowLeft, ShoppingBag } from 'lucide-react'
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
    const storeName = order.store?.name ?? 'la tienda'

    return (
        <div className="flex min-h-screen flex-col bg-gray-50">
            {/* Header */}
            <header className="border-b border-gray-200 bg-white">
                <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-4">
                    <Link href="/" className="flex items-center gap-2">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-sm font-black text-white">
                            W
                        </span>
                        <span className="text-lg font-black tracking-tight text-gray-950">WALO</span>
                    </Link>
                    {storeSlug && (
                        <Link
                            href={`/${storeSlug}`}
                            className="text-sm font-semibold text-emerald-700 hover:text-emerald-800"
                        >
                            {storeName}
                        </Link>
                    )}
                </div>
            </header>

            {/* Contenido */}
            <main className="flex flex-1 flex-col items-center justify-center p-6">
                <div className="w-full max-w-sm space-y-4">

                    {order.status === 'PAID' && (
                        <div className="rounded-2xl border border-emerald-100 bg-white p-8 text-center shadow-sm">
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
                                <CheckCircle className="h-8 w-8 text-emerald-600" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-950">¡Pago exitoso!</h2>
                            <p className="mt-2 text-sm text-gray-500">Tu pedido fue confirmado. El vendedor se pondrá en contacto contigo pronto.</p>
                        </div>
                    )}

                    {order.status === 'PENDING' && (
                        <div className="rounded-2xl border border-amber-100 bg-white p-8 text-center shadow-sm">
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-50">
                                <Clock className="h-8 w-8 text-amber-500" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-950">Pago en proceso</h2>
                            <p className="mt-2 text-sm text-gray-500">Tu pago está siendo procesado por Khipu. Esto puede tardar unos segundos.</p>
                        </div>
                    )}

                    {order.status === 'FAILED' && (
                        <div className="rounded-2xl border border-red-100 bg-white p-8 text-center shadow-sm">
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
                                <XCircle className="h-8 w-8 text-red-500" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-950">Pago rechazado</h2>
                            <p className="mt-2 text-sm text-gray-500">Ocurrió un problema con el pago. Puedes intentarlo de nuevo.</p>
                            <div className="mt-4">
                                <RetryButton orderId={id} />
                            </div>
                        </div>
                    )}

                    {items.length > 0 && (
                        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                            <div className="mb-3 flex items-center gap-2">
                                <ShoppingBag className="h-4 w-4 text-gray-400" />
                                <h3 className="text-sm font-semibold text-gray-700">Resumen del pedido</h3>
                            </div>
                            <div className="space-y-2">
                                {items.map((item) => (
                                    <div key={item.id} className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600">
                                            {item.quantity}× {item.name}
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

                    {storeSlug && (
                        <Link
                            href={`/${storeSlug}`}
                            className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-200 bg-white py-2.5 text-sm font-semibold text-gray-600 shadow-sm transition hover:bg-gray-50"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Volver a {storeName}
                        </Link>
                    )}
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-gray-200 bg-white py-4 text-center text-xs text-gray-400">
                Powered by <span className="font-bold text-emerald-600">WALO</span>
            </footer>
        </div>
    )
}
