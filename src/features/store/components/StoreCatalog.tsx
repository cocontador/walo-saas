'use client'

import { useState } from 'react'
import { ProductCard } from './ProductCard'

type ProductCategory = {
    category: {
        name: string
        visible: boolean
    }
}

type Product = {
    id: string
    name: string
    description: string | null
    price: number
    imageUrl?: string | null
    categories: ProductCategory[]
}

type Props = {
    products: Product[]
}

export function StoreCatalog({ products }: Props) {
    const [selectedCategory, setSelectedCategory] = useState('Todos')

    const visibleCategories = Array.from(
        new Set(
            products.flatMap(p =>
                p.categories
                    .filter(pc => pc.category.visible)
                    .map(pc => pc.category.name)
            )
        )
    )

    const categories = ['Todos', ...visibleCategories]

    const filteredProducts = selectedCategory === 'Todos'
        ? products
        : products.filter(p =>
            p.categories.some(
                pc => pc.category.visible && pc.category.name === selectedCategory
            )
        )

    return (
        <div>
            {visibleCategories.length > 0 && (
                <div className="flex gap-2 overflow-x-auto pb-2 mb-6 no-scrollbar">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            type="button"
                            onClick={() => setSelectedCategory(cat)}
                            className={`cursor-pointer whitespace-nowrap rounded-full border px-4 py-1.5 text-sm font-semibold transition-all ${
                                selectedCategory === cat
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
                        const firstVisibleCategory = product.categories.find(
                            pc => pc.category.visible
                        )

                        return (
                            <ProductCard
                                key={product.id}
                                name={product.name}
                                description={product.description}
                                price={product.price}
                                imageUrl={product.imageUrl}
                                category={firstVisibleCategory?.category.name}
                            />
                        )
                    })}
                </div>
            )}
        </div>
    )
}
