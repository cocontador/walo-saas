import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'

import { authOptions } from '@/server/auth'
import { ProductForm } from '@/features/product/components/ProductForm'

export default async function CreateProductPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/login')
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-6 py-12">
      <section className="w-full rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <ProductForm />
      </section>
    </main>
  )
}
