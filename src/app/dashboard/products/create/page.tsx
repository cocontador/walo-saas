import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'

import { authOptions } from '@/server/auth'
import { ProductForm } from '@/features/product/components/ProductForm'
import { getCategories } from '@/features/category/actions'
import { getPlanUsage } from '@/features/billing/actions'

export default async function CreateProductPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/login')
  }

  const [categoriesResult, usage] = await Promise.all([
    getCategories(),
    getPlanUsage(),
  ])

  if (!usage.isUnlimited && usage.activeProducts >= (usage.productLimit ?? 0)) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 px-6">
        <div className="max-w-md space-y-5 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
            <svg className="h-8 w-8 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-950">Límite de productos alcanzado</h1>
            <p className="mt-2 text-sm leading-relaxed text-gray-500">
              Tu plan actual permite hasta <strong>{usage.productLimit}</strong> productos activos
              y ya tienes <strong>{usage.activeProducts}</strong>.
              Sube al Plan Pro para agregar productos ilimitados.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/dashboard/billing"
              className="rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-emerald-700"
            >
              Ver Plan Pro →
            </Link>
            <Link
              href="/dashboard/products"
              className="rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              Volver a productos
            </Link>
          </div>
        </div>
      </main>
    )
  }

  const categories = categoriesResult.success ? categoriesResult.data : []

  return (
    <main className="flex min-h-screen flex-col bg-gray-50 px-6 py-12">
      <div className="mx-auto w-full max-w-2xl">
        <ProductForm mode="create" categories={categories} />
      </div>
    </main>
  )
}
