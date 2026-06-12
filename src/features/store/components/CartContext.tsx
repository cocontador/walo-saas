'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export type CartItem = {
    id: string
    name: string
    price: number
    quantity: number
}

type CartContextType = {
    items: CartItem[]
    total: number
    itemCount: number
    addItem: (item: Omit<CartItem, 'quantity'>) => void
    removeItem: (id: string) => void
    updateQuantity: (id: string, quantity: number) => void
    clearCart: () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children, storeId }: { children: ReactNode; storeId: string }) {
    // 1. Clave única por tienda para evitar contaminación de datos
    const CART_KEY = `walo-cart-${storeId}`

    const [items, setItems] = useState<CartItem[]>([])
    const [isInitialized, setIsInitialized] = useState(false)

    // 2. Cargar datos de localStorage usando la clave dinámica
    useEffect(() => {
        const storedCart = localStorage.getItem(CART_KEY)
        if (storedCart) {
            try {
                setItems(JSON.parse(storedCart))
            } catch (error) {
                console.error('Error parseando el carrito:', error)
            }
        }
        setIsInitialized(true)
    }, [CART_KEY]) // Dependencia: si cambia el storeId, se recarga el carrito

    // 3. Guardar en localStorage sincronizado con la clave de la tienda
    useEffect(() => {
        if (localStorage.getItem('walo-cart')) {
            localStorage.removeItem('walo-cart');
        }
    }, [items, isInitialized, CART_KEY])

    // Totales calculados al vuelo
    const total = items.reduce((acc, item) => acc + (item.price * item.quantity), 0)
    const itemCount = items.reduce((acc, item) => acc + item.quantity, 0)

    const addItem = (newItem: Omit<CartItem, 'quantity'>) => {
        setItems(prev => {
            const existing = prev.find(item => item.id === newItem.id)
            if (existing) {
                return prev.map(item =>
                    item.id === newItem.id ? { ...item, quantity: item.quantity + 1 } : item
                )
            }
            return [...prev, { ...newItem, quantity: 1 }]
        })
    }

    const removeItem = (id: string) => setItems(prev => prev.filter(item => item.id !== id))

    const updateQuantity = (id: string, quantity: number) => {
        if (quantity <= 0) {
            removeItem(id)
            return
        }
        setItems(prev => prev.map(item =>
            item.id === id ? { ...item, quantity } : item
        ))
    }

    const clearCart = () => setItems([])

    return (
        <CartContext.Provider value={{ items, total, itemCount, addItem, removeItem, updateQuantity, clearCart }}>
            {children}
        </CartContext.Provider>
    )
}

export function useCart() {
    const context = useContext(CartContext)
    if (context === undefined) {
        throw new Error('useCart debe usarse dentro de un CartProvider')
    }
    return context
}