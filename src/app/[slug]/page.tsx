import { notFound } from "next/navigation"
import { getStoreBySlug, getVisibleProducts } from "@/features/store/server/queries"
import { ProductGrid } from "@/features/store/components/ProductGrid"

type Props = {
    params: Promise<{ slug: string }>
}

export default async function StorePage({ params }: Props) {
    const { slug } = await params

    const store = await getStoreBySlug(slug)

    if (!store) {
        notFound()
    }

    const products = await getVisibleProducts(store.id)

    return (
        <main className="min-h-screen bg-gray-50">
            <div className="mx-auto max-w-4xl px-4 py-8">
                {/* Header de la tienda */}
                <div className="mb-8 flex flex-col items-center gap-3 text-center">
                    {store.logoUrl ? (
                        <img
                            src={store.logoUrl}
                            alt={`Logo de ${store.name}`}
                            className="h-20 w-20 rounded-full object-cover"
                        />
                    ) : (
                        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-3xl">
                            🏪
                        </div>
                    )}
                    <h1 className="text-2xl font-bold text-gray-900">{store.name}</h1>
                    {store.description && (
                        <p className="text-gray-500">{store.description}</p>
                    )}
                </div>

                {/* Productos */}
                <ProductGrid products={products} />
            </div>
        </main>
    )
}