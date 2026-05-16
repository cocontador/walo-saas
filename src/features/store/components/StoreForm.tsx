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

export function StoreForm({
  storeId,
  initialName,
  initialSlug,
  initialDescription,
  initialLogoUrl,
}: StoreFormProps) {
  const router = useRouter()
  const [name, setName] = useState(initialName)
  const [slug, setSlug] = useState(initialSlug)
  const [description, setDescription] = useState(initialDescription ?? '')
  const [logoUrl, setLogoUrl] = useState(initialLogoUrl)
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
