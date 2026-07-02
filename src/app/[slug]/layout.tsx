import { notFound } from 'next/navigation'
import { getStoreBySlug } from '@/features/store/server/queries'
import { CartProvider } from '@/features/store/components/CartContext'

type Props = {
    children: React.ReactNode
    params: Promise<{ slug: string }>
}

export default async function StoreLayout({ children, params }: Props) {
    const { slug } = await params
    const store = await getStoreBySlug(slug)
    if (!store) notFound()

    return (
        <CartProvider storeId={store.id}>
            {children}
        </CartProvider>
    )
}
