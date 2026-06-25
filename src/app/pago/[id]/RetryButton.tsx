'use client'

import { useState } from 'react'
import { retryPayment } from '@/features/store/server/retryPayment'

export default function RetryButton({ orderId }: { orderId: string }) {
    const [isRetrying, setIsRetrying] = useState(false)

    async function handleRetry() {
        setIsRetrying(true)
        try {
            const result = await retryPayment(orderId)
            if (result.success && 'paymentUrl' in result && result.paymentUrl) {
                window.location.href = result.paymentUrl as string
            } else {
                alert(('error' in result ? result.error : null) || "No pudimos reintentar el pago.")
                setIsRetrying(false)
            }
        } catch {
            alert("Error al contactar con el servidor.")
            setIsRetrying(false)
        }
    }

    return (
        <button
            onClick={handleRetry}
            disabled={isRetrying}
            className="mt-6 w-full cursor-pointer rounded-full bg-blue-600 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {isRetrying ? 'Redirigiendo...' : 'Reintentar Pago'}
        </button>
    )
}