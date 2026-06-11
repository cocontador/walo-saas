'use client'

import { useState } from 'react'
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
            <span>{itemCount}</span>
            <span>Ver carrito</span>
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
    description: string | null
    price: number
    imageUrl?: string | null
    categories?: ProductCategory[] | null
}

type Props = {
    products: Product[]
    storeName?: string              // <-- Agregado para el flujo de WhatsApp
    whatsappPhone?: string | null   // <-- Agregado para el flujo de WhatsApp
}

export function StoreCatalog({ products, storeName = 'La Tienda', whatsappPhone }: Props) {
    const [selectedCategory, setSelectedCategory] = useState('Todos')
    const [cartOpen, setCartOpen] = useState(false)

    // Extraemos addItem para la mutación instantánea del estado
    const { items, total, itemCount, addItem, updateQuantity, removeItem, clearCart } = useCart()

    const visibleCategories = Array.from(
        new Set(
            (products || []).reduce<string[]>((acc, p) => {
                const cats = p.categories || [];
                cats.forEach(pc => {
                    if (pc?.category?.visible && pc?.category?.name) {
                        acc.push(pc.category.name);
                    }
                });
                return acc;
            }, [])
        )
    )

    const categories = ['Todos', ...visibleCategories]

    const filteredProducts = selectedCategory === 'Todos'
        ? products
        : (products || []).filter(p =>
            (p.categories || []).some(
                pc => pc?.category?.visible && pc?.category?.name === selectedCategory
            )
        )

    return (
        <div>
            {/* Filtro de Categorías */}
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

            {/* Listado de Productos */}
            {filteredProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 py-20 text-center">
                    <p className="text-4xl">🔍</p>
                    <p className="text-gray-500">No hay productos en esta categoría.</p>
                    <button
                        type="button"
                        onClick={() => setSelectedCategory('Todos')}
                        className="cursor-pointer mt-2 text-sm font-semibold text-green-600 hover:underline"
                    >
                        Ver todos los productos
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                    {filteredProducts.map(product => {
                        const firstVisibleCategory = (product.categories || []).find(
                            pc => pc?.category?.visible
                        )
                        return (
                            <ProductCard
                                key={product.id}
                                id={product.id}
                                name={product.name}
                                description={product.description}
                                price={product.price}
                                imageUrl={product.imageUrl}
                                category={firstVisibleCategory?.category?.name}
                                storeName={storeName}          // <-- Transferido a la tarjeta
                                whatsappPhone={whatsappPhone}  // <-- Transferido a la tarjeta
                                onAddToCart={() => addItem({   // <-- Callback reactivo inmediato
                                    id: product.id,
                                    name: product.name,
                                    price: product.price
                                })}
                            />
                        )
                    })}
                </div>
            )}

            {/* Componentes del Carrito */}
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
            />
        </div>
    )
}