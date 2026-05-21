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

const CATEGORIES = ["Todos", "Accesorios", "Electrónica", "Calzado", "Hogar"]

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
        <div>
            {/* Filtros */}
            <div className="flex gap-2 flex-wrap mb-6">
                {CATEGORIES.map((cat) => (
                    <button
                        key={cat}
                        className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${cat === "Todos"
                                ? "bg-green-500 text-white"
                                : "bg-white border border-gray-200 text-gray-600 hover:border-green-500 hover:text-green-600"
                            }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Grid */}
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
        </div>
    )
}