import Image from 'next/image'

type Props = {
    name: string
    logoUrl?: string | null
}

function StoreInitials({ name }: { name: string }) {
    const initials = name
        .split(' ')
        .slice(0, 2)
        .map(w => w[0]?.toUpperCase() ?? '')
        .join('')

    return (
        <div
            aria-label={`Logo de ${name}`}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-600 text-sm font-black text-white"
        >
            {initials}
        </div>
    )
}

export function StorePublicHeader({ name, logoUrl }: Props) {
    return (
        <div className="flex items-center gap-3">
            {logoUrl ? (
                <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full">
                    <Image
                        src={logoUrl}
                        alt={`Logo de ${name}`}
                        fill
                        unoptimized
                        className="object-cover"
                    />
                </div>
            ) : (
                <StoreInitials name={name} />
            )}
            <span className="text-lg font-bold tracking-tight text-gray-900">{name}</span>
        </div>
    )
}
