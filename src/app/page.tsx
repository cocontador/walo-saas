import Link from 'next/link'

export default function LandingPage() {
  return (
    <div
      className="min-h-screen bg-[#f8f9fa] text-[#191c1d]"
      style={{ fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}
    >
      <nav className="fixed top-0 z-50 w-full border-b border-[rgba(0,0,0,0.06)] bg-[rgba(248,249,250,0.85)] backdrop-blur-[20px]">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 md:px-12">
          <span className="text-xl font-bold tracking-[-0.04em] text-[#191c1d]">WALO</span>

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

      <main>
        <section className="mx-auto grid max-w-7xl items-center gap-16 px-6 pb-24 pt-36 lg:grid-cols-2">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(0,0,0,0.06)] bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#22C55E] shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#22C55E] opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#22C55E]" />
              </span>
              Edición 2026 · Ya disponible
            </div>

            <h1 className="text-5xl font-bold leading-[1.08] tracking-[-0.02em] text-[#191c1d] lg:text-[4.5rem]">
              Tu catálogo digital, <span className="text-[#22C55E]">listo en minutos</span>
            </h1>

            <p className="max-w-xl text-lg leading-relaxed text-[#6b7280]">
              Empodera tu microemprendimiento con una vitrina profesional que tus clientes
              amarán. Pedidos directo por WhatsApp, sin intermediarios.
            </p>

            <div className="flex flex-col gap-4 sm:flex-row">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-br from-[#16A34A] to-[#22C55E] px-8 py-3.5 text-lg font-bold text-white shadow-[0_4px_15px_rgba(34,197,94,0.25)] transition-all hover:-translate-y-px hover:shadow-[0_8px_25px_rgba(34,197,94,0.35)]"
              >
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-white/20 text-sm">
                  +
                </span>
                Crear mi tienda
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-[rgba(0,0,0,0.06)] bg-white px-8 py-3.5 text-lg font-semibold text-[#191c1d] transition-colors hover:bg-[#f3f4f5]"
              >
                Ya tengo cuenta
              </Link>
            </div>

            <div className="flex items-center gap-4 pt-4">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <img
                    key={i}
                    className="h-10 w-10 rounded-full border-2 border-white object-cover"
                    src={`https://picsum.photos/seed/user${i}/80/80`}
                    alt={`Usuario ${i}`}
                    referrerPolicy="no-referrer"
                  />
                ))}
              </div>
              <p className="text-sm font-medium text-[#6b7280]">
                <strong className="text-[#191c1d]">+2,000</strong> emprendedores ya confían en
                WALO
              </p>
            </div>
          </div>

          <div className="relative hidden lg:block">
            <div className="rounded-[2.5rem] border border-[rgba(0,0,0,0.04)] bg-white p-4 shadow-2xl shadow-black/5">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAbkj9BxokDECKjA2dJUSbFXwMRUA_THoGLpP4KlfsCVAJMdQ0l6LB80o0wkW6-ZVsJdXMKuIIkwt-bAF69y04EUgqa-hkL3vGC7WJTZ06GTASmuLb8rg6GAlle-3sXzkJEmBtQExdljaYbfwU_AooFw8w4Rqm8KefXgP5oKZbwYP604t_QaFa8uTNpCXjGZETySyC41OdQbyumsHtauIiptu2G3uWRYEh-bTArxef2A-A0kLwdQHmeM7l4DoOmAkLYV0l8vBk9z4I"
                alt="Demo de tienda WALO"
                className="aspect-[4/5] w-full rounded-[2rem] object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="absolute -bottom-6 -left-8 max-w-[180px] rounded-2xl border border-[rgba(0,0,0,0.04)] bg-white p-5 shadow-xl">
              <div className="mb-1.5 flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#BBF7D0]">
                  <span className="text-[13px] text-[#16A34A]">↗</span>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#6b7280]">
                  Ventas
                </span>
              </div>
              <div className="text-2xl font-bold text-[#22C55E]">+124%</div>
              <div className="mt-0.5 text-[10px] text-[#9ca3af]">este mes</div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-24">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold tracking-tight text-[#191c1d]">
              Todo lo que necesitas para vender más
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-[#6b7280]">
              Herramientas simples y poderosas diseñadas para emprendedores como tú.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="rounded-[2rem] bg-[#f3f4f5] p-10 md:col-span-2">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-[#22C55E] text-white">
                <span className="text-xl">✆</span>
              </div>
              <h3 className="mb-3 text-2xl font-bold text-[#191c1d]">
                Ventas por WhatsApp integradas
              </h3>
              <p className="leading-relaxed text-[#6b7280]">
                Tus clientes seleccionan productos y el pedido llega directo a tu chat. Sin
                fricción, más conversiones.
              </p>
              <div className="mt-8 inline-flex items-center gap-4 rounded-2xl border border-[rgba(0,0,0,0.04)] bg-white p-5 shadow-sm">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#22C55E] text-white">
                  <span className="text-base">✆</span>
                </div>
                <div>
                  <div className="text-sm font-bold text-[#191c1d]">¡Nuevo pedido!</div>
                  <div className="text-xs text-[#6b7280]">&quot;Hola, quiero el Reloj Core...&quot;</div>
                </div>
              </div>
            </div>

            <div className="flex flex-col rounded-[2rem] bg-[#BBF7D0] p-10">
              <span className="mb-6 text-4xl text-[#16A34A]">⚡</span>
              <h3 className="mb-2 text-xl font-bold text-[#191c1d]">Velocidad Extrema</h3>
              <p className="text-sm leading-relaxed text-[#374151]">
                Carga instantánea incluso en conexiones lentas. No pierdas ni un cliente.
              </p>
            </div>

            <div className="flex flex-col rounded-[2rem] border border-[rgba(0,0,0,0.06)] bg-white p-10 shadow-sm">
              <span className="mb-6 text-4xl text-[#6b7280]">✦</span>
              <h3 className="mb-2 text-xl font-bold text-[#191c1d]">Diseño Premium</h3>
              <p className="text-sm leading-relaxed text-[#6b7280]">
                Personaliza colores y tu nombre de tienda para que tu marca brille.
              </p>
            </div>

            <div className="flex flex-col items-center gap-10 rounded-[2rem] bg-[#191c1d] p-10 text-white md:col-span-2 md:flex-row">
              <div className="flex-1">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-[#22C55E]/20 text-[#22C55E]">
                  <span className="text-xl">▥</span>
                </div>
                <h3 className="mb-3 text-2xl font-bold">Analíticas en tiempo real</h3>
                <p className="leading-relaxed text-white/60">
                  Conoce qué productos son los más vistos y optimiza tu catálogo para vender más.
                </p>
              </div>
              <div className="relative h-28 w-full flex-1 overflow-hidden rounded-xl bg-white/5">
                <div className="absolute inset-x-4 bottom-0 flex h-full items-end gap-2 pt-4">
                  {[30, 50, 75, 60, 90, 70, 95].map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-t-sm"
                      style={{
                        height: `${h}%`,
                        background: `rgba(34, 197, 94, ${0.3 + i * 0.1})`,
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 pb-24 text-center">
          <div className="rounded-[3rem] bg-[#f3f4f5] px-6 py-20">
            <h2 className="mb-6 text-4xl font-bold tracking-tight text-[#191c1d] md:text-5xl">
              ¿Listo para transformar tu negocio?
            </h2>
            <p className="mx-auto mb-10 max-w-2xl text-lg text-[#6b7280]">
              Únete a miles de emprendedores que ya están digitalizando sus ventas con WALO.
            </p>
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-br from-[#16A34A] to-[#22C55E] px-8 py-3.5 text-xl font-bold text-white shadow-[0_4px_15px_rgba(34,197,94,0.25)] transition-all hover:-translate-y-px hover:shadow-[0_8px_25px_rgba(34,197,94,0.35)]"
            >
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-white/20 text-sm">
                +
              </span>
              Crear mi catálogo gratis
            </Link>
            <p className="mt-6 text-sm text-[#9ca3af]">
              No requiere tarjeta de crédito · Configuración en 2 minutos
            </p>
          </div>
        </section>
      </main>
    </div>
  )
}
