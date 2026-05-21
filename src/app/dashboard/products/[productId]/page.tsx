import { getServerSession } from 'next-auth'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'

import { authOptions } from '@/server/auth'
import { getProductById } from '@/features/product/actions'

type ProductDetailPageProps = {
  params: Promise<{
    productId: string
  }>
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/login')
  }

  const { productId } = await params

  // Early validation: productId must exist, be non-empty, and be a valid string
  if (!productId || typeof productId !== 'string' || productId.trim() === '') {
    notFound()
  }

  const result = await getProductById(productId)

  if (!result.success) {
    return (
      <main className="flex min-h-screen flex-col bg-gray-50 px-6 py-12">
        <div className="mx-auto w-full max-w-2xl">
          <Link
            href="/dashboard/products"
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
            Volver a productos
          </Link>
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {result.error}
          </div>
        </div>
      </main>
    )
  }

  const product = result.data

  const formattedDate = new Intl.DateTimeFormat('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(product.createdAt))

  const updatedFormattedDate = new Intl.DateTimeFormat('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(product.updatedAt))

  return (
    <main className="flex min-h-screen flex-col bg-gray-50 px-6 py-12">
      <div className="mx-auto w-full max-w-2xl">
        {/* Back Button */}
        <Link
          href="/dashboard/products"
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
          Volver a productos
        </Link>

        {/* Product Detail Card */}
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
          {/* Header */}
          <div className="border-b border-gray-200 px-8 py-8">
            <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
          </div>

          {/* Content */}
          <div className="px-8 py-8">
            {/* Price */}
            <div className="mb-8">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-600">
                Precio
              </h2>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                ${product.price.toLocaleString('es-CO')}
              </p>
            </div>

            {/* Description */}
            {product.description && (
              <div className="mb-8">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-600">
                  Descripción
                </h2>
                <p className="mt-2 whitespace-pre-wrap text-gray-700">
                  {product.description}
                </p>
              </div>
            )}

            {/* Visibility Status */}
            <div className="mb-8">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-600">
                Estado de visibilidad
              </h2>
              <div className="mt-2">
                {product.visible ? (
                  <span className="inline-flex items-center rounded-full bg-green-100 px-4 py-2 text-sm font-medium text-green-700">
                    Visible
                  </span>
                ) : (
                  <span className="inline-flex items-center rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-gray-600">
                    Oculto
                  </span>
                )}
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-8">
              <div>
                <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-600">
                  Creado
                </h2>
                <p className="mt-2 text-sm text-gray-600">{formattedDate}</p>
              </div>
              <div>
                <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-600">
                  Última actualización
                </h2>
                <p className="mt-2 text-sm text-gray-600">{updatedFormattedDate}</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="border-t border-gray-200 px-8 py-8">
            <div className="flex gap-4">
              <Link
                href={`/dashboard/products/${product.id}/edit`}
                className="flex-1 rounded-xl bg-blue-500 px-6 py-3 text-center font-semibold text-white transition-all hover:bg-blue-600"
              >
                Editar producto
              </Link>
              <Link
                href="/dashboard/products"
                className="flex-1 rounded-xl border border-gray-300 bg-white px-6 py-3 text-center font-semibold text-gray-700 transition-all hover:bg-gray-50"
              >
                Volver
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
