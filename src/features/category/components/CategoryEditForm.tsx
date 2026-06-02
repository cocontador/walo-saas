'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateCategory, deleteCategory } from '@/features/category/actions'

type Props = {
  category: { id: string; name: string }
}

export function CategoryEditForm({ category }: Props) {
  const router = useRouter()
  const [name, setName] = useState(category.name)
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
      const result = await updateCategory(category.id, { name: name.trim() })

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
    <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
      <h2 className="mb-4 text-2xl font-bold text-gray-900">Editar categoría</h2>
      <p className="mb-6 text-sm text-gray-500">Modifica el nombre de la categoría.</p>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      {success && (
        <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">{success}</div>
      )}

      <form onSubmit={handleUpdate} className="space-y-6">
        <div>
          <label htmlFor="category-name" className="mb-1 block text-xs font-semibold tracking-widest text-gray-500">
            Nombre de la categoría
            <span className="ml-1 text-red-500">*</span>
          </label>
          <input
            id="category-name"
            type="text"
            placeholder="Ej: Ropa, Accesorios"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-gray-100 px-4 py-3 text-gray-900 transition-all focus:border-green-500 focus:bg-white focus:outline-none"
            required
          />
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center rounded-xl bg-green-500 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? 'Guardando...' : 'Guardar cambios'}
          </button>

          <button
            type="button"
            onClick={handleDelete}
            disabled={loading}
            className="inline-flex w-full items-center justify-center rounded-xl bg-red-500 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? 'Eliminando...' : 'Eliminar categoría'}
          </button>
        </div>
      </form>
    </div>
  )
}
