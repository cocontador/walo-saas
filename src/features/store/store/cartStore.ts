export interface CartItem {
    id: string
    name: string
    price: number
    quantity: number
}

const CART_KEY = 'walo-cart'

export function getCart(): CartItem[] {
    if (typeof window === 'undefined') return []
    try {
        return JSON.parse(localStorage.getItem(CART_KEY) ?? '[]')
    } catch {
        return []
    }
}

export function saveCart(items: CartItem[]): void {
    localStorage.setItem(CART_KEY, JSON.stringify(items))
}

export function addItem(product: Omit<CartItem, 'quantity'>): CartItem[] {
    const items = getCart()
    const existing = items.find((i) => i.id === product.id)
    const updated = existing
        ? items.map((i) => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i)
        : [...items, { ...product, quantity: 1 }]
    saveCart(updated)
    return updated
}

export function removeItem(id: string): CartItem[] {
    const updated = getCart().filter((i) => i.id !== id)
    saveCart(updated)
    return updated
}

export function updateQuantity(id: string, quantity: number): CartItem[] {
    if (quantity <= 0) return removeItem(id)
    const updated = getCart().map((i) => i.id === id ? { ...i, quantity } : i)
    saveCart(updated)
    return updated
}

export function clearCart(): void {
    localStorage.removeItem(CART_KEY)
}

export function getTotal(items: CartItem[]): number {
    return items.reduce((s, i) => s + i.price * i.quantity, 0)
}

export function getItemCount(items: CartItem[]): number {
    return items.reduce((s, i) => s + i.quantity, 0)
}