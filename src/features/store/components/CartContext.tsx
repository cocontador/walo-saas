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

export const CartProvider = ({
    storeId,
    children,
}: {
    storeId: string
    children: ReactNode
}) => {
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
        if (!hasHydrated.current) {
            return
        }

        localStorage.setItem(CART_KEY, JSON.stringify(items))
    }, [items, CART_KEY])

    const addItem = (item: NewCartItem) => {
        setItems((currentItems) => {
            const existingItem = currentItems.find((cartItem) => cartItem.id === item.id)

            if (existingItem) {
                return currentItems.map((cartItem) =>
                    cartItem.id === item.id
                        ? { ...cartItem, quantity: cartItem.quantity + 1 }
                        : cartItem
                )
            }

            return [...currentItems, { ...item, quantity: 1 }]
        })
    }

    const updateQuantity = (id: string, quantity: number) => {
        setItems((currentItems) => {
            if (quantity <= 0) {
                return currentItems.filter((cartItem) => cartItem.id !== id)
            }

            return currentItems.map((cartItem) =>
                cartItem.id === id ? { ...cartItem, quantity } : cartItem
            )
        })
    }

    const removeItem = (id: string) => {
        setItems((currentItems) => currentItems.filter((cartItem) => cartItem.id !== id))
    }

    const clearCart = () => {
        setItems([])
    }

    const itemCount = useMemo(
        () => items.reduce((count, cartItem) => count + cartItem.quantity, 0),
        [items]
    )

    const total = useMemo(
        () => items.reduce((sum, cartItem) => sum + cartItem.price * cartItem.quantity, 0),
        [items]
    )

    return (
        <CartContext.Provider
            value={{ items, total, itemCount, addItem, updateQuantity, removeItem, clearCart }}
        >
            {children}
        </CartContext.Provider>
    )
}

export const useCart = () => {
    const context = useContext(CartContext)

    if (!context) {
        throw new Error('useCart must be used within a CartProvider')
    }

    return context
}
