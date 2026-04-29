import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-6 py-12">
      <section className="w-full max-w-xl rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-bold text-gray-900">WALO</h1>
        <p className="mt-2 text-gray-600">
          Acceso rápido al flujo de autenticación del Sprint 1.
        </p>

        <div className="mt-8 flex flex-col gap-4">
          <Link
            href="/login"
            className="rounded-xl bg-gray-900 px-6 py-4 text-center text-lg font-semibold text-white transition hover:bg-gray-700"
          >
            Ir a Iniciar Sesión
          </Link>

          <Link
            href="/register"
            className="rounded-xl bg-green-600 px-6 py-4 text-center text-lg font-semibold text-white transition hover:bg-green-700"
          >
            Ir a Registro
          </Link>
        </div>
      </section>
    </main>
  )
}
