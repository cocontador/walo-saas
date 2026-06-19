import Link from "next/link"
import { notFound } from "next/navigation"

import { StoreModerationForm } from "@/features/admin/components/StoreModerationForm"
import { prisma } from "@/lib/prisma"
import {
  PlatformAdminAccessError,
  requirePlatformAdmin,
} from "@/lib/requirePlatformAdmin"

async function getStoresForModeration() {
  return prisma.store.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      slug: true,
      isActive: true,
      createdAt: true,
      memberships: {
        where: { role: "OWNER" },
        take: 1,
        select: {
          user: {
            select: {
              email: true,
              name: true,
            },
          },
        },
      },
      auditLogs: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: {
          action: true,
          reason: true,
          createdAt: true,
        },
      },
    },
  })
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("es-CL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date)
}

export default async function AdminStoresPage() {
  try {
    await requirePlatformAdmin()
  } catch (error) {
    if (error instanceof PlatformAdminAccessError) {
      notFound()
    }

    throw error
  }

  const stores = await getStoresForModeration()

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-700">
              Administración WALO
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-gray-950">
              Moderación de tiendas
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
              Activa o desactiva tiendas que incumplan las condiciones de uso. Cada cambio exige
              motivo y queda registrado en auditoría.
            </p>
          </div>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            Ir al dashboard
          </Link>
        </div>

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="grid gap-4 border-b border-gray-100 bg-gray-50 px-5 py-3 text-xs font-bold uppercase tracking-wide text-gray-500 md:grid-cols-[1.4fr_0.8fr_0.8fr_1.2fr]">
            <span>Tienda</span>
            <span>Estado</span>
            <span>Creación</span>
            <span>Moderación</span>
          </div>

          {stores.length === 0 ? (
            <div className="p-8 text-center text-sm text-gray-500">No hay tiendas registradas.</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {stores.map((store) => {
                const owner = store.memberships[0]?.user
                const lastAudit = store.auditLogs[0]

                return (
                  <article
                    key={store.id}
                    className="grid gap-5 px-5 py-5 md:grid-cols-[1.4fr_0.8fr_0.8fr_1.2fr]"
                  >
                    <div>
                      <h2 className="font-bold text-gray-950">{store.name}</h2>
                      <p className="mt-1 text-sm text-gray-500">/{store.slug}</p>
                      {owner && (
                        <p className="mt-2 text-xs text-gray-400">
                          Owner: {owner.name ?? owner.email}
                        </p>
                      )}
                    </div>

                    <div>
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                          store.isActive
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-red-50 text-red-700"
                        }`}
                      >
                        {store.isActive ? "Activa" : "Inactiva"}
                      </span>
                      {lastAudit && (
                        <p className="mt-3 text-xs leading-5 text-gray-500">
                          Último cambio: {lastAudit.action}
                        </p>
                      )}
                    </div>

                    <div className="text-sm text-gray-600">{formatDate(store.createdAt)}</div>

                    <div>
                      <StoreModerationForm storeId={store.id} isActive={store.isActive} />
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
