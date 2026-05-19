import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'

import { authOptions } from '@/server/auth'
import { getProducts } from '@/features/product/actions'

export default async function ProductsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/login')
  }

  const result = await getProducts()

  if (!result.success) {
    return (
      <main className="flex min-h-screen flex-col bg-gray-50 px-6 py-12">
        <div className="mx-auto w-full max-w-6xl">
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {result.error}
          </div>
        </div>
      </main>
    )
  }

  const products = result.data

  return (
    <main className="flex min-h-screen flex-col bg-gray-50 px-6 py-12">
      <div className="mx-auto w-full max-w-6xl">
        {/* Back Button */}
        <Link
          href="/dashboard"
          className="mb-8 flex items-center gap-2 text-sm text-gray-500 transition-colors hover:text-gray-800"
        >
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
            <path
              d="M19 12H5M5 12l7 7M5 12l7-7"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Volver al dashboard
        </Link>

        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Productos</h1>
            <p className="mt-1 text-gray-500">Gestiona el catálogo de tu tienda</p>
          </div>
          <Link
            href="/dashboard/products/create"
            className="rounded-xl bg-green-500 px-6 py-3 font-semibold text-white transition-all hover:bg-green-600"
          >
            + Nuevo producto
          </Link>
        </div>

        {/* Products List */}
        {products.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center">
            <div className="mb-4 text-4xl text-gray-300">📦</div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900">Sin productos</h3>
            <p className="mb-6 text-gray-500">Comienza creando tu primer producto</p>
            <Link
              href="/dashboard/products/create"
              className="inline-block rounded-xl bg-green-500 px-6 py-3 font-semibold text-white transition-all hover:bg-green-600"
            >
              Crear primer producto
            </Link>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-gray-200 bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold tracking-wider text-gray-600">
                      NOMBRE
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold tracking-wider text-gray-600">
                      PRECIO
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold tracking-wider text-gray-600">
                      DESCRIPCIÓN
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold tracking-wider text-gray-600">
                      ESTADO
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold tracking-wider text-gray-600">
                      ACCIONES
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <span className="font-semibold text-gray-900">{product.name}</span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        ${product.price.toLocaleString('es-CO')}
                      </td>
                      <td className="max-w-xs px-6 py-4 text-gray-600">
                        <span className="line-clamp-2 text-sm">
                          {product.description || '—'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {product.visible ? (
                          <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                            Visible
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                            Oculto
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/dashboard/products/${product.id}/edit`}
                          className="inline-flex items-center gap-2 rounded-lg bg-blue-100 px-3 py-2 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-200"
                        >
                          <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                            <path
                              d="M3 17.25V21h3.75L17.81 9.94m-2.83-2.83l2.83-2.83a2 2 0 012.83 0l2.83 2.83a2 2 0 010 2.83l-2.83 2.83m-2.83-2.83L9.94 3.19"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          Editar
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
