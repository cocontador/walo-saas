'use client'

import { useState } from 'react'
import { ShoppingCart } from 'lucide-react'
import { ProductCard } from './ProductCard'
import { CartDrawer } from './CartDrawer'
import { useCart } from "@/features/store/components/CartContext"

type CartFloatingButtonProps = {
    itemCount: number
    onClick: () => void
}

function CartFloatingButton({ itemCount, onClick }: CartFloatingButtonProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="fixed bottom-6 right-6 z-50 inline-flex items-center gap-2 rounded-full bg-green-600 px-4 py-3 text-white shadow-lg transition hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
        >
            <ShoppingCart className="h-5 w-5" />
            <span>{itemCount}</span>
        </button>
    )
}

type ProductCategory = {
    category?: {
        name: string
        visible: boolean
    } | null
}

type Product = {
    id: string
    name: string
    slug?: string | null
    description: string | null
    price: number
    imageUrl?: string | null
    categories?: ProductCategory[] | null
}

type Props = {
    products: Product[]
    storeName?: string
    storeSlug: string
    whatsappPhone?: string | null
    storeId: string
    allowPickup?: boolean
    allowDelivery?: boolean
    deliveryCost?: number
    hasKhipu?: boolean
}

export function StoreCatalog({
    products,
    storeName = 'La Tienda',
    storeSlug,
    whatsappPhone,
    storeId,
    allowPickup = true,
    allowDelivery = false,
    deliveryCost = 0,
    hasKhipu = false,
}: Props) {
    const [selectedCategory, setSelectedCategory] = useState('Todos')
    const [searchQuery, setSearchQuery] = useState('')
    const [cartOpen, setCartOpen] = useState(false)

    const { items, total, itemCount, addItem, updateQuantity, removeItem, clearCart } = useCart()

    const visibleCategories = Array.from(
        new Set(
            (products || []).reduce<string[]>((acc, p) => {
                const cats = p.categories || []
                cats.forEach(pc => {
                    if (pc?.category?.visible && pc?.category?.name) {
                        acc.push(pc.category.name)
                    }
                })
                return acc
            }, [])
        )
    )

    const categories = ['Todos', ...visibleCategories]

    const normalizedQuery = searchQuery.trim().toLowerCase()

    const filteredProducts = (products || []).filter(p => {
        const matchesCategory = selectedCategory === 'Todos' ||
            (p.categories || []).some(
                pc => pc?.category?.visible && pc?.category?.name === selectedCategory
            )
        const matchesSearch = !normalizedQuery ||
            p.name.toLowerCase().includes(normalizedQuery) ||
            (p.description?.toLowerCase().includes(normalizedQuery) ?? false)

        return matchesCategory && matchesSearch
    })

    const hasActiveFilters = normalizedQuery || selectedCategory !== 'Todos'

    return (
        <div>
            {/* Buscador */}
            <div className="relative mb-4">
                <svg
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                    type="search"
                    role="searchbox"
                    aria-label="Buscar productos"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Buscar productos..."
                    className="w-full rounded-full border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-700 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                />
                {searchQuery && (
                    <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        aria-label="Limpiar búsqueda"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                        ✕
                    </button>
                )}
            </div>

            {visibleCategories.length > 0 && (
                <div className="flex gap-2 overflow-x-auto pb-2 mb-6 no-scrollbar">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            type="button"
                            onClick={() => setSelectedCategory(cat)}
                            className={`cursor-pointer whitespace-nowrap rounded-full border px-4 py-1.5 text-sm font-semibold transition-all ${selectedCategory === cat
                                ? 'border-green-500 bg-green-500 text-white shadow-sm'
                                : 'border-gray-200 bg-white text-gray-600 hover:border-green-400 hover:text-green-600'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            )}

            {filteredProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 py-20 text-center">
                    <p className="text-4xl">🔍</p>
                    <p className="text-gray-500">
                        {normalizedQuery
                            ? `No se encontraron productos para "${searchQuery}".`
                            : 'No hay productos en esta categoría.'}
                    </p>
                    {hasActiveFilters && (
                        <button
                            type="button"
                            onClick={() => { setSelectedCategory('Todos'); setSearchQuery('') }}
                            className="cursor-pointer mt-2 text-sm font-semibold text-green-600 hover:underline"
                        >
                            Ver todos los productos
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                    {filteredProducts.map((product, index) => {
                        const firstVisibleCategory = (product.categories || []).find(
                            pc => pc?.category?.visible
                        )
                        return (
                            <ProductCard
                                key={product.id}
                                id={product.id}
                                name={product.name}
                                slug={product.slug}
                                storeSlug={storeSlug}
                                description={product.description}
                                price={product.price}
                                imageUrl={product.imageUrl}
                                category={firstVisibleCategory?.category?.name}
                                priority={index === 0}
                                onAddToCart={() => addItem({
                                    id: product.id,
                                    name: product.name,
                                    price: product.price
                                })}
                            />
                        )
                    })}
                </div>
            )}

            <CartFloatingButton
                itemCount={itemCount}
                onClick={() => setCartOpen(true)}
            />

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
        </div>
    )
}
