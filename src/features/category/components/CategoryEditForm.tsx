'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateCategory, deleteCategory } from '@/features/category/actions'

type Props = {
  category: { id: string; name: string; isActive: boolean; visible: boolean }
}

export function CategoryEditForm({ category }: Props) {
  const router = useRouter()
  const [name, setName] = useState(category.name)
  const [visible, setVisible] = useState(category.visible)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!name.trim()) {
      setError('El nombre es requerido')
      return
    }

    setLoading(true)

    try {
      const result = await updateCategory(category.id, { name: name.trim(), visible })

      if (!result.success) {
        setError(result.error)
        return
      }

      setSuccess('Categoría actualizada exitosamente.')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocurrió un error inesperado')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('¿Eliminar categoría? Esto no eliminará productos, solo removerá la categoría.')) return

    setLoading(true)
    try {
      const result = await deleteCategory(category.id)
      if (!result.success) {
        setError(result.error)
        return
      }
      router.push('/dashboard/categories')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocurrió un error inesperado')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-2xl">
      <button
        type="button"
        onClick={() => router.push('/dashboard/categories')}
        className="cursor-pointer mb-8 flex items-center gap-2 text-sm text-gray-500 transition-colors hover:text-gray-800"
      >
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
          <path
            d="M19 12H5M5 12l7 7M5 12l7-7"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Volver a categorías
      </button>

      <h2 className="mb-1 text-3xl font-bold text-gray-900">Editar categoría</h2>
      <p className="mb-8 text-gray-500">Modifica el nombre y visibilidad de la categoría.</p>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      {success && (
        <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">{success}</div>
      )}

      <form onSubmit={handleUpdate} className="space-y-6">
        <div>
          <label htmlFor="category-name" className="mb-1 block text-xs font-semibold tracking-widest text-gray-500">
            NOMBRE DE LA CATEGORÍA
            <span className="ml-1 text-red-500">*</span>
          </label>
          <input
            id="category-name"
            type="text"
            placeholder="Ej: Ropa, Accesorios"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border border-transparent bg-gray-100 px-4 py-3 text-gray-900 transition-all focus:border-green-500 focus:bg-white focus:outline-none"
            required
          />
        </div>

        <div className="flex items-center gap-3">
          <input
            id="category-visible"
            type="checkbox"
            checked={visible}
            onChange={(e) => setVisible(e.target.checked)}
            className="cursor-pointer h-5 w-5 rounded border-gray-300 text-green-500 transition-all focus:ring-green-500"
          />
          <label htmlFor="category-visible" className="cursor-pointer text-sm font-medium text-gray-700">
            Visible en el catálogo público
          </label>
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={loading}
            className="cursor-pointer inline-flex w-full items-center justify-center rounded-xl bg-green-500 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? 'Guardando...' : 'Guardar cambios'}
          </button>

          <button
            type="button"
            onClick={handleDelete}
            disabled={loading}
            className="cursor-pointer inline-flex w-full items-center justify-center rounded-xl bg-red-500 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? 'Eliminando...' : 'Eliminar categoría'}
          </button>
        </div>
      </form>
    </div>
  )
}
