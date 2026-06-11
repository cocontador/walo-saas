import Link from "next/link"
import { getServerSession } from "next-auth"
import { notFound } from "next/navigation"

import { StoreCatalog } from "@/features/store/components/StoreCatalog"
import { CartProvider } from "@/features/store/components/CartContext"
import {
    canManageStoreByUser,
    getStoreBySlug,
    getVisibleProducts,
} from "@/features/store/server/queries"
import { logInfo } from "@/lib/logger"
import { authOptions } from "@/server/auth"

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

    logInfo({
        event: "public_catalog.render_ok",
        scope: "store",
        message: "Catalogo publico renderizado correctamente",
        slug,
        storeId: store.id,
        meta: {
            visibleProducts: products.length,
        },
    })

    const session = await getServerSession(authOptions)
    const isOwner =
        session?.user?.id ? await canManageStoreByUser(store.id, session.user.id) : false

    return (
        <CartProvider key={store.id} storeId={store.id}>
            <div className="min-h-screen bg-gray-50">
                <header className="sticky top-0 z-10 border-b border-gray-100 bg-white">
                    <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
                        <span className="text-lg font-bold tracking-tight text-gray-900">WALO</span>
                        <nav className="hidden items-center gap-6 text-sm font-medium text-gray-500 sm:flex">
                            {isOwner && (
                                <Link href="/dashboard" className="transition-colors hover:text-gray-900">
                                    Dashboard
                                </Link>
                            )}
                            <span className="border-b-2 border-green-500 pb-0.5 text-green-600">Tienda</span>
                        </nav>
                        <button className="cursor-pointer flex items-center gap-1.5 rounded-full border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                                />
                            </svg>
                            Compartir
                        </button>
                    </div>
                </header>

                <main className="mx-auto max-w-5xl px-4 py-8">
                    <p className="mb-4 text-xs uppercase tracking-wide text-gray-400">
                        Tiendas &rsaquo;{" "}
                        <span className="font-semibold text-green-600">Catálogo actual</span>
                    </p>

                    {isOwner && (
                        <Link
                            href="/dashboard"
                            className="mb-6 inline-flex items-center gap-2 text-sm text-gray-500 transition-colors hover:text-gray-900"
                        >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 19l-7-7 7-7"
                                />
                            </svg>
                            Volver al dashboard
                        </Link>
                    )}

                    <div className="mb-8">
                        <h1 className="mb-2 text-4xl font-bold text-gray-900">{store.name}</h1>
                        {store.description && <p className="max-w-md text-gray-500">{store.description}</p>}
                    </div>

                    <StoreCatalog
                        products={products}
                        storeName={store.name}
                        whatsappPhone={store.whatsappPhone}
                    />
                </main>

            </div>
        </CartProvider>
    )
}