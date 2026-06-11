'use client'

import { useEffect, useState } from 'react'
import {
    CartItem,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getCart,
    getTotal,
    getItemCount,
} from './cartStore'

export function useCart() {
    const [items, setItems] = useState<CartItem[]>([])

    useEffect(() => {
        setItems(getCart())
    }, [])

    return {
        items,
        total: getTotal(items),
        itemCount: getItemCount(items),
        addItem: (product: Omit<CartItem, 'quantity'>) => setItems(addItem(product)),
        removeItem: (id: string) => setItems(removeItem(id)),
        updateQuantity: (id: string, qty: number) => setItems(updateQuantity(id, qty)),
        clearCart: () => { clearCart(); setItems([]) },
    }
}