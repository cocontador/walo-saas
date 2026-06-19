'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

import { removeLogo, replaceLogo, uploadLogo } from '@/features/store/actions'

interface StoreFormProps {
  storeId: string
  initialName: string
  initialSlug: string
  initialDescription: string | null
  initialLogoUrl: string | null
  initialWhatsapp: string | null
}

function sanitizeSlug(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

function extractWhatsappDigits(phone: string | null): string {
  if (!phone) return ''
  return phone.replace(/^\+569/, '').replace(/\D/g, '').slice(0, 8)
}

export function StoreForm({
  storeId,
  initialName,
  initialSlug,
  initialDescription,
  initialLogoUrl,
  initialWhatsapp,
}: StoreFormProps) {
  const router = useRouter()
  const [name, setName] = useState(initialName)
  const [slug, setSlug] = useState(initialSlug)
  const [description, setDescription] = useState(initialDescription ?? '')
  const [logoUrl, setLogoUrl] = useState(initialLogoUrl)
  const [whatsappDigits, setWhatsappDigits] = useState(() => extractWhatsappDigits(initialWhatsapp))
  const [loading, setLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)

    try {
      const res = await fetch(`/api/store/${storeId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          slug,
          description,
          whatsappPhone: whatsappDigits.length === 8 ? `+569${whatsappDigits}` : null,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Error al guardar.')
      } else {
        setSuccess('Datos guardados correctamente.')
        router.refresh()
      }
    } catch {
      setError('Ocurrió un error inesperado.')
    } finally {
      setLoading(false)
    }
  }

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]

    if (!selectedFile) return

    setError(null)
    setSuccess(null)
    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append('storeId', storeId)
      formData.append('logo', selectedFile)

      const result = logoUrl ? await replaceLogo(formData) : await uploadLogo(formData)

      if (!result.ok) {
        setError(result.error ?? 'No se pudo guardar el logo.')
        return
      }

      setLogoUrl(`${result.logoUrl}?t=${Date.now()}`)
      setSuccess(logoUrl ? 'Logo reemplazado correctamente.' : 'Logo subido correctamente.')
    } catch {
      setError('No se pudo procesar el logo.')
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleRemoveLogo = async () => {
    setError(null)
    setSuccess(null)
    setIsUploading(true)

    try {
      const result = await removeLogo(storeId)

      if (!result.ok) {
        setError(result.error ?? 'No se pudo eliminar el logo.')
        return
      }

      setLogoUrl(null)
      setSuccess('Logo eliminado correctamente.')
    } catch {
      setError('No se pudo eliminar el logo.')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1 block text-xs font-semibold tracking-widest text-gray-500">
          NOMBRE DE LA TIENDA
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          disabled={loading || isUploading}
          className="w-full rounded-xl border border-transparent bg-gray-100 px-4 py-3 text-gray-900 placeholder-gray-400 transition-all focus:border-green-500 focus:bg-white focus:outline-none disabled:cursor-not-allowed disabled:opacity-70"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold tracking-widest text-gray-500">
          URL DE LA TIENDA
        </label>
        <input
          type="text"
          value={slug}
          onChange={(e) => setSlug(sanitizeSlug(e.target.value))}
          required
          disabled={loading || isUploading}
          placeholder="mi-tienda"
          className="w-full rounded-xl border border-transparent bg-gray-100 px-4 py-3 text-gray-900 placeholder-gray-400 transition-all focus:border-green-500 focus:bg-white focus:outline-none disabled:cursor-not-allowed disabled:opacity-70"
        />
        <p className="mt-1 text-xs text-gray-500">Se verá como: walo.app/{slug || 'mi-tienda'}</p>
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold tracking-widest text-gray-500">
          DESCRIPCIÓN
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          placeholder="Describe tu tienda..."
          disabled={loading || isUploading}
          className="w-full resize-none rounded-xl border border-transparent bg-gray-100 px-4 py-3 text-gray-900 placeholder-gray-400 transition-all focus:border-green-500 focus:bg-white focus:outline-none disabled:cursor-not-allowed disabled:opacity-70"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold tracking-widest text-gray-500">
          NÚMERO DE WHATSAPP
        </label>
        <div className="flex items-center rounded-xl border border-transparent bg-gray-100 transition-all focus-within:border-green-500 focus-within:bg-white">
          <span className="flex items-center gap-1.5 pl-4 pr-2 text-sm font-medium text-gray-500 whitespace-nowrap">
            <svg className="h-4 w-4 shrink-0 text-green-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.135.561 4.14 1.535 5.876L0 24l6.324-1.507A11.95 11.95 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.006-1.371l-.36-.214-3.731.889.924-3.638-.235-.374A9.818 9.818 0 1112 21.818z" />
            </svg>
            +56 9
          </span>
          <span className="self-stretch border-l border-gray-300" />
          <input
            type="tel"
            inputMode="numeric"
            placeholder="1234 5678"
            value={whatsappDigits.length > 4 ? `${whatsappDigits.slice(0, 4)} ${whatsappDigits.slice(4)}` : whatsappDigits}
            onChange={(e) => {
              const digits = e.target.value.replace(/\D/g, '').slice(0, 8)
              setWhatsappDigits(digits)
            }}
            disabled={loading || isUploading}
            className="min-w-0 flex-1 bg-transparent py-3 pl-3 pr-4 text-gray-900 placeholder-gray-400 focus:outline-none disabled:cursor-not-allowed disabled:opacity-70"
          />
        </div>
        <p className="mt-1 text-xs text-gray-400">Tus clientes te enviarán pedidos a este número.</p>
      </div>

      <div className="rounded-xl border border-gray-200 p-4">
        <p className="mb-3 text-xs font-semibold tracking-widest text-gray-500">LOGO DE TIENDA</p>

        {logoUrl ? (
          <div className="space-y-3">
            <img
              src={logoUrl}
              alt="Logo actual de la tienda"
              className="h-20 w-20 rounded-lg border border-gray-200 object-cover"
            />

            <div className="flex flex-wrap gap-2">
              <label className="inline-flex cursor-pointer items-center rounded-xl bg-green-500 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-green-600">
                {isUploading ? 'Procesando...' : 'Reemplazar logo'}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleLogoChange}
                  disabled={loading || isUploading}
                  className="hidden"
                />
              </label>

              <button
                type="button"
                onClick={handleRemoveLogo}
                disabled={loading || isUploading}
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition-all hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Eliminar logo
              </button>
            </div>
          </div>
        ) : (
          <label className="inline-flex cursor-pointer items-center rounded-xl bg-green-500 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-green-600">
            {isUploading ? 'Subiendo...' : 'Seleccionar logo'}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handleLogoChange}
              disabled={loading || isUploading}
              className="hidden"
            />
          </label>
        )}
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
          {success}
        </div>
      )}

      <button
        type="submit"
        disabled={loading || isUploading}
        className="w-full rounded-xl bg-green-500 px-4 py-3 font-semibold text-white transition-all hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? 'Guardando...' : 'Guardar cambios'}
      </button>
    </form>
  )
}
