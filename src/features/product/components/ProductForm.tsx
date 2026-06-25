'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  createProduct,
  updateProduct,
  uploadProductImage,
  replaceProductImage,
  removeProductImage,
} from '@/features/product/actions'
import { CreateProductInput, UpdateProductInput } from '@/features/product/schemas'

type FormMode = 'create' | 'edit'

type CategoryOption = {
  id: string
  name: string
}

type ProductFormProps = {
  mode?: FormMode
  initialValues?: {
    name: string
    price: number
    description: string | null
    categoryIds?: string[]
  }
  initialImageUrl?: string | null
  categories?: CategoryOption[]
  productId?: string
}

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
      <label htmlFor={id} className="mb-1 block text-xs font-semibold tracking-widest text-gray-500">
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
      <label htmlFor={id} className="mb-1 block text-xs font-semibold tracking-widest text-gray-500">
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
        className={`w-full rounded-xl border px-4 py-3 text-gray-900 placeholder-gray-400 transition-all focus:outline-none resize-none ${
          error
            ? 'border-red-300 bg-red-50 focus:border-red-500 focus:bg-white'
            : 'border-transparent bg-gray-100 focus:border-green-500 focus:bg-white'
        }`}
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}

export function ProductForm({ mode = 'create', initialValues, initialImageUrl, categories, productId }: ProductFormProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [name, setName] = useState(initialValues?.name ?? '')
  const [price, setPrice] = useState(String(initialValues?.price ?? ''))
  const [description, setDescription] = useState(initialValues?.description ?? '')
  const [imageUrl, setImageUrl] = useState(initialImageUrl ?? null)
  const [categoryIds, setCategoryIds] = useState<string[]>(initialValues?.categoryIds ?? [])
  const [loading, setLoading] = useState(false)
  const [imageLoading, setImageLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [imageError, setImageError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [imageSuccess, setImageSuccess] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  const toggleCategory = (id: string) => {
    setCategoryIds(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    )
  }

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
      let result

      if (mode === 'edit' && productId) {
        const formData: UpdateProductInput = {
          name: name.trim(),
          price: Math.round(Number(price)),
          description: description.trim() || null,
          categoryIds,
        }
        result = await updateProduct(productId, formData)
      } else {
        const formData: CreateProductInput = {
          name: name.trim(),
          price: Math.round(Number(price)),
          description: description.trim() || null,
          ...(categoryIds.length > 0 && { categoryIds }),
        }
        result = await createProduct(formData)
      }

      if (!result.success) {
        setError(result.error)
        setLoading(false)
        return
      }

      setSuccess(true)

      if (mode === 'create') {
        setName('')
        setPrice('')
        setDescription('')
        setCategoryIds([])
      }

      setTimeout(() => {
        router.push('/dashboard/products')
        router.refresh()
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocurrió un error inesperado')
    } finally {
      setLoading(false)
    }
  }

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]

    if (!selectedFile || !isEditMode || !productId) {
      return
    }

    setImageError(null)
    setImageSuccess(null)
    setImageLoading(true)

    try {
      const result = imageUrl
        ? await replaceProductImage(productId, selectedFile)
        : await uploadProductImage(productId, selectedFile)

      if (!result.ok) {
        setImageError(result.error ?? 'No se pudo guardar la imagen.')
        return
      }

      setImageUrl(`${result.imageUrl}?t=${Date.now()}`)
      setImageSuccess(imageUrl ? 'Imagen reemplazada correctamente.' : 'Imagen subida correctamente.')
    } catch (err) {
      setImageError(err instanceof Error ? err.message : 'No se pudo procesar la imagen.')
    } finally {
      setImageLoading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleRemoveImage = async () => {
    if (!isEditMode || !productId) {
      return
    }

    setImageError(null)
    setImageSuccess(null)
    setImageLoading(true)

    try {
      const result = await removeProductImage(productId)

      if (!result.ok) {
        setImageError(result.error ?? 'No se pudo eliminar la imagen.')
        return
      }

      setImageUrl(null)
      setImageSuccess('Imagen eliminada correctamente.')
    } catch (err) {
      setImageError(err instanceof Error ? err.message : 'No se pudo eliminar la imagen.')
    } finally {
      setImageLoading(false)
    }
  }

  const isEditMode = mode === 'edit'
  const pageTitle = isEditMode ? 'Editar producto' : 'Crear producto'
  const pageDescription = isEditMode ? 'Actualiza los detalles del producto' : 'Agrega un nuevo producto a tu catálogo'
  const submitButtonText = isEditMode
    ? loading ? 'Guardando...' : 'Guardar cambios'
    : loading ? 'Guardando...' : 'Crear producto'
  const successMessage = isEditMode ? '✓ Producto actualizado exitosamente.' : '✓ Producto creado exitosamente.'

  return (
    <div className="w-full max-w-2xl">
      <button
        onClick={() => router.push('/dashboard/products')}
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
        Volver a productos
      </button>

      <h2 className="mb-1 text-3xl font-bold text-gray-900">{pageTitle}</h2>
      <p className="mb-8 text-gray-500">{pageDescription}</p>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
          {successMessage}
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

        {isEditMode ? (
          <div data-tour="product-image-section" className="rounded-2xl border border-gray-200 bg-white p-4">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Imagen del producto
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  Sube una imagen de hasta 2MB en formato PNG, JPEG o WEBP.
                </p>
              </div>
              <div className="text-xs text-gray-400">Opcional</div>
            </div>

            {imageUrl ? (
              <div className="space-y-4">
                <img
                  src={imageUrl}
                  alt={name || 'Imagen del producto'}
                  className="h-72 w-full rounded-2xl object-cover"
                />

                <div className="flex flex-wrap gap-2">
                  <label className="inline-flex cursor-pointer items-center rounded-xl bg-green-500 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-60">
                    {imageLoading ? 'Procesando...' : 'Reemplazar imagen'}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={handleImageChange}
                      disabled={imageLoading}
                      className="hidden"
                    />
                  </label>

                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    disabled={imageLoading}
                    className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition-all hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Eliminar imagen
                  </button>
                </div>
              </div>
            ) : (
              <label className="inline-flex cursor-pointer items-center rounded-xl bg-green-500 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-60">
                {imageLoading ? 'Cargando...' : 'Subir imagen'}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleImageChange}
                  disabled={imageLoading}
                  className="hidden"
                />
              </label>
            )}

            {imageError && (
              <p className="mt-3 text-sm text-red-600">{imageError}</p>
            )}

            {imageSuccess && (
              <p className="mt-3 text-sm text-green-700">{imageSuccess}</p>
            )}
          </div>
        ) : (
          <div data-tour="product-image-section" className="rounded-2xl border border-gray-200 bg-white p-4 text-sm text-gray-500">
            Guarda el producto para agregar una imagen.
          </div>
        )}

        {categories && categories.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-semibold tracking-widest text-gray-500">
              CATEGORÍAS
            </p>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => {
                const checked = categoryIds.includes(category.id)
                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => toggleCategory(category.id)}
                    className={`cursor-pointer rounded-full border px-4 py-1.5 text-sm font-medium transition-all ${
                      checked
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-200 bg-gray-100 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    {checked && <span className="mr-1">✓</span>}
                    {category.name}
                  </button>
                )
              })}
            </div>
            {categoryIds.length === 0 && (
              <p className="mt-1 text-xs text-gray-400">Sin categorías asignadas</p>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="cursor-pointer w-full rounded-xl bg-green-500 px-6 py-3 font-semibold text-white transition-all hover:bg-green-600 disabled:cursor-not-allowed disabled:bg-gray-400"
        >
          {submitButtonText}
        </button>
      </form>
    </div>
  )
}
