import Link from 'next/link'

export const metadata = {
  title: 'Términos y Condiciones | WALO',
  description:
    'Términos y condiciones de uso aceptable para WALO. Contenido en español chileno orientado a emprendedores y tiendas digitales.',
}

export default function LegalTerminosPage() {
  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      <nav className="fixed top-0 z-50 w-full border-b border-[rgba(0,0,0,0.06)] bg-[rgba(248,249,250,0.85)] backdrop-blur-[20px]">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 md:px-12">
          <Link href="/" className="text-xl font-bold tracking-[-0.04em] text-[#191c1d]">
            WALO
          </Link>
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

      <div className="pt-24 pb-16 px-4">
      <main className="mx-auto max-w-5xl space-y-10 rounded-[2rem] bg-white px-6 py-10 shadow-[0_20px_80px_rgba(15,23,42,0.08)] ring-1 ring-black/5 sm:px-10 sm:py-12">
        <header className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-green-600">Términos y Condiciones de Uso de WALO</p>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Términos y Condiciones de Uso de WALO
          </h1>
          <div className="max-w-3xl space-y-4 text-base leading-7 text-gray-600">
            <p>
              Estos términos regulan el uso de WALO, una plataforma SaaS para que emprendedores, negocios y microempresas creen y administren tiendas o catálogos digitales. Al crear una tienda, el usuario declara conocer y aceptar estas condiciones, incluyendo la Política de Uso Aceptable de la plataforma.
            </p>
            <p>
              WALO entrega herramientas tecnológicas para publicar productos o servicios lícitos, compartir catálogos digitales y facilitar la comunicación con clientes. Sin embargo, cada emprendedor es responsable de la información que publica, de sus ventas, obligaciones tributarias, cumplimiento normativo, atención al cliente, despacho, garantías y postventa.
            </p>
          </div>
          <p className="text-sm text-gray-400">Última actualización: Junio 2026</p>
        </header>

        <section className="space-y-8">
          <article className="rounded-[1.5rem] border border-gray-200 bg-gray-50 p-6 sm:p-8">
            <h2 className="mb-4 text-2xl font-semibold text-gray-900">Introducción</h2>
            <p className="text-gray-700 leading-7">
              WALO es una plataforma SaaS que permite a emprendedores, negocios y microempresas crear y administrar tiendas o catálogos digitales, publicar productos o servicios lícitos y compartir enlaces públicos para facilitar la comunicación con sus clientes.
            </p>
          </article>

          <article className="rounded-[1.5rem] border border-gray-200 bg-white p-6 sm:p-8">
            <h2 className="mb-4 text-2xl font-semibold text-gray-900">Aceptación de términos</h2>
            <p className="text-gray-700 leading-7">
              Al crear una tienda en WALO, el usuario declara que leyó y acepta estos términos. La aceptación se registra internamente con fecha y hora para fines de trazabilidad, cumplimiento y control de uso de la plataforma.
            </p>
            <p className="mt-4 text-gray-700 leading-7">
              El usuario declara tener capacidad para usar la plataforma y administrar una tienda dentro del marco chileno de comercio electrónico y comercio digital.
            </p>
          </article>

          <article className="rounded-[1.5rem] border border-gray-200 bg-gray-50 p-6 sm:p-8">
            <h2 className="mb-4 text-2xl font-semibold text-gray-900">Uso permitido</h2>
            <ul className="space-y-3 text-gray-700 leading-7 list-inside list-disc">
              <li>Crear y administrar una tienda o catálogo digital dentro de las normas aplicables.</li>
              <li>Publicar productos o servicios lícitos que cumplan con la legislación vigente.</li>
              <li>Compartir enlaces públicos del catálogo para facilitar la interacción con clientes.</li>
              <li>Recibir consultas o pedidos mediante canales conectados como WhatsApp, cuando corresponda.</li>
            </ul>
          </article>

          <article className="rounded-[1.5rem] border border-gray-200 bg-white p-6 sm:p-8">
            <h2 className="mb-4 text-2xl font-semibold text-gray-900">Uso aceptable y obligaciones del emprendedor</h2>
            <ul className="space-y-3 text-gray-700 leading-7 list-inside list-disc">
              <li>Publicar información clara, veraz, comprobable y actualizada sobre los productos o servicios ofrecidos.</li>
              <li>Informar precios, características esenciales, disponibilidad y condiciones de entrega, despacho, cambios, devoluciones o garantías cuando corresponda.</li>
              <li>Cumplir obligaciones de consumidor, tributarias, sanitarias, comerciales, de datos personales y cualquier otra exigencia legal aplicable a su rubro.</li>
              <li>Emitir documentos tributarios cuando corresponda.</li>
              <li>Responder frente a clientes, consumidores, autoridades o terceros por los productos, servicios y contenidos que publique.</li>
            </ul>
          </article>

          <article className="rounded-[1.5rem] border border-red-200 bg-red-50 p-6 sm:p-8">
            <h2 className="mb-4 text-2xl font-semibold text-red-700">Productos, servicios y contenidos prohibidos</h2>
            <ul className="space-y-3 text-gray-700 leading-7 list-inside list-disc">
              <li>Sustancias controladas, drogas, precursores o productos regulados sin autorización, conforme a la Ley N° 20.000 y normativa aplicable.</li>
              <li>Armas, municiones, explosivos, fuegos artificiales u otros elementos sometidos a control, conforme a la Ley N° 17.798 y normativa aplicable.</li>
              <li>Productos robados, falsificados, adulterados o de origen ilícito.</li>
              <li>Productos o contenidos que infrinjan derechos de autor, marcas, diseños, nombres comerciales, imágenes, logos u otros derechos de propiedad intelectual o industrial.</li>
              <li>Contenido ilegal, engañoso, fraudulento, discriminatorio, amenazante o que vulnere derechos de terceros.</li>
              <li>Publicaciones destinadas a evasión fiscal, emisión de documentos falsos, ocultamiento de ventas o incumplimiento tributario.</li>
              <li>Malware, phishing, spam, scraping abusivo, acceso no autorizado, manipulación de URLs, explotación de vulnerabilidades o uso indebido de APIs.</li>
              <li>Productos o servicios que requieran autorización sanitaria, legal, comercial o regulatoria sin contar con ella.</li>
            </ul>
          </article>

          <article className="rounded-[1.5rem] border border-gray-200 bg-gray-50 p-6 sm:p-8">
            <h2 className="mb-4 text-2xl font-semibold text-gray-900">Marco legal chileno de referencia</h2>
            <p className="text-gray-700 leading-7">
              El uso de WALO debe realizarse conforme a la legislación vigente en Chile, incluyendo, entre otras normas aplicables según el caso:</p>
            <ul className="space-y-3 text-gray-700 leading-7 list-inside list-disc">
              <li>Protección al consumidor y comercio electrónico: Ley N° 19.496 sobre Protección de los Derechos de los Consumidores y Decreto N° 6 del Ministerio de Economía, que aprueba el Reglamento de Comercio Electrónico.</li>
              <li>Protección de datos personales: Ley N° 19.628 sobre Protección de la Vida Privada y Ley N° 21.719, que regula la protección y tratamiento de datos personales y crea la Agencia de Protección de Datos Personales.</li>
              <li>Seguridad informática: Ley N° 21.459 sobre Delitos Informáticos.</li>
              <li>Obligaciones tributarias: Decreto Ley N° 830 sobre Código Tributario, Decreto Ley N° 825 sobre Impuesto a las Ventas y Servicios y Decreto Ley N° 824 sobre Impuesto a la Renta.</li>
              <li>Propiedad intelectual e industrial: Ley N° 17.336 sobre Propiedad Intelectual y Ley N° 19.039 sobre Propiedad Industrial.</li>
              <li>Productos o actividades reguladas o prohibidas: Ley N° 20.000 sobre tráfico ilícito de estupefacientes y sustancias sicotrópicas, Ley N° 17.798 sobre Control de Armas, Código Penal y demás normativa sectorial aplicable.</li>
            </ul>
          </article>

          <article className="rounded-[1.5rem] border border-gray-200 bg-white p-6 sm:p-8">
            <h2 className="mb-4 text-2xl font-semibold text-gray-900">Responsabilidad de WALO</h2>
            <p className="text-gray-700 leading-7">
              WALO provee herramientas tecnológicas para crear y administrar tiendas digitales, pero no participa directamente en la compraventa entre el emprendedor y sus clientes, salvo que una funcionalidad específica indique expresamente lo contrario.</p>
            <p className="mt-4 text-gray-700 leading-7">
              El emprendedor es el principal responsable de sus publicaciones, ventas, atención al cliente, cumplimiento tributario, garantías, despacho y postventa.</p>
          </article>

          <article className="rounded-[1.5rem] border border-gray-200 bg-gray-50 p-6 sm:p-8">
            <h2 className="mb-4 text-2xl font-semibold text-gray-900">Consecuencias del incumplimiento</h2>
            <p className="text-gray-700 leading-7">
              WALO puede ocultar productos, desactivar publicaciones, suspender o desactivar tiendas, bloquear cuentas, eliminar contenido, conservar antecedentes mínimos para auditoría y colaborar con autoridades competentes si corresponde.</p>
            <p className="mt-4 text-gray-700 leading-7">
              La desactivación o bloqueo puede ocurrir si se incumplen estos términos o la política de uso aceptable.</p>
          </article>

          <article className="rounded-[1.5rem] border border-gray-200 bg-white p-6 sm:p-8">
            <h2 className="mb-4 text-2xl font-semibold text-gray-900">Datos personales</h2>
            <p className="text-gray-700 leading-7">
              WALO podrá tratar datos personales necesarios para crear cuentas, administrar tiendas, operar la plataforma, mantener seguridad, registrar aceptación de términos y prestar soporte. El usuario debe contar con autorización o base legal suficiente para publicar datos personales de terceros en su tienda.</p>
            <p className="mt-4 text-gray-700 leading-7">
              El tratamiento de datos deberá realizarse conforme a la Ley N° 19.628, la Ley N° 21.719 y demás normativa aplicable.</p>
          </article>

          <article className="rounded-[1.5rem] border border-gray-200 bg-gray-50 p-6 sm:p-8">
            <h2 className="mb-4 text-2xl font-semibold text-gray-900">Disponibilidad del servicio</h2>
            <p className="text-gray-700 leading-7">
              WALO se entrega según disponibilidad. Puede haber interrupciones por mantenimiento, errores, servicios externos o mejoras. No se promete disponibilidad 24/7 ni SLA.</p>
          </article>

          <article className="rounded-[1.5rem] border border-gray-200 bg-white p-6 sm:p-8">
            <h2 className="mb-4 text-2xl font-semibold text-gray-900">Servicios externos</h2>
            <p className="text-gray-700 leading-7">
              WALO puede permitir o facilitar el uso de servicios externos, como WhatsApp, proveedores de hosting, dominios, herramientas de analítica, pasarelas de pago u otros servicios de terceros, cuando correspondan.</p>
            <p className="mt-4 text-gray-700 leading-7">
              Dichos servicios pueden estar sujetos a sus propios términos, condiciones, políticas de privacidad, costos, disponibilidad y restricciones. WALO no se hace responsable por fallas, cambios, suspensiones o condiciones impuestas por servicios externos que no formen parte directa de la plataforma.</p>
          </article>

          <article className="rounded-[1.5rem] border border-gray-200 bg-gray-50 p-6 sm:p-8">
            <h2 className="mb-4 text-2xl font-semibold text-gray-900">Cambios en los términos</h2>
            <p className="text-gray-700 leading-7">
              WALO puede actualizar estos términos. Los cambios relevantes deberían informarse por medios razonables dentro de la plataforma. En esta etapa no se implementa la re-aceptación obligatoria para tiendas legacy.</p>
          </article>

          <article className="rounded-[1.5rem] border border-gray-200 bg-white p-6 sm:p-8">
            <h2 className="mb-4 text-2xl font-semibold text-gray-900">Legislación aplicable</h2>
            <p className="text-gray-700 leading-7">
              Estos términos se interpretan conforme a la legislación chilena.</p>
          </article>

          <article className="rounded-[1.5rem] border border-gray-200 bg-gray-50 p-6 sm:p-8">
            <h2 className="mb-4 text-2xl font-semibold text-gray-900">Contacto</h2>
            <p className="text-gray-700 leading-7">
              Para consultas sobre estos términos, contáctanos a través de los canales oficiales de WALO.</p>
          </article>
        </section>
      </main>
      </div>
    </div>
  )
}
