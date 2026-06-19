import Link from 'next/link'
import { Check, X, Zap, Globe, BarChart3 } from 'lucide-react'
import { getAvailablePlans } from '@/features/billing/actions/getAvailablePlans'
import { normalizePlanForCatalog } from '@/features/billing/utils/limits'

export const metadata = {
  title: 'Precios — WALO',
  description: 'Planes simples y transparentes para tu tienda online. Empieza gratis y crece a tu ritmo.',
}

const WHY_WALO = [
  {
    icon: Zap,
    title: 'Lista en minutos',
    description: 'Sin código ni conocimientos técnicos. Crea tu vitrina, agrega productos y empieza a vender el mismo día.',
  },
  {
    icon: Globe,
    title: 'SEO incluido desde el día 1',
    description: 'Cada tienda es renderizada en el servidor. Google indexa tu catálogo automáticamente sin configuración extra.',
  },
  {
    icon: BarChart3,
    title: 'Pagos chilenos integrados',
    description: 'Khipu y otros métodos locales disponibles para que tus clientes paguen como prefieran.',
  },
]

const FAQ = [
  {
    q: '¿Puedo cambiar de plan en cualquier momento?',
    a: 'Sí. Puedes subir o bajar de plan cuando quieras desde el panel de tu tienda. Los cambios se aplican de inmediato.',
  },
  {
    q: '¿Necesito tarjeta de crédito para empezar?',
    a: 'No. El plan Inicial es completamente gratuito y no requiere datos de pago. Solo creas tu cuenta y listo.',
  },
  {
    q: '¿Qué pasa si llego al límite de productos?',
    a: 'Tu tienda sigue activa y tus productos visibles. Solo se bloquea agregar nuevos hasta que subas de plan.',
  },
  {
    q: '¿Cómo funciona el dominio personalizado?',
    a: 'En los planes Pro y Business puedes conectar tu propio dominio .cl o .com configurando un registro CNAME o A Record apuntando a WALO. Te guiamos en el proceso.',
  },
]

export default async function PricingPage() {
  const rawPlans = await getAvailablePlans()
  const plans = rawPlans.map((plan) => normalizePlanForCatalog(plan, 'none'))

  return (
    <div
      className="bg-[#f8f9fa] text-[#191c1d]"
      style={{ fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}
    >
      {/* Navbar */}
      <nav className="fixed top-0 z-50 w-full border-b border-[rgba(0,0,0,0.06)] bg-[rgba(248,249,250,0.85)] backdrop-blur-[20px]">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 md:px-12">
          <Link href="/" className="text-xl font-bold tracking-[-0.04em] text-[#191c1d]">
            WALO
          </Link>
          <div className="hidden items-center gap-8 md:flex">
            <Link href="/" className="text-sm font-medium text-[#6b7280] hover:text-[#191c1d]">Inicio</Link>
            <Link href="/pricing" className="text-sm font-semibold text-[#191c1d]">Precios</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-semibold text-[#6b7280] transition-colors hover:text-[#191c1d]"
            >
              Iniciar sesión
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center justify-center rounded-full bg-gradient-to-br from-[#16A34A] to-[#22C55E] px-5 py-2.5 text-sm font-bold text-white shadow-[0_4px_15px_rgba(34,197,94,0.25)] transition-all hover:-translate-y-px hover:shadow-[0_8px_25px_rgba(34,197,94,0.35)]"
            >
              Empezar gratis
            </Link>
          </div>
        </div>
      </nav>

      <main className="pt-16">
        {/* Hero */}
        <section className="mx-auto max-w-3xl px-6 pb-16 pt-20 text-center">
          <h1 className="text-4xl font-bold tracking-[-0.03em] text-[#191c1d] md:text-5xl">
            El plan perfecto para{' '}
            <span className="bg-gradient-to-r from-[#16A34A] to-[#22C55E] bg-clip-text text-transparent">
              tu negocio
            </span>
          </h1>
          <p className="mt-4 text-lg text-[#6b7280]">
            Precios simples y transparentes. Sin sorpresas ni costos ocultos.
            Empieza gratis y escala cuando estés listo.
          </p>
        </section>

        {/* Cards de planes */}
        <section className="mx-auto max-w-6xl px-6 pb-24">
          <div className="grid gap-6 lg:grid-cols-3">
            {plans.map((plan) => (
              <div
                key={plan.slug}
                className={`relative flex flex-col rounded-2xl border bg-white p-8 shadow-sm ${
                  plan.isPopular
                    ? 'border-[#22C55E] shadow-[0_0_0_1px_#22C55E,0_8px_30px_rgba(34,197,94,0.12)]'
                    : 'border-[rgba(0,0,0,0.08)]'
                }`}
              >
                {plan.isPopular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center rounded-full bg-gradient-to-r from-[#16A34A] to-[#22C55E] px-4 py-1 text-xs font-bold text-white shadow-sm">
                      Más popular
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <h2 className="text-lg font-bold text-[#191c1d]">{plan.name}</h2>
                  <p className="mt-1 text-sm text-[#6b7280]">{plan.description}</p>
                </div>

                <div className="mb-6">
                  <div className="flex items-end gap-1">
                    <span className="text-4xl font-bold tracking-[-0.03em] text-[#191c1d]">
                      {plan.price}
                    </span>
                    {plan.priceDetail && (
                      <span className="mb-1 text-sm text-[#6b7280]">{plan.priceDetail}</span>
                    )}
                  </div>
                </div>

                <Link
                  href={plan.slug === 'business' ? 'mailto:hola@walo.cl' : '/register'}
                  className={`mb-8 flex w-full items-center justify-center rounded-full py-2.5 text-sm font-bold transition-all ${
                    plan.isPopular
                      ? 'bg-gradient-to-br from-[#16A34A] to-[#22C55E] text-white shadow-[0_4px_15px_rgba(34,197,94,0.25)] hover:-translate-y-px hover:shadow-[0_8px_25px_rgba(34,197,94,0.35)]'
                      : 'border border-[rgba(0,0,0,0.12)] bg-white text-[#191c1d] hover:bg-[#f3f4f6]'
                  }`}
                >
                  {plan.ctaLabel}
                </Link>

                <ul className="flex-1 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm text-[#374151]">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#22C55E]" />
                      {feature}
                    </li>
                  ))}
                  {plan.limitations.map((limitation) => (
                    <li key={limitation} className="flex items-start gap-3 text-sm text-[#9ca3af]">
                      <X className="mt-0.5 h-4 w-4 shrink-0 text-[#d1d5db]" />
                      {limitation}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Por qué WALO */}
        <section className="border-t border-[rgba(0,0,0,0.06)] bg-white py-24">
          <div className="mx-auto max-w-5xl px-6">
            <h2 className="text-center text-3xl font-bold tracking-[-0.03em] text-[#191c1d]">
              ¿Por qué elegir WALO?
            </h2>
            <div className="mt-12 grid gap-8 md:grid-cols-3">
              {WHY_WALO.map((item) => {
                const Icon = item.icon
                return (
                  <div key={item.title} className="text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#f0fdf4]">
                      <Icon className="h-6 w-6 text-[#16A34A]" />
                    </div>
                    <h3 className="font-bold text-[#191c1d]">{item.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-[#6b7280]">{item.description}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="mx-auto max-w-3xl px-6 py-24">
          <h2 className="text-center text-3xl font-bold tracking-[-0.03em] text-[#191c1d]">
            Preguntas frecuentes
          </h2>
          <div className="mt-10 divide-y divide-[rgba(0,0,0,0.06)]">
            {FAQ.map((item) => (
              <div key={item.q} className="py-6">
                <h3 className="font-semibold text-[#191c1d]">{item.q}</h3>
                <p className="mt-2 text-sm leading-6 text-[#6b7280]">{item.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA final */}
        <section className="border-t border-[rgba(0,0,0,0.06)] bg-white py-20 text-center">
          <h2 className="text-3xl font-bold tracking-[-0.03em] text-[#191c1d]">
            Empieza hoy, sin tarjeta
          </h2>
          <p className="mt-3 text-[#6b7280]">Tu tienda online en minutos. Gratis para siempre en el plan Inicial.</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/register"
              className="inline-flex items-center justify-center rounded-full bg-gradient-to-br from-[#16A34A] to-[#22C55E] px-8 py-3 text-sm font-bold text-white shadow-[0_4px_15px_rgba(34,197,94,0.25)] transition-all hover:-translate-y-px hover:shadow-[0_8px_25px_rgba(34,197,94,0.35)]"
            >
              Crear mi tienda gratis
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-full border border-[rgba(0,0,0,0.12)] bg-white px-8 py-3 text-sm font-bold text-[#191c1d] transition hover:bg-[#f3f4f6]"
            >
              Ya tengo cuenta
            </Link>
          </div>
        </section>
      </main>

    </div>
  )
}
