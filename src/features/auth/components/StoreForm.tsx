'use client'

import { useState } from 'react'

interface StoreFormProps {
    storeId: string
    initialName: string
    initialDescription: string | null
    initialSlug: string
    initialWhatsapp: string | null
}

function extractWhatsappDigits(phone: string | null): string {
    if (!phone) return ''
    return phone.replace(/^\+569/, '').replace(/\D/g, '').slice(0, 8)
}

export function StoreForm({ storeId, initialName, initialDescription, initialSlug, initialWhatsapp }: StoreFormProps) {
    const [name, setName] = useState(initialName)
    const [description, setDescription] = useState(initialDescription ?? '')
    const [slug, setSlug] = useState(initialSlug)
    const [whatsappDigits, setWhatsappDigits] = useState(() => extractWhatsappDigits(initialWhatsapp))
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
                body: JSON.stringify({
                    name,
                    description,
                    slug,
                    whatsappPhone: whatsappDigits.length === 8 ? `+569${whatsappDigits}` : null,
                }),
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
                    NÚMERO DE WHATSAPP
                </label>
                <div className="flex items-center rounded-xl bg-gray-100 border border-transparent transition-all focus-within:border-green-500 focus-within:bg-white">
                    <span className="flex items-center gap-1.5 pl-4 pr-2 text-sm font-medium text-gray-500 whitespace-nowrap">
                        <svg className="h-4 w-4 shrink-0 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                            <path d="M12 0C5.373 0 0 5.373 0 12c0 2.135.561 4.14 1.535 5.876L0 24l6.324-1.507A11.95 11.95 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.006-1.371l-.36-.214-3.731.889.924-3.638-.235-.374A9.818 9.818 0 1112 21.818z" />
                        </svg>
                        +56 9
                    </span>
                    <span className="border-l border-gray-300 self-stretch" />
                    <input
                        type="tel"
                        inputMode="numeric"
                        placeholder="1234 5678"
                        value={whatsappDigits.length > 4 ? `${whatsappDigits.slice(0, 4)} ${whatsappDigits.slice(4)}` : whatsappDigits}
                        onChange={(e) => {
                            const digits = e.target.value.replace(/\D/g, '').slice(0, 8)
                            setWhatsappDigits(digits)
                        }}
                        className="min-w-0 flex-1 bg-transparent py-3 pl-3 pr-4 text-gray-900 placeholder-gray-400 focus:outline-none"
                    />
                </div>
                <p className="mt-1.5 text-xs text-gray-400">Tus clientes te enviarán pedidos a este número.</p>
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
