'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
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

export function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      })

      if (result?.error) {
        setError('Credenciales inválidas. Inténtalo de nuevo.')
      } else {
        router.push('/dashboard')
        router.refresh()
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
        className="mb-8 flex items-center gap-2 text-sm text-gray-500 transition-colors hover:text-gray-800"
      >
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
          <path d="M19 12H5M5 12l7 7M5 12l7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Volver al inicio
      </button>

      <h2 className="mb-1 text-3xl font-bold text-gray-900">Bienvenido de vuelta</h2>
      <p className="mb-8 text-gray-500">Ingresa a tu cuenta para continuar.</p>

      {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
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
          placeholder="••••••••"
          value={password}
          onChange={setPassword}
        />
        <button
          type="submit"
          disabled={loading}
          className="mt-2 w-full rounded-xl bg-gray-900 px-4 py-3 font-semibold text-white transition-all hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Verificando...' : 'Iniciar sesión'}
        </button>
      </form>
    </div>
  )
}
