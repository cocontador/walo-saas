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

export function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([])
    const [isInitialized, setIsInitialized] = useState(false)

    // Cargar datos de localStorage al montar
    useEffect(() => {
        const storedCart = localStorage.getItem('walo-cart')
        if (storedCart) {
            try {
                setItems(JSON.parse(storedCart))
            } catch (error) {
                console.error('Error parseando el carrito:', error)
            }
        }
        setIsInitialized(true)
    }, [])

    // Guardar en localStorage si hay cambios
    useEffect(() => {
        if (isInitialized) {
            localStorage.setItem('walo-cart', JSON.stringify(items))
        }
    }, [items, isInitialized])

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

    // Lógica para cambiar cantidad (Ticket WALO-485)
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

    //if (!isInitialized) return null // Evita parpadeos o errores de hidratación en SSR

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