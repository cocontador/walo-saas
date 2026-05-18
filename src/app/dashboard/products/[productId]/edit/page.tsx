import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'

import { authOptions } from '@/server/auth'
import { getProductById } from '@/features/product/actions'
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

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-6 py-12">
      <section className="w-full rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <ProductForm
          mode="edit"
          productId={productId}
          initialValues={{
            name: product.name,
            price: product.price,
            description: product.description,
          }}
        />
      </section>
    </main>
  )
}
