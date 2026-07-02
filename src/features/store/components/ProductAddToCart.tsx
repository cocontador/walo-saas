'use client'

import { useState } from 'react'
import { useCart } from '@/features/store/components/CartContext'
import { CartDrawer } from '@/features/store/components/CartDrawer'

type Props = {
    product: {
        id: string
        name: string
        price: number
    }
    storeName: string
    storeId: string
    whatsappPhone?: string | null
    allowPickup?: boolean
    allowDelivery?: boolean
    deliveryCost?: number
    hasKhipu?: boolean
}

export function ProductAddToCart({
    product,
    storeName,
    storeId,
    whatsappPhone,
    allowPickup = true,
    allowDelivery = false,
    deliveryCost = 0,
    hasKhipu = false,
}: Props) {
    const { addItem, itemCount, items, total, updateQuantity, removeItem, clearCart } = useCart()
    const [cartOpen, setCartOpen] = useState(false)
    const [added, setAdded] = useState(false)

    function handleAdd() {
        addItem({ id: product.id, name: product.name, price: product.price })
        setAdded(true)
        setTimeout(() => setAdded(false), 1500)
    }

    return (
        <>
            <button
                type="button"
                onClick={handleAdd}
                className="w-full rounded-full bg-green-600 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
                {added ? '✓ Agregado al carrito' : 'Agregar al carrito'}
            </button>

            {itemCount > 0 && (
                <button
                    type="button"
                    onClick={() => setCartOpen(true)}
                    className="fixed bottom-6 right-6 z-50 inline-flex items-center gap-2 rounded-full bg-green-600 px-4 py-3 text-white shadow-lg transition hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                    <span>{itemCount}</span>
                    <span>Ver carrito</span>
                </button>
            )}

            <CartDrawer
                isOpen={cartOpen}
                onClose={() => setCartOpen(false)}
                items={items}
                total={total}
                onUpdateQuantity={updateQuantity}
                onRemoveItem={removeItem}
                onClearCart={clearCart}
                storeName={storeName}
                whatsappPhone={whatsappPhone}
                storeId={storeId}
                allowPickup={allowPickup}
                allowDelivery={allowDelivery}
                deliveryPrice={deliveryCost}
                hasKhipu={hasKhipu}
            />
        </>
    )
}
