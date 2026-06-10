'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

type FieldProps = {
  label: string
  id: string
  type: string
  placeholder: string
  value: string
  onChange: (value: string) => void
}

function Field({ label, id, type, placeholder, value, onChange }: FieldProps) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-xs font-semibold tracking-widest text-gray-500">
        {label}
      </label>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        required
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-transparent bg-gray-100 px-4 py-3 text-gray-900 placeholder-gray-400 transition-all focus:border-green-500 focus:bg-white focus:outline-none"
      />
    </div>
  )
}

export function RegisterForm() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [storeName, setStoreName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      if (!acceptedTerms) {
        setError('Debes aceptar los Términos y Condiciones para crear tu tienda.')
        setLoading(false)
        return
      }

      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, storeName, email, password, acceptedTerms }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Error al crear la cuenta.')
      } else {
        router.push('/login')
      }
    } catch {
      setError('Ocurrió un error inesperado.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md">
      <button
        onClick={() => router.push('/')}
        className="cursor-pointer mb-8 flex items-center gap-2 text-sm text-gray-500 transition-colors hover:text-gray-800"
      >
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
          <path d="M19 12H5M5 12l7 7M5 12l7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Volver al inicio
      </button>

      <h2 className="mb-1 text-3xl font-bold text-gray-900">Crea tu tienda</h2>
      <p className="mb-8 text-gray-500">Configura tu catálogo digital en 2 minutos.</p>

      {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="TU NOMBRE" id="name" type="text" placeholder="María González" value={name} onChange={setName} />
        <Field
          label="NOMBRE DE TU TIENDA"
          id="storeName"
          type="text"
          placeholder="Boutique María"
          value={storeName}
          onChange={setStoreName}
        />
        <Field
          label="CORREO ELECTRÓNICO"
          id="email"
          type="email"
          placeholder="tucorreo@ejemplo.com"
          value={email}
          onChange={setEmail}
        />
        <Field
          label="CONTRASEÑA"
          id="password"
          type="password"
          placeholder="Mínimo 6 caracteres"
          value={password}
          onChange={setPassword}
        />

        <div className="flex items-start gap-3 rounded-3xl border border-gray-200 bg-white px-4 py-4">
          <input
            id="acceptedTerms"
            name="acceptedTerms"
            type="checkbox"
            checked={acceptedTerms}
            onChange={(e) => setAcceptedTerms(e.target.checked)}
            className="mt-1 h-4 w-4 shrink-0 rounded border-gray-300 text-green-600 focus:ring-green-500"
          />
          <label htmlFor="acceptedTerms" className="text-sm leading-6 text-gray-700">
            Declaro que leí y acepto los{' '}
            <Link href="/legal/terminos" className="font-semibold text-green-600 underline hover:text-green-700">
              Términos y Condiciones de WALO
            </Link>{' '}
            y su Política de Uso Aceptable.
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="cursor-pointer mt-2 w-full rounded-xl bg-green-500 px-4 py-3 font-semibold text-white transition-all hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Creando tu tienda...' : 'Crear mi tienda gratis'}
        </button>
      </form>

      <p className="mt-4 text-center text-xs text-gray-400">
        Al registrarte aceptas nuestros Términos y Condiciones de uso de WALO.
      </p>
    </div>
  )
}
