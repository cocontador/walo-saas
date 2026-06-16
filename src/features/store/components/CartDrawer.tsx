'use client'

import { useState } from 'react'
import { CartItem } from './CartContext'
import { createPaymentIntent } from "@/features/store/server/createPayment"
import { trackWhatsappClick } from "@/features/store/server/trackWhatsappClick"

export function buildWhatsAppMessageText(storeName: string, items: CartItem[], total: number, notes?: string): string {
    const formatter = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' })
    const lines = [`Hola, me gustaría hacer un pedido en *${storeName}*: \n`]
    items.forEach(i => lines.push(`• ${i.quantity}x ${i.name} (${formatter.format(i.price * i.quantity)})`))
    lines.push(`\n*Total a pagar: ${formatter.format(total)}*`)
    if (notes?.trim()) lines.push(`\n*Instrucciones especiales:*\n${notes.trim()}`)
    return lines.join('\n')
}

export function buildWhatsAppMessage(phone: string, storeName: string, items: CartItem[], total: number, notes?: string): string {
    return `https://wa.me/${phone.replace(/[^\d+]/g, '')}?text=${encodeURIComponent(buildWhatsAppMessageText(storeName, items, total, notes))}`
}

export function CartDrawer({ isOpen, onClose, items, total, onUpdateQuantity, onRemoveItem, onClearCart, storeName = 'La Tienda', whatsappPhone, storeId }: any) {
    const [orderNotes, setOrderNotes] = useState('')
    const [isLoadingKhipu, setIsLoadingKhipu] = useState(false)
    const [khipuError, setKhipuError] = useState<string | null>(null)

    async function handleKhipuPayment() {
        setIsLoadingKhipu(true)
        setKhipuError(null)
        try {
            const result = await createPaymentIntent({ storeId, storeName, items, totalAmount: total, customerNotes: orderNotes })
            if (result.success && result.paymentUrl) window.location.href = result.paymentUrl
            else setKhipuError(result.error ?? 'Error al iniciar pago')
        } catch { setKhipuError('Error inesperado') } finally { setIsLoadingKhipu(false) }
    }

    return (
        <div className={`fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-white shadow-xl transition-transform ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
            <div className="p-4 border-b flex justify-between items-center">
                <h2 className="text-lg font-bold">Tu carrito</h2>
                <button onClick={onClose}>✕</button>
            </div>

            <div className="p-4 flex-1 overflow-y-auto">
                {items.map((item: CartItem) => (
                    <div key={item.id} className="flex justify-between py-2 border-b">
                        <span>{item.name} x{item.quantity}</span>
                        <span>{(item.price * item.quantity).toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })}</span>
                    </div>
                ))}
            </div>

            <div className="p-4 border-t">
                <textarea className="w-full border p-2 mb-2" placeholder="Instrucciones..." value={orderNotes} onChange={e => setOrderNotes(e.target.value)} />
                <div className="flex justify-between font-bold mb-4"><span>Total</span><span>{total.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })}</span></div>

                <div className="flex flex-col gap-2">
                    <button onClick={handleKhipuPayment} disabled={isLoadingKhipu} className="w-full bg-blue-600 text-white py-2 rounded-full">
                        {isLoadingKhipu ? 'Procesando...' : 'Pagar con Khipu'}
                    </button>
                    {whatsappPhone && (
                        <a href={buildWhatsAppMessage(whatsappPhone, storeName, items, total, orderNotes)} target="_blank" onClick={() => trackWhatsappClick(storeId)} className="w-full bg-green-500 text-white py-2 rounded-full text-center">
                            Pedir por WhatsApp
                        </a>
                    )}
                </div>
                {khipuError && <p className="text-red-500 text-xs mt-2 text-center">{khipuError}</p>}
                <button onClick={onClearCart} className="w-full text-gray-400 text-xs mt-4">Vaciar carrito</button>
            </div>
        </div>
    )
}