import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { ProductAddToCart } from '@/features/store/components/ProductAddToCart'
import { StorePublicHeader } from '@/features/store/components/StorePublicHeader'
import { getPublicProductBySlug, getStoreBySlug } from '@/features/store/server/queries'

type Props = {
    params: Promise<{ slug: string; productSlug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug, productSlug } = await params
    const store = await getStoreBySlug(slug)
    if (!store) return {}
    const product = await getPublicProductBySlug(productSlug, store.id)
    if (!product) return {}

    return {
        title: `${product.name} — ${store.name}`,
        description: product.description ?? `Compra ${product.name} en ${store.name}`,
    }
}

export default async function ProductDetailPage({ params }: Props) {
    const { slug, productSlug } = await params

    const store = await getStoreBySlug(slug)
    if (!store) notFound()

    const product = await getPublicProductBySlug(productSlug, store.id)
    if (!product) notFound()

    const formatter = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' })
    const visibleCategories = product.categories
        ?.filter(pc => pc.category?.visible)
        .map(pc => pc.category!.name) ?? []

    return (
        <div className="min-h-screen bg-gray-50">
                <header className="sticky top-0 z-10 border-b border-gray-100 bg-white">
                    <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
                        <Link href={`/${store.slug}`} className="hover:opacity-80 transition-opacity">
                            <StorePublicHeader name={store.name} logoUrl={store.logoUrl} />
                        </Link>
                    </div>
                </header>

                <main className="mx-auto max-w-5xl px-4 py-8">
                    <nav className="mb-6 text-xs text-gray-400">
                        <Link href={`/${store.slug}`} className="hover:text-green-600 transition-colors">
                            ← Volver al catálogo
                        </Link>
                    </nav>

                    <div className="grid gap-8 lg:grid-cols-2">
                        {/* Imagen */}
                        <div className="relative aspect-square overflow-hidden rounded-2xl border border-gray-100 bg-gray-50">
                            {product.imageUrl ? (
                                <Image
                                    src={product.imageUrl}
                                    alt={product.name}
                                    fill
                                    unoptimized
                                    priority
                                    className="object-cover"
                                />
                            ) : (
                                <div className="flex h-full items-center justify-center">
                                    <span className="text-8xl">📦</span>
                                </div>
                            )}
                        </div>

                        {/* Info */}
                        <div className="flex flex-col gap-6">
                            {visibleCategories.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {visibleCategories.map(cat => (
                                        <span
                                            key={cat}
                                            className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wide text-gray-500"
                                        >
                                            {cat}
                                        </span>
                                    ))}
                                </div>
                            )}

                            <div>
                                <h1 className="text-3xl font-bold tracking-tight text-gray-900">{product.name}</h1>
                                <p className="mt-3 text-3xl font-black text-green-700">
                                    {formatter.format(product.price)}
                                </p>
                            </div>

                            {product.description && (
                                <p className="text-base leading-relaxed text-gray-600">{product.description}</p>
                            )}

                            <ProductAddToCart
                                product={{ id: product.id, name: product.name, price: product.price }}
                                storeName={store.name}
                                storeId={store.id}
                                whatsappPhone={store.whatsappPhone}
                                allowPickup={store.allowPickup}
                                allowDelivery={store.allowDelivery}
                                deliveryCost={store.deliveryCost}
                                hasKhipu={!!store.khipuReceiverId && store.subscription?.plan?.slug !== 'initial'}
                            />
                        </div>
                    </div>
                </main>
        </div>
    )
}
