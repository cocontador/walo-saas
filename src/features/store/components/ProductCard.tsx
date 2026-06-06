type Props = {
    name: string
    description: string | null
    price: number
    imageUrl?: string | null
    category?: string
    isNew?: boolean
    isSale?: boolean
}

export function ProductCard({ name, description, price, imageUrl, category, isNew, isSale }: Props) {
    return (
        <div className="group rounded-2xl border border-gray-100 bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="relative bg-gray-50 aspect-square overflow-hidden">
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={name}
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <div className="flex h-full items-center justify-center">
                        <span className="text-6xl">📦</span>
                    </div>
                )}
                {isNew && (
                    <span className="absolute top-3 left-3 bg-white text-xs font-bold px-2 py-1 rounded-full shadow-sm">
                        NUEVO
                    </span>
                )}
                {isSale && (
                    <span className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                        SALE
                    </span>
                )}
                {category && (
                    <span className="absolute bottom-3 left-3 bg-black/60 text-white text-xs font-semibold px-2 py-1 rounded-full uppercase tracking-wide">
                        {category}
                    </span>
                )}
            </div>

            {/* Info */}
            <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900 text-sm leading-tight">{name}</h3>
                    <p className="font-bold text-gray-900 text-sm whitespace-nowrap">
                        {price.toLocaleString("es-CL", { style: "currency", currency: "CLP" })}
                    </p>
                </div>
                {description && (
                    <p className="text-xs text-gray-500 line-clamp-2 mb-3">{description}</p>
                )}
                <button className="w-full bg-green-500 hover:bg-green-600 text-white text-sm font-semibold py-2 rounded-full transition-colors flex items-center justify-center gap-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                        <path d="M12 0C5.373 0 0 5.373 0 12c0 2.135.561 4.14 1.535 5.876L0 24l6.324-1.507A11.95 11.95 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.006-1.371l-.36-.214-3.731.889.924-3.638-.235-.374A9.818 9.818 0 1112 21.818z" />
                    </svg>
                    Pedir por WhatsApp
                </button>
            </div>
        </div>
    )
}