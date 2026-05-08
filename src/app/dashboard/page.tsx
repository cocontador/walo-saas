import { getServerSession } from 'next-auth'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import { SignOutButton } from '@/features/auth/components/SignOutButton'
import { StoreStatusButton } from '@/features/store/components/StoreStatusButton'
import { StoreForm } from '@/features/store/components/StoreForm'
import { authOptions } from '@/server/auth'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/login')
  }

  const { prisma } = await import('@/lib/prisma')

  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
    include: {
      memberships: {
        include: { store: true },
      },
    },
  })

  const store = user?.memberships[0]?.store

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <span className="text-xl font-bold text-gray-900">WALO</span>
        <SignOutButton />
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900">
            ¡Bienvenido/a, {session.user.name ?? session.user.email}! 👋
          </h1>
          <p className="text-gray-500 mt-2">
            Tu tienda está lista. Empieza a agregar productos y comparte tu catálogo.
          </p>
        </div>

        {!store && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 mb-6">
            <h3 className="font-semibold text-yellow-800">No tienes una tienda aún</h3>
            <p className="text-sm text-yellow-700 mt-1">Crea tu tienda para empezar a vender.</p>
          </div>
        )}

        {store && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm mb-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
                  <path
                    d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <polyline
                    points="9 22 9 12 15 12 15 22"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-900">{store.name}</h2>
                <p className="text-sm text-gray-500">/{store.slug}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-4">
              <span className="text-sm text-gray-500">Link de tu tienda:</span>
              <code className="text-sm bg-gray-100 px-3 py-1 rounded-lg text-green-700 font-mono">
                walo.app/{store.slug}
              </code>
            </div>

            <div className="flex items-center gap-3 mt-4">
              <span
                className={`text-sm font-medium px-3 py-1 rounded-full ${
                  store.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}
              >
                {store.isActive ? 'Activa' : 'Inactiva'}
              </span>
              <StoreStatusButton storeId={store.id} isActive={store.isActive} />
            </div>

            <div className="mt-6">
              <Link
                href="/dashboard/products"
                className="inline-block rounded-xl bg-green-500 px-6 py-3 text-center font-semibold text-white transition-all hover:bg-green-600"
              >
                Crear nuevo producto
              </Link>
            </div>

            <div className="mt-6 border-t border-gray-100 pt-6">
              <h3 className="font-semibold text-gray-900 mb-4">Editar datos de tienda</h3>
              <StoreForm
                storeId={store.id}
                initialName={store.name}
                initialDescription={store.description}
              />
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { title: 'Agregar producto', desc: 'Sube fotos, precios y descripciones.', icon: '📦' },
            { title: 'Compartir catálogo', desc: 'Envía el link por WhatsApp.', icon: '🔗' },
            { title: 'Ver pedidos', desc: 'Gestiona los pedidos entrantes.', icon: '📋' },
          ].map((card) => (
            <div
              key={card.title}
              className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="text-3xl mb-3">{card.icon}</div>
              <h3 className="font-semibold text-gray-900">{card.title}</h3>
              <p className="text-sm text-gray-500 mt-1">{card.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
