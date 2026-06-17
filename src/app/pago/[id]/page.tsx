import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import RetryButton from './RetryButton'

type Props = {
    params: Promise<{ id: string }>
}

export default async function PagoStatusPage({ params }: Props) {
    const { id } = await params

    const order = await prisma.order.findUnique({ where: { id } })

    if (!order) notFound()

    return (
        <div className="flex min-h-screen flex-col items-center justify-center p-6">
            {order.status === 'PAID' && (
                <div className="w-full max-w-sm rounded-2xl border border-green-100 bg-white p-8 text-center shadow-sm">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-50 text-green-600 mb-4">
                        <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold text-green-600">¡Pago Exitoso!</h2>
                    <p className="mt-2 text-gray-600">Tu pedido ha sido confirmado. ¡Gracias por tu compra!</p>
                </div>
            )}

            {order.status === 'PENDING' && (
                <div className="w-full max-w-sm rounded-2xl border border-yellow-100 bg-white p-8 text-center shadow-sm">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-yellow-50 text-yellow-600 mb-4">
                        <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold text-yellow-600">Pago en Proceso</h2>
                    <p className="mt-2 text-gray-600">Tu pago está siendo procesado. Te notificaremos cuando se confirme.</p>
                </div>
            )}

            {order.status === 'FAILED' && (
                <div className="w-full max-w-sm rounded-2xl border border-red-100 bg-white p-8 text-center shadow-sm">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-600 mb-4">
                        <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold text-red-600">Pago Rechazado</h2>
                    <p className="mt-2 text-gray-600">Ocurrió un problema con el pago. Puedes intentarlo de nuevo.</p>
                    <RetryButton orderId={id} />
                </div>
            )}
        </div>
    )
}