import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { authOptions } from '@/server/auth'
import { getUserStore } from '@/server/store'
import { KhipuSettingsForm } from './KhipuSettingsForm'
import { getCurrentPlan } from '@/features/billing/actions'

export const metadata = { title: 'Configuración — WALO' }

export default async function SettingsPage() {
    const session = await getServerSession(authOptions)
    if (!session?.user) redirect('/login')

    const [store, { plan }] = await Promise.all([getUserStore(), getCurrentPlan()])
    if (!store) redirect('/dashboard')

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-gray-950">Configuración</h1>
                <p className="mt-1 text-sm text-gray-500">Ajustes de tu tienda</p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="mb-6">
                    <h2 className="text-base font-semibold text-gray-950">Pasarela de pagos Khipu</h2>
                    <p className="mt-1 text-sm text-gray-500">
                        Configura tus credenciales de Khipu para recibir pagos directamente en tu cuenta.
                    </p>
                </div>

                {plan.slug === 'initial' ? (
                    <div className="flex flex-col items-start gap-4 rounded-xl border border-emerald-100 bg-emerald-50 p-5 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm font-semibold text-emerald-900">Disponible en el Plan Pro</p>
                            <p className="mt-1 text-sm text-emerald-700">
                                Activa la pasarela de pagos Khipu para que tus clientes puedan pagar en línea.
                            </p>
                        </div>
                        <Link
                            href="/dashboard/billing"
                            className="shrink-0 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-700"
                        >
                            Mejorar plan →
                        </Link>
                    </div>
                ) : (
                    <>
                        {store.khipuReceiverId ? (
                            <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                                ✓ Khipu configurado — Receiver ID: <span className="font-mono font-semibold">{store.khipuReceiverId}</span>
                            </div>
                        ) : (
                            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                                Sin configurar — Tu tienda no puede recibir pagos hasta que ingreses tus credenciales de Khipu.
                            </div>
                        )}
                        <KhipuSettingsForm currentReceiverId={store.khipuReceiverId ?? ''} />
                    </>
                )}
            </div>
        </div>
    )
}
