import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'

import { authOptions } from '@/server/auth'
import { getUserStoreId } from '@/server/store'
import { prisma } from '@/lib/prisma'
import { CategoryEditForm } from '@/features/category/components/CategoryEditForm'

export default async function EditCategoryPage({ params }: { params: { categoryId: string } }) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/login')
  }

  const storeId = await getUserStoreId()

  if (!storeId) {
    redirect('/dashboard')
  }

  const category = await prisma.category.findFirst({ where: { id: params.categoryId, storeId }, select: { id: true, name: true } })

  if (!category) {
    redirect('/dashboard/categories')
  }

  return (
    <main className="flex min-h-screen flex-col bg-gray-50 px-6 py-12">
      <div className="mx-auto w-full max-w-5xl space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Editar categoría</h1>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr]">
          <section className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
            <CategoryEditForm category={category} />
          </section>
        </div>
      </div>
    </main>
  )
}
