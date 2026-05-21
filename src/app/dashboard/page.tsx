import { getServerSession } from 'next-auth'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { StoreStatusButton } from '@/features/store/components/StoreStatusButton'
import { StoreForm } from '@/features/store/components/StoreForm'
import { authOptions } from '@/server/auth'
import { ShareButton } from '@/features/store/components/ShareButton'

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

            <div className="flex items-center gap-2 mt-4 flex-wrap">
              <span className="text-sm text-gray-500">Link de tu tienda:</span>
              <code className="text-sm bg-gray-100 px-3 py-1 rounded-lg text-green-700 font-mono">
                walo.app/{store.slug}
              </code>
              <Link
                href={`/${store.slug}`}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-white bg-green-500 hover:bg-green-600 px-3 py-1 rounded-lg transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Ver catálogo
              </Link>
              <ShareButton slug={store.slug} />
            </div>

            <div className="flex items-center gap-3 mt-4">
              <span
                className={`text-sm font-medium px-3 py-1 rounded-full ${store.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}
              >
                {store.isActive ? 'Activa' : 'Inactiva'}
              </span>
              <StoreStatusButton storeId={store.id} isActive={store.isActive} />
            </div>

            <div className="mt-6 border-t border-gray-100 pt-6">
              <h3 className="font-semibold text-gray-900 mb-4">Editar datos de tienda</h3>
              <StoreForm
                storeId={store.id}
                initialName={store.name}
                initialSlug={store.slug}
                initialDescription={store.description}
                initialLogoUrl={store.logoUrl}
              />
            </div>
          </div>
        )}


      </main>
    </div>
  )
}
