import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'

import { authOptions } from '@/server/auth'
import { getCategories } from '@/features/category/actions'
import { CategoryForm } from '@/features/category/components/CategoryForm'

export default async function CategoriesPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/login')
  }

  const categoriesResult = await getCategories()
  const categories = categoriesResult.success ? categoriesResult.data : []

  return (
    <main className="flex min-h-screen flex-col bg-gray-50 px-6 py-12">
      <div className="mx-auto w-full max-w-5xl space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Categorías</h1>
            <p className="mt-2 text-gray-500">Organiza tus productos en tu tienda.</p>
          </div>
          <Link
            href="/dashboard"
            className="inline-flex items-center rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            Volver al dashboard
          </Link>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.5fr,1fr]">
          <section className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Categorías existentes</h2>
                <p className="mt-1 text-sm text-gray-500">
                  Estas categorías se pueden asignar a productos.
                </p>
              </div>
            </div>

            {categoriesResult.success && categories.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-8 text-center text-sm text-gray-500">
                No hay categorías creadas todavía.
              </div>
            ) : categoriesResult.success ? (
              <ul className="space-y-3">
                {categories.map((category) => (
                  <li
                    key={category.id}
                    className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-4 flex items-center justify-between gap-4"
                  >
                    <div>
                      <p className="font-semibold text-gray-900">{category.name}</p>
                      <div className="mt-2 flex gap-2">
                        <span
                          className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${
                            category.visible
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-200 text-gray-700'
                          }`}
                        >
                          {category.visible ? 'Visible' : 'Oculta'}
                        </span>
                        <span
                          className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${
                            category.isActive
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-orange-100 text-orange-800'
                          }`}
                        >
                          {category.isActive ? 'Activa' : 'Inactiva'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/dashboard/categories/${category.id}/edit`}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        Editar
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {categoriesResult.error}
              </div>
            )}
          </section>

          <aside>
            <CategoryForm />
          </aside>
        </div>
      </div>
    </main>
  )
}
