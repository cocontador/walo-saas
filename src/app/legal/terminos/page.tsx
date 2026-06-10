export const metadata = {
  title: 'Términos y Condiciones | WALO',
  description:
    'Términos y condiciones mínimos para el uso de WALO por emprendedores. Contenido en español chileno para la versión MVP.',
}

export default function LegalTerminosPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <main className="mx-auto max-w-5xl space-y-10 rounded-[2rem] bg-white px-6 py-10 shadow-[0_20px_80px_rgba(15,23,42,0.08)] ring-1 ring-black/5 sm:px-10 sm:py-12">
        <header className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-green-600">Términos y Uso Aceptable</p>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Términos mínimos de uso para emprendedores en WALO
          </h1>
          <p className="max-w-3xl text-base leading-7 text-gray-600">
            Esta es una versión mínima de términos para el MVP académico de WALO. Está pensada para apoyar la creación de tiendas digitales sin reemplazar asesoría legal profesional.
          </p>
          <p className="text-sm text-gray-400">Última actualización: Junio 2026</p>
        </header>

        <section className="space-y-8">
          <article className="rounded-[1.5rem] border border-gray-200 bg-gray-50 p-6 sm:p-8">
            <h2 className="mb-4 text-2xl font-semibold text-gray-900">Introducción</h2>
            <p className="text-gray-700 leading-7">
              WALO es una plataforma SaaS para que microemprendedores creen y administren catálogos digitales. El emprendedor es responsable de la información, productos, precios, stock, despacho, postventa y cumplimiento legal de lo que publica.
            </p>
            <p className="mt-4 text-gray-700 leading-7">
              WALO no reemplaza obligaciones legales, tributarias ni comerciales del vendedor. Aquí se define el marco básico de uso aceptable dentro de la plataforma.
            </p>
          </article>

          <article className="rounded-[1.5rem] border border-gray-200 bg-white p-6 sm:p-8">
            <h2 className="mb-4 text-2xl font-semibold text-gray-900">Aceptación de términos</h2>
            <p className="text-gray-700 leading-7">
              Al crear una tienda en WALO, el usuario declara que leyó y acepta estos términos. La aceptación se registra con fecha y hora en el campo <code className="rounded bg-gray-100 px-1 py-0.5 font-mono text-sm">Store.acceptedTermsAt</code>.
            </p>
            <p className="mt-4 text-gray-700 leading-7">
              El usuario declara tener capacidad para usar la plataforma y administrar una tienda dentro del marco chileno de comercio electrónico.
            </p>
          </article>

          <article className="rounded-[1.5rem] border border-gray-200 bg-gray-50 p-6 sm:p-8">
            <h2 className="mb-4 text-2xl font-semibold text-gray-900">Uso permitido</h2>
            <ul className="space-y-3 text-gray-700 leading-7 list-inside list-disc">
              <li>Crear y administrar una tienda digital.</li>
              <li>Publicar productos o servicios lícitos.</li>
              <li>Compartir enlaces públicos del catálogo.</li>
              <li>Recibir consultas o pedidos mediante canales conectados como WhatsApp si aplica.</li>
            </ul>
          </article>

          <article className="rounded-[1.5rem] border border-gray-200 bg-white p-6 sm:p-8">
            <h2 className="mb-4 text-2xl font-semibold text-gray-900">Uso aceptable y obligaciones del emprendedor</h2>
            <ul className="space-y-3 text-gray-700 leading-7 list-inside list-disc">
              <li>Mantener información clara, veraz y actualizada.</li>
              <li>Informar precios, disponibilidad, características relevantes y condiciones de despacho o entrega cuando corresponda.</li>
              <li>Cumplir normativa chilena de comercio electrónico, consumo, protección de datos y obligaciones tributarias.</li>
              <li>Emitir documentos tributarios cuando corresponda.</li>
              <li>No usar WALO para engañar consumidores, simular ventas, ocultar información relevante o evadir obligaciones legales.</li>
            </ul>
          </article>

          <article className="rounded-[1.5rem] border border-red-200 bg-red-50 p-6 sm:p-8">
            <h2 className="mb-4 text-2xl font-semibold text-red-700">Productos, servicios y contenidos prohibidos</h2>
            <ul className="space-y-3 text-gray-700 leading-7 list-inside list-disc">
              <li>Sustancias controladas, drogas, precursores o productos relacionados cuya venta, distribución o promoción esté restringida o sea ilícita.</li>
              <li>Armas, municiones, explosivos, fuegos artificiales, elementos sometidos a control legal o productos destinados a causar daño.</li>
              <li>Productos robados, falsificados, adulterados o que infrinjan propiedad intelectual.</li>
              <li>Contenido ilegal, fraudulento, discriminatorio, amenazante o que vulnere derechos de terceros.</li>
              <li>Servicios o publicaciones orientadas a evasión fiscal, emisión de documentos falsos, ocultamiento de ventas o incumplimiento tributario.</li>
              <li>Malware, phishing, spam, scraping abusivo, intentos de acceso no autorizado o conductas que comprometan la seguridad de WALO u otros usuarios.</li>
              <li>Productos o servicios que requieran autorización sanitaria, legal o regulatoria sin contar con ella.</li>
            </ul>
          </article>

          <article className="rounded-[1.5rem] border border-gray-200 bg-gray-50 p-6 sm:p-8">
            <h2 className="mb-4 text-2xl font-semibold text-gray-900">Seguridad y multitenancy</h2>
            <ul className="space-y-3 text-gray-700 leading-7 list-inside list-disc">
              <li>No intentar acceder a tiendas, datos, cuentas o recursos de otros usuarios.</li>
              <li>No explotar vulnerabilidades, manipular URLs, abusar de APIs, automatizar maliciosamente o realizar pruebas de seguridad no autorizadas.</li>
              <li>WALO puede investigar, limitar acceso o suspender cuentas ante riesgos de seguridad.</li>
            </ul>
          </article>

          <article className="rounded-[1.5rem] border border-gray-200 bg-white p-6 sm:p-8">
            <h2 className="mb-4 text-2xl font-semibold text-gray-900">Consecuencias del incumplimiento</h2>
            <p className="text-gray-700 leading-7">
              WALO puede ocultar productos, desactivar publicaciones, suspender o desactivar tiendas, eliminar contenido o bloquear acceso. En casos graves, puede conservar antecedentes mínimos para auditoría y colaborar con autoridades competentes si corresponde.
            </p>
            <p className="mt-4 text-gray-700 leading-7">
              La desactivación puede ocurrir si se incumplen estos términos o la política de uso aceptable.
            </p>
          </article>

          <article className="rounded-[1.5rem] border border-gray-200 bg-gray-50 p-6 sm:p-8">
            <h2 className="mb-4 text-2xl font-semibold text-gray-900">Datos personales</h2>
            <p className="text-gray-700 leading-7">
              WALO puede tratar datos necesarios para crear la cuenta, administrar la tienda y operar la plataforma. El usuario debe tener autorización para publicar datos personales de terceros.
            </p>
          </article>

          <article className="rounded-[1.5rem] border border-gray-200 bg-white p-6 sm:p-8">
            <h2 className="mb-4 text-2xl font-semibold text-gray-900">Disponibilidad del servicio</h2>
            <p className="text-gray-700 leading-7">
              WALO se entrega según disponibilidad. Puede haber interrupciones por mantenimiento, errores, servicios externos o mejoras. No se promete disponibilidad 24/7 ni SLA en esta versión.</p>
          </article>

          <article className="rounded-[1.5rem] border border-gray-200 bg-gray-50 p-6 sm:p-8">
            <h2 className="mb-4 text-2xl font-semibold text-gray-900">Servicios externos</h2>
            <p className="text-gray-700 leading-7">
              Si usas WhatsApp, hosting, dominios u otros servicios externos, esos canales pueden regirse por sus propios términos. WALO no afirma tener integraciones de pago aparte de las que ya ofrezca el proyecto actual.
            </p>
          </article>

          <article className="rounded-[1.5rem] border border-gray-200 bg-white p-6 sm:p-8">
            <h2 className="mb-4 text-2xl font-semibold text-gray-900">Cambios en los términos</h2>
            <p className="text-gray-700 leading-7">
              WALO puede actualizar estos términos. Los cambios relevantes deberían informarse por medios razonables dentro de la plataforma. En este sprint no se exige la re-aceptación obligatoria de términos antiguos.</p>
          </article>

          <article className="rounded-[1.5rem] border border-gray-200 bg-gray-50 p-6 sm:p-8">
            <h2 className="mb-4 text-2xl font-semibold text-gray-900">Legislación aplicable</h2>
            <p className="text-gray-700 leading-7">
              Estos términos se interpretan conforme a la legislación chilena.</p>
          </article>

          <article className="rounded-[1.5rem] border border-gray-200 bg-white p-6 sm:p-8">
            <h2 className="mb-4 text-2xl font-semibold text-gray-900">Contacto</h2>
            <p className="text-gray-700 leading-7">
              Para consultas sobre estos términos, contáctanos a través de los canales oficiales de WALO.</p>
          </article>
        </section>
      </main>
    </div>
  )
}
