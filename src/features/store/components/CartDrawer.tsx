'use client'

import { useState } from 'react'
import { CartItem } from './CartContext'
import { createPaymentIntent } from "@/features/store/server/createPayment"
import { trackWhatsappClick } from "@/features/store/server/trackWhatsappClick"

export function buildWhatsAppMessage(
    phone: string | null | undefined,
    storeName: string,
    items: CartItem[],
    total: number,
    notes?: string
): string {
    if (!phone) return '#'
    const cleanPhone = phone.replace(/[^\d+]/g, '')
    const formatter = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' })
    const lines: string[] = []
    lines.push(`Hola, me gustaría hacer un pedido en *${storeName}*: \n`)
    items.forEach((item) => {
        const itemTotal = item.price * item.quantity
        lines.push(`• ${item.quantity}x ${item.name} (${formatter.format(itemTotal)})`)
    })
    lines.push(`\n*Total a pagar: ${formatter.format(total)}*`)
    if (notes && notes.trim() !== '') {
        lines.push(`\n*Instrucciones especiales:*`)
        lines.push(notes.trim())
    }
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(lines.join('\n'))}`
}

interface Props {
    isOpen: boolean
    onClose: () => void
    items: CartItem[]
    total: number
    onUpdateQuantity: (id: string, qty: number) => void
    onRemoveItem: (id: string) => void
    onClearCart: () => void
    storeName?: string
    whatsappPhone?: string | null
    storeId: string
}

export function CartDrawer({
    isOpen, onClose, items, total, onUpdateQuantity, onRemoveItem, onClearCart,
    storeName = 'La Tienda', whatsappPhone, storeId
}: Props) {
    const [orderNotes, setOrderNotes] = useState('')
    const [isLoadingKhipu, setIsLoadingKhipu] = useState(false)
    const [khipuError, setKhipuError] = useState<string | null>(null)

    async function handleKhipuPayment() {
        setIsLoadingKhipu(true)
        setKhipuError(null)
        try {
            const result = await createPaymentIntent({
                storeId,
                storeName,
                items,
                totalAmount: total,
                customerNotes: orderNotes || undefined,
            })
            if (result.success && result.paymentUrl) {
                window.location.href = result.paymentUrl
            } else {
                setKhipuError(result.error ?? 'Error al iniciar el pago')
            }
        } catch {
            setKhipuError('Error inesperado. Intenta nuevamente.')
        } finally {
            setIsLoadingKhipu(false)
        }
    }

    return (
        <>
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm transition-opacity"
                    onClick={onClose}
                />
            )}

            <div className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-sm flex-col bg-white shadow-xl transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="flex items-center justify-between border-b border-gray-100 px-4 py-4">
                    <h2 className="text-lg font-bold text-gray-900">Tu carrito</h2>
                    <button onClick={onClose} className="cursor-pointer rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-4 py-4">
                    {items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center gap-2 py-20 text-center">
                            <p className="text-4xl">🛒</p>
                            <p className="text-gray-500">Tu carrito está vacío</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-4">
                            {items.map((item) => (
                                <div key={item.id} className="flex items-center justify-between border-b border-gray-50 pb-4">
                                    <div className="flex-1">
                                        <h3 className="text-sm font-semibold text-gray-900">{item.name}</h3>
                                        <p className="text-sm font-medium text-green-600">
                                            {(item.price * item.quantity).toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => onUpdateQuantity(item.id, item.quantity - 1)} className="cursor-pointer flex h-7 w-7 items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:border-red-400 hover:text-red-600 transition-colors">
                                            {item.quantity === 1 ? (
                                                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            ) : '−'}
                                        </button>
                                        <span className="w-5 text-center text-sm font-semibold">{item.quantity}</span>
                                        <button onClick={() => onUpdateQuantity(item.id, item.quantity + 1)} className="cursor-pointer flex h-7 w-7 items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:border-green-400 hover:text-green-600 transition-colors">
                                            +
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {items.length > 0 && (
                    <div className="border-t border-gray-100 px-4 py-4 flex flex-col gap-3">
                        <div className="mb-2">
                            <label htmlFor="notes" className="mb-1.5 block text-xs font-semibold text-gray-600">
                                Instrucciones especiales (Opcional)
                            </label>
                            <textarea
                                id="notes"
                                value={orderNotes}
                                onChange={(e) => setOrderNotes(e.target.value)}
                                placeholder="Ej: Por favor sin mayonesa, el timbre está malo..."
                                rows={2}
                                className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-green-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-green-500 transition-colors"
                            />
                        </div>

                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-500">Total</span>
                            <span className="text-lg font-bold text-gray-900">
                                {total.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })}
                            </span>
                        </div>

                        {/* WALO-520: Botón Pagar con Khipu */}
                        <button
                            onClick={handleKhipuPayment}
                            disabled={isLoadingKhipu}
                            className="cursor-pointer w-full rounded-full bg-blue-600 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {isLoadingKhipu ? (
                                <>
                                    <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                    </svg>
                                    Iniciando pago...
                                </>
                            ) : (
                                <>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                    </svg>
                                    Pagar con Khipu
                                </>
                            )}
                        </button>

                        {khipuError && (
                            <p className="text-xs text-red-500 text-center">{khipuError}</p>
                        )}

                        {/* WALO-549: Botón WhatsApp con tracking */}
                        {whatsappPhone ? (
                            <a
                                href={buildWhatsAppMessage(whatsappPhone, storeName, items, total, orderNotes)}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => { trackWhatsappClick(storeId).catch(() => {}) }}
                                className="cursor-pointer w-full rounded-full bg-green-500 py-3 text-sm font-semibold text-white hover:bg-green-600 transition-colors flex items-center justify-center gap-2 shadow-sm"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                                    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.135.561 4.14 1.535 5.876L0 24l6.324-1.507A11.95 11.95 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.006-1.371l-.36-.214-3.731.889.924-3.638-.235-.374A9.818 9.818 0 1112 21.818z" />
                                </svg>
                                Pedir por WhatsApp
                            </a>
                        ) : (
                            <div className="rounded-lg bg-yellow-50 p-3 text-center text-xs font-medium text-yellow-800 border border-yellow-200">
                                Esta tienda no tiene un número configurado para recibir pedidos.
                            </div>
                        )}

                        <button onClick={onClearCart} className="cursor-pointer w-full rounded-full border border-gray-200 bg-white py-2.5 text-xs font-semibold text-gray-500 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-colors flex items-center justify-center gap-1.5">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Vaciar carrito
                        </button>
                    </div>
                )}
            </div>
        </>
    )
}