'use client'

import { useActionState } from 'react'
import { updateKhipuSettings } from '@/features/store/actions/updateKhipu'

type Props = { currentReceiverId: string }

export function KhipuSettingsForm({ currentReceiverId }: Props) {
    const [state, action, pending] = useActionState(updateKhipuSettings, null)

    return (
        <form action={action} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="khipuReceiverId">
                    Receiver ID
                </label>
                <input
                    id="khipuReceiverId"
                    name="khipuReceiverId"
                    type="text"
                    defaultValue={currentReceiverId}
                    placeholder="ej: 519708"
                    className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="khipuSecret">
                    Secret
                </label>
                <input
                    id="khipuSecret"
                    name="khipuSecret"
                    type="password"
                    placeholder="Tu clave secreta de Khipu"
                    className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <p className="mt-1 text-xs text-gray-400">Por seguridad el secret no se muestra. Ingresa uno nuevo solo si quieres cambiarlo.</p>
            </div>

            {state && !state.success && (
                <p className="text-sm text-red-600">{state.error}</p>
            )}
            {state?.success && (
                <p className="text-sm text-emerald-700">✓ Credenciales guardadas correctamente.</p>
            )}

            <button
                type="submit"
                disabled={pending}
                className="cursor-pointer rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
            >
                {pending ? 'Guardando...' : 'Guardar credenciales'}
            </button>
        </form>
    )
}
