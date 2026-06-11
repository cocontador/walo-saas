'use client'

interface Props {
    itemCount: number
    onClick: () => void
}

export function CartFloatingButton({ itemCount, onClick }: Props) {
    return (
        <button
            onClick={onClick}
            className="cursor-pointer fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-green-500 px-5 py-3 text-sm font-semibold text-white shadow-lg hover:bg-green-600 transition-colors"
        >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
            </svg>
            Carrito
            {itemCount > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-xs font-bold text-green-600">
                    {itemCount}
                </span>
            )}
        </button>
    )
}