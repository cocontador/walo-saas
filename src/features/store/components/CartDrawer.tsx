'use client'

import { useState } from 'react'
import { CartItem, useCart, ShippingMethod } from './CartContext'
import { createPaymentIntent } from "@/features/store/server/createPayment"
import { trackWhatsappClick } from "@/features/store/server/trackWhatsappClick"

export function buildWhatsAppMessageText(
    storeName: string,
    items: CartItem[],
    total: number,
    shippingMethod: ShippingMethod,
    email: string,
    shippingAddress: string,
    notes?: string,
    shippingCost?: number
): string {
    const formatter = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' })
    const lines: string[] = []

    lines.push(`Hola, me gustaría hacer un pedido en *${storeName}*: \n`)
    lines.push(`*Método de entrega:* ${shippingMethod === 'pickup' ? 'Retiro en tienda' : 'Envío a domicilio'}`)
    if (shippingMethod === 'delivery' && shippingAddress) {
        lines.push(`*Dirección de envío:* ${shippingAddress}`)
    }
    lines.push(`*Email de contacto:* ${email || 'No proporcionado'}`)

    lines.push('')
    items.forEach((item) => {
        const itemTotal = item.price * item.quantity
        lines.push(`• ${item.quantity}x ${item.name} (${formatter.format(itemTotal)})`)
    })

    if (shippingMethod === 'delivery' && shippingCost != null) {
        lines.push(`• Costo de envío: ${shippingCost === 0 ? 'Gratis' : formatter.format(shippingCost)}`)
    }

    lines.push(`\n*Total a pagar: ${formatter.format(total)}*`)

    if (notes && notes.trim() !== '') {
        lines.push(`\n*Instrucciones especiales:*`)
        lines.push(notes.trim())
    }

    return lines.join('\n')
}

export function buildWhatsAppMessage(
    phone: string,
    storeName: string,
    items: CartItem[],
    total: number,
    shippingMethod: ShippingMethod,
    email: string,
    shippingAddress: string,
    notes?: string,
    shippingCost?: number
): string {
    if (!phone) return '#'
    const cleanPhone = phone.replace(/[^\d+]/g, '')
    const text = buildWhatsAppMessageText(storeName, items, total, shippingMethod, email, shippingAddress, notes, shippingCost)
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`
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
    allowPickup?: boolean
    allowDelivery?: boolean
    deliveryPrice?: number
    hasKhipu?: boolean
}

export function CartDrawer({
    isOpen,
    onClose,
    items,
    total: subtotal,
    onUpdateQuantity,
    onRemoveItem,
    onClearCart,
    storeName = 'La Tienda',
    whatsappPhone,
    storeId,
    allowPickup = true,
    allowDelivery = false,
    deliveryPrice = 0,
    hasKhipu = false,
}: Props) {
    const [orderNotes, setOrderNotes] = useState('')
    const [customerEmail, setCustomerEmail] = useState('')
    const [shippingAddress, setShippingAddress] = useState('')
    const [isLoadingKhipu, setIsLoadingKhipu] = useState(false)
    const [khipuError, setKhipuError] = useState<string | null>(null)
    const [whatsappError, setWhatsappError] = useState<string | null>(null)
    const { shippingMethod, setShippingMethod } = useCart()

    const effectiveMethod: ShippingMethod =
        !allowPickup && allowDelivery ? 'delivery'
        : !allowDelivery && allowPickup ? 'pickup'
        : shippingMethod

    const shippingCost = effectiveMethod === 'delivery' ? deliveryPrice : 0
    const finalTotal = subtotal + shippingCost

    const formatter = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' })

    async function handleKhipuPayment() {
        setKhipuError(null)

        if (!customerEmail.trim()) {
            setKhipuError('El correo electrónico es requerido para pagar con Khipu.')
            return
        }
        if (effectiveMethod === 'delivery' && !shippingAddress.trim()) {
            setKhipuError('La dirección de envío es requerida para continuar.')
            return
        }

        setIsLoadingKhipu(true)
        try {
            const noteParts: string[] = []
            if (effectiveMethod === 'delivery' && shippingAddress) {
                noteParts.push(`Dirección: ${shippingAddress}`)
            }
            if (orderNotes.trim()) noteParts.push(`Notas: ${orderNotes.trim()}`)

            const result = await createPaymentIntent({
                storeId,
                storeName,
                items,
                totalAmount: finalTotal,
                shippingMethod: effectiveMethod,
                customerEmail,
                customerNotes: noteParts.join(' | ') || undefined,
            })

            if (result.success && result.paymentUrl) {
                window.location.href = result.paymentUrl
            } else {
                setKhipuError(result.error ?? 'Error al iniciar pago')
            }
        } catch {
            setKhipuError('Error inesperado al conectar con el servidor')
        } finally {
            setIsLoadingKhipu(false)
        }
    }

    const bothAvailable = allowPickup && allowDelivery

    return (
        <div className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-sm flex-col bg-white shadow-xl transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-4">
                <h2 className="text-base font-bold text-gray-900">Tu carrito</h2>
                <button
                    type="button"
                    onClick={onClose}
                    className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                >
                    ✕
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">

                {/* Items */}
                {items.length === 0 ? (
                    <p className="py-10 text-center text-sm text-gray-400">Tu carrito está vacío.</p>
                ) : (
                    <div className="space-y-3">
                        {items.map((item) => (
                            <div key={item.id} className="flex items-center justify-between gap-2 text-sm">
                                <span className="flex-1 text-gray-700">{item.name}</span>
                                <div className="flex items-center gap-1">
                                    <button
                                        type="button"
                                        onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                                        className="flex h-6 w-6 items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50"
                                    >−</button>
                                    <span className="w-5 text-center font-medium">{item.quantity}</span>
                                    <button
                                        type="button"
                                        onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                                        className="flex h-6 w-6 items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50"
                                    >+</button>
                                </div>
                                <span className="w-20 text-right font-semibold text-gray-900">
                                    {formatter.format(item.price * item.quantity)}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => onRemoveItem(item.id)}
                                    className="text-gray-300 hover:text-red-400"
                                >✕</button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Método de entrega */}
                {(allowPickup || allowDelivery) && (
                    <div>
                        <label className="mb-2 block text-xs font-semibold text-gray-600">Método de entrega</label>
                        {bothAvailable ? (
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    type="button"
                                    onClick={() => setShippingMethod('pickup')}
                                    className={`rounded-lg border py-2 text-xs font-medium transition ${effectiveMethod === 'pickup' ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
                                >Retiro</button>
                                <button
                                    type="button"
                                    onClick={() => setShippingMethod('delivery')}
                                    className={`rounded-lg border py-2 text-xs font-medium transition ${effectiveMethod === 'delivery' ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
                                >Envío</button>
                            </div>
                        ) : (
                            <p className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-600">
                                {allowDelivery ? 'Envío a domicilio' : 'Retiro en tienda'}
                            </p>
                        )}
                    </div>
                )}

                {/* Dirección */}
                {effectiveMethod === 'delivery' && (
                    <div>
                        <label className="mb-1 block text-xs font-semibold text-gray-600">Dirección de envío</label>
                        <textarea
                            value={shippingAddress}
                            onChange={(e) => { setShippingAddress(e.target.value); setWhatsappError(null) }}
                            rows={2}
                            placeholder="Ej: Av. Principal 123, Viña del Mar..."
                            className={`w-full rounded-lg border p-2 text-sm text-gray-700 focus:outline-none focus:ring-1 ${whatsappError ? 'border-red-400 focus:border-red-400 focus:ring-red-400' : 'border-gray-200 focus:border-green-500 focus:ring-green-500'}`}
                        />
                        {whatsappError && (
                            <p className="mt-1 text-xs text-red-600">{whatsappError}</p>
                        )}
                    </div>
                )}

                {/* Email */}
                <div>
                    <label className="mb-1 block text-xs font-semibold text-gray-600">
                        Correo electrónico {hasKhipu && <span className="text-red-500">*</span>}
                    </label>
                    <input
                        type="email"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        placeholder="tu@email.com"
                        className="w-full rounded-lg border border-gray-200 p-2 text-sm text-gray-700 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                    />
                    {hasKhipu && (
                        <p className="mt-1 text-xs text-gray-400">Requerido para procesar el pago en línea</p>
                    )}
                </div>

                {/* Notas */}
                <div>
                    <label className="mb-1 block text-xs font-semibold text-gray-600">Notas del pedido (opcional)</label>
                    <textarea
                        value={orderNotes}
                        onChange={(e) => setOrderNotes(e.target.value)}
                        rows={2}
                        placeholder="Instrucciones especiales..."
                        className="w-full rounded-lg border border-gray-200 p-2 text-sm text-gray-700 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                    />
                </div>

                {/* Resumen */}
                <div className="space-y-1 border-t border-gray-100 pt-3">
                    <div className="flex justify-between text-sm text-gray-600">
                        <span>Subtotal</span>
                        <span>{formatter.format(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                        <span>Costo de envío</span>
                        <span>
                            {effectiveMethod === 'delivery'
                                ? shippingCost === 0 ? 'Gratis' : formatter.format(shippingCost)
                                : '—'}
                        </span>
                    </div>
                    <div className="flex justify-between border-t border-gray-100 pt-2 font-bold text-gray-900">
                        <span>Total a pagar</span>
                        <span>{formatter.format(finalTotal)}</span>
                    </div>
                </div>

                {/* Error */}
                {khipuError && (
                    <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                        {khipuError}
                    </p>
                )}

                {/* Botones */}
                <div className="space-y-3 pt-1">
                    {hasKhipu && (
                        <button
                            type="button"
                            onClick={handleKhipuPayment}
                            disabled={items.length === 0 || isLoadingKhipu}
                            className="w-full rounded-full bg-blue-600 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {isLoadingKhipu ? 'Procesando...' : 'Pagar con Khipu'}
                        </button>
                    )}

                    {whatsappPhone && (
                        <button
                            type="button"
                            disabled={items.length === 0}
                            onClick={() => {
                                setWhatsappError(null)
                                if (effectiveMethod === 'delivery' && !shippingAddress.trim()) {
                                    setWhatsappError('Ingresa tu dirección de envío para continuar.')
                                    return
                                }
                                trackWhatsappClick(storeId)
                                window.open(
                                    buildWhatsAppMessage(whatsappPhone, storeName, items, finalTotal, effectiveMethod, customerEmail, shippingAddress, orderNotes, shippingCost),
                                    '_blank'
                                )
                            }}
                            className="flex w-full items-center justify-center rounded-full bg-green-500 py-3 text-sm font-semibold text-white transition hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            Pedir por WhatsApp
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}