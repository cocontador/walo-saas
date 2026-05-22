import { ProductCard } from "./ProductCard"

type Product = {
    id: string
    name: string
    description: string | null
    price: number
}

type Props = {
    products: Product[]
}

export function ProductGrid({ products }: Props) {
    if (products.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center gap-2 py-20 text-center">
                <p className="text-4xl">🛍️</p>
                <p className="text-gray-500">Esta tienda aún no tiene productos.</p>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {products.map((product) => (
                <ProductCard
                    key={product.id}
                    name={product.name}
                    description={product.description}
                    price={product.price}
                />
            ))}
        </div>
    )
}
