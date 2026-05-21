export default function StoreNotFound() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
            <p className="text-6xl">🏪</p>
            <h1 className="text-2xl font-bold text-gray-900">
                Tienda no encontrada
            </h1>
            <p className="text-gray-500">
                Esta tienda no existe o no está disponible.
            </p>
            <a href="/" className="mt-4 rounded-full bg-green-500 px-6 py-2 text-white font-medium hover:bg-green-600 transition-colors">
                Volver al inicio
            </a>
        </div>
    )
}