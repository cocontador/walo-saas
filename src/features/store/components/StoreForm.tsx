'use client'

import { useState } from 'react'

interface StoreFormProps {
    storeId: string
    initialName: string
    initialDescription: string | null
}

export function StoreForm({ storeId, initialName, initialDescription }: StoreFormProps) {
    const [name, setName] = useState(initialName)
    const [description, setDescription] = useState(initialDescription ?? '')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setSuccess(false)
        setLoading(true)

        try {
            const res = await fetch(`/api/store/${storeId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, description }),
            })

            const data = await res.json()

            if (!res.ok) {
                setError(data.error ?? 'Error al guardar.')
            } else {
                setSuccess(true)
            }
        } catch {
            setError('Ocurrió un error inesperado.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-xs font-semibold text-gray-500 tracking-widest mb-1">
                    NOMBRE DE LA TIENDA
                </label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full rounded-xl bg-gray-100 border border-transparent px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-green-500 focus:bg-white transition-all"
                />
            </div>

            <div>
                <label className="block text-xs font-semibold text-gray-500 tracking-widest mb-1">
                    DESCRIPCIÓN
                </label>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    placeholder="Describe tu tienda..."
                    className="w-full rounded-xl bg-gray-100 border border-transparent px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-green-500 focus:bg-white transition-all resize-none"
                />
            </div>

            {error && (
                <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700 border border-red-200">
                    {error}
                </div>
            )}

            {success && (
                <div className="rounded-lg bg-green-50 p-3 text-sm text-green-700 border border-green-200">
                    ¡Datos guardados correctamente!
                </div>
            )}

            <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl font-semibold text-white bg-green-500 hover:bg-green-600 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
                {loading ? 'Guardando...' : 'Guardar cambios'}
            </button>
        </form>
    )
}