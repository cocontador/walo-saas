export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col justify-center gap-8 px-6 py-20">
      <div className="inline-flex w-fit rounded-full border border-neutral-300 bg-white px-4 py-2 text-sm text-neutral-600">
        Sprint 1 · Base técnica
      </div>

      <section className="space-y-4">
        <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-neutral-950 sm:text-5xl">
          WALO SaaS
        </h1>
        <p className="max-w-2xl text-lg leading-8 text-neutral-600">
          Proyecto base del MVP multitenant para catálogos digitales con foco
          en conversión, SEO y cierre de ventas por WhatsApp.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <article className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-neutral-950">
            Estado actual
          </h2>
          <p className="mt-2 text-sm leading-6 text-neutral-600">
            La aplicación ya está lista para conectar base de datos, Prisma y
            autenticación.
          </p>
        </article>

        <article className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-neutral-950">
            Próximo paso
          </h2>
          <p className="mt-2 text-sm leading-6 text-neutral-600">
            Levantar PostgreSQL local con Docker y crear la primera migración
            del modelo multitenant.
          </p>
        </article>

        <article className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-neutral-950">
            Convención
          </h2>
          <p className="mt-2 text-sm leading-6 text-neutral-600">
            Variables en inglés, interfaz en español y código sin punto y coma.
          </p>
        </article>
      </section>
    </main>
  )
}
