import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'

import { SignOutButton } from '@/features/auth/components/SignOutButton'
import { authOptions } from '@/server/auth'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/login')
  }

  const identity = session.user.name ?? session.user.email ?? 'Usuario'

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-6 py-12">
      <section className="w-full max-w-2xl rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-bold text-gray-900">
          Bienvenido, estás logueado en WALO
        </h1>

        <p className="mt-3 text-lg text-gray-700">
          Sesión activa para: <span className="font-semibold">{identity}</span>
        </p>

        <div className="mt-8 space-y-4">
          <Link
            href="/dashboard/products"
            className="block rounded-xl bg-green-500 px-6 py-3 text-center font-semibold text-white transition-all hover:bg-green-600"
          >
            Crear nuevo producto
          </Link>

          <SignOutButton />
        </div>
      </section>
    </main>
  )
}
