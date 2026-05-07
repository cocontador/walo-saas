'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createProduct } from '@/features/product/actions'

type FieldProps = {
  label: string
  id: string
  type: string
  placeholder: string
  value: string
  onChange: (value: string) => void
  error?: string
  required?: boolean
}

function Field({
  label,
  id,
  type,
  placeholder,
  value,
  onChange,
  error,
  required = true,
}: FieldProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1 block text-xs font-semibold tracking-widest text-gray-500"
      >
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full rounded-xl border px-4 py-3 text-gray-900 placeholder-gray-400 transition-all focus:outline-none ${
          error
            ? 'border-red-300 bg-red-50 focus:border-red-500 focus:bg-white'
            : 'border-transparent bg-gray-100 focus:border-green-500 focus:bg-white'
        }`}
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}

type TextAreaProps = {
  label: string
  id: string
  placeholder: string
  value: string
  onChange: (value: string) => void
  error?: string
  required?: boolean
}

function TextArea({
  label,
  id,
  placeholder,
  value,
  onChange,
  error,
  required = false,
}: TextAreaProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1 block text-xs font-semibold tracking-widest text-gray-500"
      >
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      <textarea
        id={id}
        placeholder={placeholder}
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        rows={4}
        className={`w-full resize-none rounded-xl border px-4 py-3 text-gray-900 placeholder-gray-400 transition-all focus:outline-none ${
          error
            ? 'border-red-300 bg-red-50 focus:border-red-500 focus:bg-white'
            : 'border-transparent bg-gray-100 focus:border-green-500 focus:bg-white'
        }`}
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}

export function ProductForm() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({})

  const validateForm = () => {
    const errors: Record<string, string> = {}

    if (!name.trim()) {
      errors.name = 'El nombre es requerido'
    }

    if (!price.trim()) {
      errors.price = 'El precio es requerido'
    } else if (isNaN(Number(price)) || Number(price) <= 0) {
      errors.price = 'El precio debe ser un número válido mayor a 0'
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      const result = await createProduct({
        name: name.trim(),
        price: Math.round(Number(price)),
        description: description.trim() || null,
      })

      if (!result.success) {
        setError(result.error)
        setLoading(false)
        return
      }

      setSuccess(true)
      setName('')
      setPrice('')
      setDescription('')

      // Muestra el mensaje de éxito durante 2 segundos y luego redirige.
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocurrió un error inesperado')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-2xl">
      <button
        onClick={() => router.push('/dashboard')}
        className="mb-8 flex items-center gap-2 text-sm text-gray-500 transition-colors hover:text-gray-800"
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
        Volver al dashboard
      </button>

      <h2 className="mb-1 text-3xl font-bold text-gray-900">Crear producto</h2>
      <p className="mb-8 text-gray-500">Agrega un nuevo producto a tu catálogo</p>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
          ✓ Producto creado exitosamente.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Field
          label="NOMBRE DEL PRODUCTO"
          id="name"
          type="text"
          placeholder="Ej: Camiseta azul"
          value={name}
          onChange={setName}
          error={validationErrors.name}
        />

        <Field
          label="PRECIO (en pesos)"
          id="price"
          type="number"
          placeholder="Ej: 50000"
          value={price}
          onChange={setPrice}
          error={validationErrors.price}
          required
        />

        <TextArea
          label="DESCRIPCIÓN"
          id="description"
          placeholder="Describe el producto..."
          value={description}
          onChange={setDescription}
          required={false}
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-green-500 px-6 py-3 font-semibold text-white transition-all hover:bg-green-600 disabled:bg-gray-400"
        >
          {loading ? 'Guardando...' : 'Crear producto'}
        </button>
      </form>
    </div>
  )
}
