'use client'

import { useState } from 'react'
import { retryPayment } from '@/features/store/server/retryPayment'
import { useParams } from 'next/navigation' // Para obtener el ID del pago desde la URL

export default function PagoStatusPage({ status }: { status: string }) {
    const params = useParams()
    const orderId = params.id as string // Obtenemos el ID de la URL
    const [isRetrying, setIsRetrying] = useState(false)

    async function handleRetry() {
        setIsRetrying(true)
        try {
            const result = await retryPayment(orderId)
            
            if (result.success && result.paymentUrl) {
                // Redirigir a Khipu para el nuevo intento
                window.location.href = result.paymentUrl
            } else {
                alert(result.error || "No pudimos reintentar el pago.")
                setIsRetrying(false)
            }
        } catch (error) {
            console.error("Error en reintento:", error)
            alert("Error al contactar con el servidor.")
            setIsRetrying(false)
        }
    }

    return (
        <div className="flex min-h-screen flex-col items-center justify-center p-6">
            {status === 'FAILED' && (
                <div className="w-full max-w-sm rounded-2xl border border-red-100 bg-white p-8 text-center shadow-sm">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-600 mb-4">
                        <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                    
                    <h2 className="text-xl font-bold text-red-600">Pago Rechazado</h2>
                    <p className="mt-2 text-gray-600">Ocurrió un problema con el pago. Puedes intentarlo de nuevo.</p>

                    <button
                        onClick={handleRetry}
                        disabled={isRetrying}
                        className="mt-6 w-full cursor-pointer rounded-full bg-blue-600 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isRetrying ? 'Redirigiendo...' : 'Reintentar Pago'}
                    </button>
                </div>
            )}
            
            {/* Aquí irían tus otros estados: SUCCESS, PENDING, etc. */}
        </div>
    )
}