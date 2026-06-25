import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'

import { authOptions } from '@/server/auth'
import { getProducts, hideProduct, reactivateProduct } from '@/features/product/actions'

type ProductsPageProps = {
  searchParams: Promise<{
    q?: string
  }>
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/login')
  }

  const { q } = await searchParams
  const searchTerm = q?.trim() || null

  const result = await getProducts(searchTerm)

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
            data-tour="create-product-button"
            className="rounded-xl bg-green-500 px-6 py-3 font-semibold text-white transition-all hover:bg-green-600"
          >
            + Nuevo producto
          </Link>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <form action="/dashboard/products" method="get" className="flex gap-2">
            <input
              type="text"
              name="q"
              placeholder="Buscar por nombre o descripción..."
              defaultValue={q || ''}
              className="flex-1 rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-500 transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="cursor-pointer rounded-xl bg-blue-500 px-6 py-3 font-semibold text-white transition-all hover:bg-blue-600"
            >
              Buscar
            </button>
            {searchTerm && (
              <Link
                href="/dashboard/products"
                className="rounded-xl border border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700 transition-all hover:bg-gray-50"
              >
                Limpiar
              </Link>
            )}
          </form>
        </div>

        {/* Search term display */}
        {searchTerm && (
          <div className="mb-4 text-sm text-gray-600">
            Resultados de búsqueda para: <span className="font-semibold">{searchTerm}</span>
          </div>
        )}

        {/* Products List */}
        {products.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center">
            <div className="mb-4 text-4xl text-gray-300">
              {searchTerm ? '🔍' : '📦'}
            </div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900">
              {searchTerm ? 'No se encontraron productos' : 'Sin productos'}
            </h3>
            <p className="mb-6 text-gray-500">
              {searchTerm
                ? 'Intenta con otros términos de búsqueda'
                : 'Comienza creando tu primer producto'}
            </p>
            <Link
              href="/dashboard/products/create"
              data-tour="create-product-button"
              className="inline-block rounded-xl bg-green-500 px-6 py-3 font-semibold text-white transition-all hover:bg-green-600"
            >
              {searchTerm ? 'Crear nuevo producto' : 'Crear primer producto'}
            </Link>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-gray-200 bg-gray-50">
                  <tr>
                    <th className="px-4 py-4 text-left text-xs font-semibold tracking-wider text-gray-600">
                      IMAGEN
                    </th>
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
                      <td className="px-4 py-3">
                        <div className="h-12 w-12 overflow-hidden rounded-lg bg-gray-50 flex items-center justify-center border border-gray-100">
                          {product.imageUrl ? (
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <span className="text-2xl">📦</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-gray-900">{product.name}</span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        ${product.price.toLocaleString('es-CL')}
                      </td>
                      <td className="max-w-xs px-6 py-4 text-gray-600">
                        <span className="line-clamp-2 text-sm">
                          {product.description || '—'}
                        </span>
                      </td>
                      <td className="px-6 py-4" data-tour="product-status">
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
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/dashboard/products/${product.id}`}
                            className="inline-flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200"
                          >
                            <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                              <path
                                d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"
                                fill="currentColor"
                              />
                            </svg>
                            Ver
                          </Link>
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
                          <form action={product.visible ? hideProduct : reactivateProduct} className="inline-block">
                            <input type="hidden" name="productId" value={product.id} />
                            <button
                              type="submit"
                              className={`cursor-pointer inline-flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                                product.visible
                                  ? 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                                  : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                              }`}
                            >
                              {product.visible ? 'Ocultar' : 'Reactivar'}
                            </button>
                          </form>
                        </div>
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
