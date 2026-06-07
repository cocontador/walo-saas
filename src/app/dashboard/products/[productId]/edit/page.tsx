import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'

import { authOptions } from '@/server/auth'
import { getProductById } from '@/features/product/actions'
import { getCategories } from '@/features/category/actions'
import { ProductForm } from '@/features/product/components/ProductForm'

type EditProductPageProps = {
  params: Promise<{
    productId: string
  }>
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/login')
  }

  const { productId } = await params

  const result = await getProductById(productId)

  if (!result.success) {
    return (
      <main className="flex min-h-screen flex-col bg-gray-50 px-6 py-12">
        <div className="mx-auto w-full max-w-2xl">
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {result.error}
          </div>
        </div>
      </main>
    )
  }

  const product = result.data
  const categoriesResult = await getCategories()
  const categories = categoriesResult.success ? categoriesResult.data : []

  return (
    <main className="flex min-h-screen flex-col bg-gray-50 px-6 py-12">
      <div className="mx-auto w-full max-w-2xl">
        <ProductForm
          mode="edit"
          productId={productId}
          categories={categories}
          initialValues={{
            name: product.name,
            price: product.price,
            description: product.description,
            categoryIds: product.categories.map(c => c.id),
          }}
        />
      </div>
    </main>
  )
}
