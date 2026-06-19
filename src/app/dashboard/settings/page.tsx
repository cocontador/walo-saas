import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/server/auth'
import { getUserStore } from '@/server/store'
import { KhipuSettingsForm } from './KhipuSettingsForm'

export const metadata = { title: 'Configuración — WALO' }

export default async function SettingsPage() {
    const session = await getServerSession(authOptions)
    if (!session?.user) redirect('/login')

    const store = await getUserStore()
    if (!store) redirect('/dashboard')

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-gray-950">Configuración</h1>
                <p className="mt-1 text-sm text-gray-500">Ajustes de tu tienda</p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="mb-6">
                    <h2 className="text-base font-semibold text-gray-950">Credenciales Khipu</h2>
                    <p className="mt-1 text-sm text-gray-500">
                        Ingresa tu Receiver ID y Secret de Khipu para que los pagos de tu tienda lleguen directamente a tu cuenta.
                        Puedes encontrar estos datos en{' '}
                        <span className="font-medium text-gray-700">khipu.com → Mi cuenta → Datos de cobro</span>.
                    </p>
                </div>

                {store.khipuReceiverId ? (
                    <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                        ✓ Khipu configurado — Receiver ID: <span className="font-mono font-semibold">{store.khipuReceiverId}</span>
                    </div>
                ) : (
                    <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                        Sin configurar — Tu tienda no puede recibir pagos hasta que ingreses tus credenciales de Khipu.
                    </div>
                )}

                <KhipuSettingsForm
                    currentReceiverId={store.khipuReceiverId ?? ''}
                />
            </div>
        </div>
    )
}
