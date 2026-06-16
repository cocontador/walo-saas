'use client'

import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'

export type CartItem = {
    id: string
    name: string
    price: number
    quantity: number
}

export type NewCartItem = {
    id: string
    name: string
    price: number
}

interface CartContextValue {
    items: CartItem[]
    total: number
    itemCount: number
    addItem: (item: NewCartItem) => void
    updateQuantity: (id: string, quantity: number) => void
    removeItem: (id: string) => void
    clearCart: () => void
}

const CartContext = createContext<CartContextValue | undefined>(undefined)

export function CartProvider({ children, storeId }: { children: ReactNode; storeId: string }) {
    const CART_KEY = `walo-cart-${storeId}`
    const hasHydrated = useRef(false)
    const [items, setItems] = useState<CartItem[]>([])

    useEffect(() => {
        try {
            const stored = localStorage.getItem(CART_KEY)
            setItems(stored ? (JSON.parse(stored) as CartItem[]) : [])
        } catch {
            setItems([])
        } finally {
            hasHydrated.current = true
        }
    }, [CART_KEY])

    useEffect(() => {
        if (!hasHydrated.current) return
        localStorage.setItem(CART_KEY, JSON.stringify(items))
    }, [items, CART_KEY])

    const addItem = (item: NewCartItem) => {
        setItems((currentItems) => {
            const existingItem = currentItems.find((i) => i.id === item.id)
            if (existingItem) {
                return currentItems.map((i) => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i)
            }
            return [...currentItems, { ...item, quantity: 1 }]
        })
    }

    const updateQuantity = (id: string, quantity: number) => {
        setItems((currentItems) => {
            if (quantity <= 0) return currentItems.filter((i) => i.id !== id)
            return currentItems.map((i) => i.id === id ? { ...i, quantity } : i)
        })
    }

    const removeItem = (id: string) => setItems((prev) => prev.filter((i) => i.id !== id))
    const clearCart = () => setItems([])

    const itemCount = useMemo(() => items.reduce((acc, item) => acc + item.quantity, 0), [items])
    const total = useMemo(() => items.reduce((acc, item) => acc + item.price * item.quantity, 0), [items])

    return (
        <CartContext.Provider value={{ items, total, itemCount, addItem, updateQuantity, removeItem, clearCart }}>
            {children}
        </CartContext.Provider>
    )
}

export const useCart = () => {
    const context = useContext(CartContext)
    if (!context) throw new Error('useCart must be used within a CartProvider')
    return context
}