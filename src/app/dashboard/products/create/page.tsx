import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'

import { authOptions } from '@/server/auth'
import { ProductForm } from '@/features/product/components/ProductForm'
import { getCategories } from '@/features/category/actions'

export default async function CreateProductPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/login')
  }

  const categoriesResult = await getCategories()
  const categories = categoriesResult.success ? categoriesResult.data : []

  return (
    <main className="flex min-h-screen flex-col bg-gray-50 px-6 py-12">
      <div className="mx-auto w-full max-w-2xl">
        <ProductForm mode="create" categories={categories} />
      </div>
    </main>
  )
}
