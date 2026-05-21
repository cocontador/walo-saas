import { notFound } from "next/navigation"
import { getStoreBySlug, getVisibleProducts } from "@/features/store/server/queries"
import { ProductGrid } from "@/features/store/components/ProductGrid"
import Link from "next/link"

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
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
                <div className="mx-auto max-w-5xl px-4 h-14 flex items-center justify-between">
                    <span className="font-bold text-lg tracking-tight">WALO</span>
                    <nav className="hidden sm:flex items-center gap-4 text-sm font-medium text-gray-500">
                        <Link href="/dashboard" className="hover:text-gray-900 transition-colors">
                            Dashboard
                        </Link>
                        <span className="text-green-600 border-b-2 border-green-500 pb-0.5">Tienda</span>
                    </nav>
                    <button className="flex items-center gap-1.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-full px-3 py-1.5 hover:bg-gray-50 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                        </svg>
                        Compartir
                    </button>
                </div>
            </header>

            <main className="mx-auto max-w-5xl px-4 py-8">
                {/* Breadcrumb */}
                <p className="text-xs text-gray-400 mb-4 uppercase tracking-wide">
                    Tiendas &rsaquo; <span className="text-green-600 font-semibold">Catálogo actual</span>
                </p>

                {/* Botón volver */}
                <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-6"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Volver a mi tienda
                </Link>
                {/* Info tienda */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">{store.name}</h1>
                        {store.description && (
                            <p className="text-gray-500 max-w-md">{store.description}</p>
                        )}
                    </div>
                    <input
                        type="text"
                        placeholder="Buscar productos..."
                        className="border border-gray-200 rounded-full px-4 py-2 text-sm w-full sm:w-56 focus:outline-none focus:ring-2 focus:ring-green-400"
                    />
                </div>

                {/* Productos */}
                <ProductGrid products={products} />
            </main>

            {/* Footer */}
            <footer className="mt-16 border-t border-gray-100 py-6 text-center text-xs text-gray-400">
                Catálogo creado con{" "}
                <span className="font-bold text-gray-600">WALO</span>
                <span className="mx-4">·</span>
                Privacidad
                <span className="mx-2">·</span>
                Términos
                <span className="mx-2">·</span>
                Soporte
            </footer>
        </div>
    )
}