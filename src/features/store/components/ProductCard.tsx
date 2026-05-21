type Props = {
    name: string
    description: string | null
    price: number
}

export function ProductCard({ name, description, price }: Props) {
    return (
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <div className="mb-3 flex h-40 items-center justify-center rounded-xl bg-gray-50">
                <span className="text-4xl">📦</span>
            </div>
            <h3 className="font-semibold text-gray-900">{name}</h3>
            {description && (
                <p className="mt-1 text-sm text-gray-500 line-clamp-2">{description}</p>
            )}
            <p className="mt-2 font-bold text-green-600">
                ${(price / 100).toLocaleString("es-CL")}
            </p>
        </div>
    )
}