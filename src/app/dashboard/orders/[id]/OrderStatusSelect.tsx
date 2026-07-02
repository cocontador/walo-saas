'use client'

import { useState, useTransition } from 'react'
import { updateOrderStatus } from '@/features/dashboard/actions/updateOrderStatus'

const STATUS_OPTIONS = [
    { value: 'PENDING', label: 'Pendiente' },
    { value: 'PAID', label: 'Pagado' },
    { value: 'FAILED', label: 'Fallido' },
    { value: 'CANCELED', label: 'Cancelado' },
] as const

type Status = typeof STATUS_OPTIONS[number]['value']

export function OrderStatusSelect({ orderId, currentStatus }: { orderId: string; currentStatus: string }) {
    const [status, setStatus] = useState<Status>(currentStatus as Status)
    const [error, setError] = useState<string | null>(null)
    const [isPending, startTransition] = useTransition()

    const handleChange = (newStatus: Status) => {
        setError(null)
        startTransition(async () => {
            const result = await updateOrderStatus(orderId, newStatus)
            if (result.success) {
                setStatus(newStatus)
            } else {
                setError(result.error ?? 'Error al actualizar')
            }
        })
    }

    return (
        <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Estado del pedido
            </label>
            <select
                value={status}
                onChange={e => handleChange(e.target.value as Status)}
                disabled={isPending}
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none disabled:opacity-60"
            >
                {STATUS_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>
            {isPending && <p className="text-xs text-gray-400">Guardando...</p>}
            {error && <p className="text-xs text-red-600">{error}</p>}
        </div>
    )
}
