'use client'

import { useState } from 'react'

interface StoreFormProps {
    storeId: string
    initialName: string
    initialDescription: string | null
    initialSlug: string
    initialWhatsapp: string | null
}

export function StoreForm({ storeId, initialName, initialDescription, initialSlug, initialWhatsapp }: StoreFormProps) {
    const [name, setName] = useState(initialName)
    const [description, setDescription] = useState(initialDescription ?? '')
    const [slug, setSlug] = useState(initialSlug)
    const [whatsapp, setWhatsapp] = useState(initialWhatsapp ?? '')
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
                body: JSON.stringify({ name, description, slug, whatsappPhone: whatsapp }),
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
                    SLUG (link de tu tienda)
                </label>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-400 font-mono">walo.app/</span>
                    <input
                        type="text"
                        value={slug}
                        onChange={(e) => setSlug(e.target.value)}
                        required
                        className="flex-1 rounded-xl bg-gray-100 border border-transparent px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-green-500 focus:bg-white transition-all font-mono"
                    />
                </div>
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

            <div>
                <label className="block text-xs font-semibold text-gray-500 tracking-widest mb-1">
                    WHATSAPP
                </label>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-400">+56</span>
                    <input
                        type="tel"
                        value={whatsapp}
                        onChange={(e) => setWhatsapp(e.target.value.replace(/\D/g, ''))}
                        placeholder="912345678"
                        maxLength={9}
                        className="flex-1 rounded-xl bg-gray-100 border border-transparent px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-green-500 focus:bg-white transition-all"
                    />
                </div>
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