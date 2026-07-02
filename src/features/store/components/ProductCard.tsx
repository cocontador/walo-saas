import Image from 'next/image'
import Link from 'next/link'

type Props = {
    id: string
    name: string
    description: string | null
    price: number
    imageUrl?: string | null
    category?: string
    slug?: string | null
    storeSlug: string
    onAddToCart: () => void
    priority?: boolean
}

export function ProductCard({
    name,
    description,
    price,
    imageUrl,
    category,
    slug,
    storeSlug,
    onAddToCart,
    priority = false,
    id,
}: Props) {
    const formatter = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' })
    const detailHref = `/${storeSlug}/${slug ?? id}`

    return (
        <div className="group rounded-2xl border border-gray-100 bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
            {/* Imagen del Producto */}
            <Link href={detailHref} className="relative bg-gray-50 aspect-square overflow-hidden block">
                {imageUrl ? (
                    <Image
                        src={imageUrl}
                        alt={name}
                        fill
                        unoptimized
                        sizes="(max-width: 640px) 50vw, 33vw"
                        loading={priority ? 'eager' : 'lazy'}
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                ) : (
                    <div className="flex h-full items-center justify-center">
                        <span className="text-6xl">📦</span>
                    </div>
                )}
                {category && (
                    <span className="absolute bottom-3 left-3 bg-black/60 text-white text-xs font-semibold px-2 py-1 rounded-full uppercase tracking-wide">
                        {category}
                    </span>
                )}
            </Link>

            {/* Detalles del Producto */}
            <div className="p-4 flex flex-col flex-grow">
                <div className="flex items-start justify-between gap-2 mb-1">
                    <Link href={detailHref} className="hover:text-green-700 transition-colors">
                        <h3 className="font-semibold text-gray-900 text-sm leading-tight">{name}</h3>
                    </Link>
                    <p className="font-bold text-gray-900 text-sm whitespace-nowrap">
                        {formatter.format(price)}
                    </p>
                </div>
                {description && (
                    <p className="text-xs text-gray-500 line-clamp-2 mb-4 flex-grow">{description}</p>
                )}

                <div className="flex flex-col gap-2 mt-auto">
                    <button
                        onClick={onAddToCart}
                        type="button"
                        className="cursor-pointer w-full border border-green-500 text-green-600 hover:bg-green-50 text-xs font-semibold py-2 rounded-full transition-colors flex items-center justify-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        Agregar al carrito
                    </button>
                </div>
            </div>
        </div>
    )
}
