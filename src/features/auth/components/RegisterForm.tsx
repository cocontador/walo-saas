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

function toSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 30)
}

export function RegisterForm() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [storeName, setStoreName] = useState('')
  const [slug, setSlug] = useState('')
  const [slugTouched, setSlugTouched] = useState(false)
  const [whatsappDigits, setWhatsappDigits] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleStoreNameChange = (value: string) => {
    setStoreName(value)
    if (!slugTouched) {
      setSlug(toSlug(value))
    }
  }

  const handleSlugChange = (value: string) => {
    setSlugTouched(true)
    setSlug(value.toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 30))
  }

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
        body: JSON.stringify({ name, storeName, slug, whatsappPhone: `+569${whatsappDigits}`, email, password, acceptedTerms }),
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
          onChange={handleStoreNameChange}
        />

        <div>
          <label htmlFor="slug" className="mb-1 block text-xs font-semibold tracking-widest text-gray-500">
            URL DE TU TIENDA
          </label>
          <input
            id="slug"
            type="text"
            placeholder="boutique-maria"
            value={slug}
            required
            onChange={(e) => handleSlugChange(e.target.value)}
            className="w-full rounded-xl border border-transparent bg-gray-100 px-4 py-3 text-gray-900 placeholder-gray-400 transition-all focus:border-green-500 focus:bg-white focus:outline-none"
          />
          {slug && (
            <p className="mt-1.5 flex items-center gap-1.5 text-xs text-gray-400">
              <svg className="h-3 w-3 shrink-0 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              Tu tienda estará en:{' '}
              <span className="font-medium text-gray-600">
                walo.app/<span className="text-green-600">{slug}</span>
              </span>
            </p>
          )}
        </div>

        <div>
          <label htmlFor="whatsappDigits" className="mb-1 block text-xs font-semibold tracking-widest text-gray-500">
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
            <span className="border-l border-gray-300 self-stretch" />
            <input
              id="whatsappDigits"
              type="tel"
              inputMode="numeric"
              placeholder="1234 5678"
              value={whatsappDigits.length > 4 ? `${whatsappDigits.slice(0, 4)} ${whatsappDigits.slice(4)}` : whatsappDigits}
              required
              onChange={(e) => {
                const digits = e.target.value.replace(/\D/g, '').slice(0, 8)
                setWhatsappDigits(digits)
              }}
              className="min-w-0 flex-1 bg-transparent py-3 pl-3 pr-4 text-gray-900 placeholder-gray-400 focus:outline-none"
            />
          </div>
          <p className="mt-1.5 text-xs text-gray-400">Tus clientes te enviarán pedidos a este número.</p>
        </div>

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
