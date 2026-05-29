'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createCategory } from '@/features/category/actions'

export function CategoryForm() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!name.trim()) {
      setError('El nombre es requerido')
      return
    }

    setLoading(true)

    try {
      const result = await createCategory({ name: name.trim() })

      if (!result.success) {
        setError(result.error)
        return
      }

      setSuccess('Categoría creada exitosamente.')
      setName('')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocurrió un error inesperado')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
      <h2 className="mb-4 text-2xl font-bold text-gray-900">Crear categoría</h2>
      <p className="mb-6 text-sm text-gray-500">
        Agrega una categoría visible para tus productos.
      </p>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
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

        <button
          type="submit"
          disabled={loading}
          className="inline-flex w-full items-center justify-center rounded-xl bg-green-500 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? 'Guardando...' : 'Crear categoría'}
        </button>
      </form>
    </div>
  )
}
