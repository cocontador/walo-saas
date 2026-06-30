'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { BarChart3, FolderTree, LayoutDashboard, Menu, Package, Settings, ShoppingBag, Wallet, X } from 'lucide-react'

import { SignOutButton } from '@/features/auth/components/SignOutButton'
import { DashboardGuidedTour } from '@/features/dashboard/components/DashboardGuidedTour'

type DashboardShellProps = {
  userName: string
  userEmail: string
  children: React.ReactNode
}

type NavItem = {
  label: string
  href: string
  description: string
  icon: React.ComponentType<{ className?: string }>
}

const navItems: NavItem[] = [
  {
    label: 'Mi tienda',
    href: '/dashboard',
    description: 'Resumen y configuración',
    icon: LayoutDashboard,
  },
  {
    label: 'Productos',
    href: '/dashboard/products',
    description: 'Catálogo e inventario',
    icon: Package,
  },
  {
    label: 'Categorías',
    href: '/dashboard/categories',
    description: 'Organización de vitrinas',
    icon: FolderTree,
  },
  {
    label: 'Mi Plan',
    href: '/dashboard/billing',
    description: 'Límites y suscripción',
    icon: Wallet,
  },
  {
    label: 'Pedidos',
    href: '/dashboard/orders',
    description: 'Compras de tus clientes',
    icon: ShoppingBag,
  },
  {
    label: 'Analíticas',
    href: '/dashboard/analytics',
    description: 'Visitas y ventas',
    icon: BarChart3,
  },
  {
    label: 'Configuración',
    href: '/dashboard/settings',
    description: 'Khipu y pagos',
    icon: Settings,
  },
]

function navItemClasses(isActive: boolean) {
  if (isActive) {
    return 'group flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-3 text-sm font-semibold text-emerald-900 shadow-sm'
  }

  return 'group flex items-center gap-3 rounded-xl border border-transparent px-3 py-3 text-sm font-semibold text-gray-600 transition hover:border-gray-200 hover:bg-white hover:text-gray-950 hover:shadow-sm'
}

export function DashboardShell({ userName, userEmail, children }: DashboardShellProps) {
  const pathname = usePathname()
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const SidebarContent = (
    <div className="flex h-full flex-col">
      <div className="mb-8 flex items-center justify-between">
        <Link
          href="/dashboard"
          className="flex items-center gap-3"
          onClick={() => setIsMobileOpen(false)}
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-sm font-black text-white shadow-sm">
            W
          </span>
          <span>
            <span className="block text-lg font-black tracking-tight text-gray-950">WALO</span>
            <span className="block text-xs font-medium text-gray-500">Panel emprendedor</span>
          </span>
        </Link>
        <button
          type="button"
          onClick={() => setIsMobileOpen(false)}
          className="cursor-pointer rounded-lg p-2 text-gray-500 hover:bg-gray-100 lg:hidden"
          aria-label="Cerrar menú"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="mb-8 rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-800">
            {userName.slice(0, 1).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-gray-950">{userName}</p>
            <p className="truncate text-xs text-gray-500">{userEmail}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1">
        <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-widest text-gray-400">
          Gestión
        </p>
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(item.href))
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              data-tour={item.href === '/dashboard/products' ? 'sidebar-products-link' : undefined}
              className={navItemClasses(isActive)}
              onClick={() => setIsMobileOpen(false)}
            >
              <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                isActive ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-500 group-hover:bg-emerald-50 group-hover:text-emerald-700'
              }`}>
                <Icon className="h-4 w-4" />
              </span>
              <span className="min-w-0">
                <span className="block">{item.label}</span>
                <span className={`block truncate text-xs font-medium ${
                  isActive ? 'text-emerald-700' : 'text-gray-400'
                }`}>
                  {item.description}
                </span>
              </span>
            </Link>
          )
        })}
      </nav>

      <div className="mt-6 border-t border-gray-200 pt-4">
        <SignOutButton />
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#f7faf7]">
      <div className="mx-auto flex min-h-screen w-full max-w-[1600px]">
        <aside className="hidden w-80 shrink-0 border-r border-gray-200/80 bg-white/80 px-6 py-7 backdrop-blur lg:block">
          {SidebarContent}
        </aside>

        {isMobileOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <button
              type="button"
              aria-label="Cerrar menú"
              className="cursor-pointer absolute inset-0 bg-black/30"
              onClick={() => setIsMobileOpen(false)}
            />
            <aside className="relative z-50 h-full w-80 max-w-[86vw] bg-white px-6 py-7 shadow-xl">
              {SidebarContent}
            </aside>
          </div>
        )}

        <div className="flex min-h-screen flex-1 flex-col">
          <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-gray-200 bg-white/90 px-4 py-4 backdrop-blur lg:hidden">
            <Link href="/dashboard" className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-sm font-black text-white">
                W
              </span>
              <span className="text-lg font-black tracking-tight text-gray-950">WALO</span>
            </Link>
            <div className="flex items-center gap-2">
              <DashboardGuidedTour compact autoStart={false} />
              <button
                type="button"
                onClick={() => setIsMobileOpen(true)}
                className="cursor-pointer rounded-lg border border-gray-200 bg-white p-2 text-gray-600 shadow-sm hover:bg-gray-50"
                aria-label="Abrir menú"
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>
          </header>

          <main className="flex-1 p-4 sm:p-6 md:p-8 xl:p-10">
            <div className="mx-auto max-w-6xl">
              <div className="mb-6 hidden items-center justify-between rounded-2xl border border-emerald-100 bg-white px-5 py-4 shadow-sm lg:flex">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-emerald-700">Dashboard WALO</p>
                  <p className="mt-1 text-sm text-gray-500">Administra tu vitrina, productos y crecimiento desde un solo lugar.</p>
                </div>
                <DashboardGuidedTour />
              </div>
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
