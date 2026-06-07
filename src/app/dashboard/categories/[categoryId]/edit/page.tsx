import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'

import { authOptions } from '@/server/auth'
import { getUserStoreId } from '@/server/store'
import { prisma } from '@/lib/prisma'
import { CategoryEditForm } from '@/features/category/components/CategoryEditForm'

export default async function EditCategoryPage({ params }: { params: Promise<{ categoryId: string }> }) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/login')
  }

  const storeId = await getUserStoreId()

  if (!storeId) {
    redirect('/dashboard')
  }

  const { categoryId } = await params

  const category = await prisma.category.findFirst({
    where: { id: categoryId, storeId },
    select: { id: true, name: true, isActive: true, visible: true },
  })

  if (!category) {
    redirect('/dashboard/categories')
  }

  return (
    <main className="flex min-h-screen flex-col bg-gray-50 px-6 py-12">
      <div className="mx-auto w-full max-w-2xl">
        <CategoryEditForm category={category} />
      </div>
    </main>
  )
}
