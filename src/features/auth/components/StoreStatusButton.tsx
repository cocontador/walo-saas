'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface StoreStatusButtonProps {
    storeId: string
    isActive: boolean
}

export function StoreStatusButton({ storeId, isActive }: StoreStatusButtonProps) {
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleClick = async () => {
        setLoading(true)
        try {
            await fetch(`/api/store/${storeId}`, {
                method: isActive ? 'DELETE' : 'PUT',
            })
            router.refresh()
        } finally {
            setLoading(false)
        }
    }

    return (
        <button
            onClick={handleClick}
            disabled={loading}
            className={`px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-60 disabled:cursor-not-allowed ${isActive
                    ? 'bg-red-500 hover:bg-red-600'
                    : 'bg-green-500 hover:bg-green-600'
                }`}
        >
            {loading ? 'Procesando...' : isActive ? 'Desactivar tienda' : 'Reactivar tienda'}
        </button>
    )
}