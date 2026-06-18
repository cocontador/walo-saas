import Link from 'next/link'
import { ArrowLeft, Store } from 'lucide-react'

export default function NotFound() {
    return (
        <div className="flex min-h-screen flex-col bg-gray-50">
            <header className="border-b border-gray-200 bg-white">
                <div className="mx-auto flex max-w-lg items-center px-4 py-4">
                    <Link href="/" className="flex items-center gap-2">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-sm font-black text-white">
                            W
                        </span>
                        <span className="text-lg font-black tracking-tight text-gray-950">WALO</span>
                    </Link>
                </div>
            </header>

            <main className="flex flex-1 flex-col items-center justify-center p-6 text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50">
                    <Store className="h-10 w-10 text-emerald-600" />
                </div>

                <h1 className="mt-6 text-4xl font-black tracking-tight text-gray-950">404</h1>
                <h2 className="mt-2 text-lg font-semibold text-gray-700">Esta página no existe</h2>
                <p className="mt-3 max-w-xs text-sm text-gray-500">
                    La tienda o página que buscas no está disponible. Puede que el enlace esté mal escrito o que la tienda haya cambiado su dirección.
                </p>

                <Link
                    href="/"
                    className="mt-8 inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Volver al inicio
                </Link>
            </main>

            <footer className="border-t border-gray-200 bg-white py-4 text-center text-xs text-gray-400">
                Powered by <span className="font-bold text-emerald-600">WALO</span>
            </footer>
        </div>
    )
}
