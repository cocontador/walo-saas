'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

import { SignOutButton } from '@/features/auth/components/SignOutButton'

type DashboardShellProps = {
  userName: string
  userEmail: string
  children: React.ReactNode
}

type NavItem = {
  label: string
  href: string
}

const navItems: NavItem[] = [
  { label: 'Mi tienda', href: '/dashboard' },
  { label: 'Productos', href: '/dashboard/products' },
  { label: 'Categorías', href: '/dashboard/categories' },
  { label: 'Mi Plan', href: '/dashboard/billing' },
]

function navItemClasses(isActive: boolean) {
  if (isActive) {
    return 'flex items-center rounded-xl bg-green-500 px-3 py-2.5 text-sm font-semibold text-white shadow-sm'
  }

  return 'flex items-center rounded-xl px-3 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-100 hover:text-gray-900'
}

export function DashboardShell({ userName, userEmail, children }: DashboardShellProps) {
  const pathname = usePathname()
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const SidebarContent = (
    <div className="flex h-full flex-col">
      <div className="mb-8 flex items-center justify-between">
        <Link
          href="/dashboard"
          className="text-xl font-bold tracking-tight text-gray-900"
          onClick={() => setIsMobileOpen(false)}
        >
          WALO
        </Link>
        <button
          type="button"
          onClick={() => setIsMobileOpen(false)}
          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 lg:hidden"
          aria-label="Cerrar menú"
        >
          ✕
        </button>
      </div>

      <div className="mb-8 rounded-2xl bg-gray-100 p-4">
        <p className="truncate text-sm font-semibold text-gray-900">{userName}</p>
        <p className="truncate text-xs text-gray-500">{userEmail}</p>
      </div>

      <nav className="flex-1 space-y-1">
        <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-widest text-gray-400">
          Menú
        </p>
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(item.href))

          return (
            <Link
              key={item.href}
              href={item.href}
              className={navItemClasses(isActive)}
              onClick={() => setIsMobileOpen(false)}
            >
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="mt-6 border-t border-gray-200 pt-4">
        <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-widest text-gray-400">
          Cuenta
        </p>
        <SignOutButton />
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto flex min-h-screen w-full max-w-[1600px]">
        <aside className="hidden w-72 shrink-0 border-r border-gray-200 bg-white px-6 py-7 lg:block">
          {SidebarContent}
        </aside>

        {isMobileOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <button
              type="button"
              aria-label="Cerrar menú"
              className="absolute inset-0 bg-black/30"
              onClick={() => setIsMobileOpen(false)}
            />
            <aside className="relative z-50 h-full w-72 bg-white px-6 py-7 shadow-xl">
              {SidebarContent}
            </aside>
          </div>
        )}

        <div className="flex min-h-screen flex-1 flex-col">
          <header className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-4 lg:hidden">
            <Link href="/dashboard" className="text-lg font-bold tracking-tight text-gray-900">
              WALO
            </Link>
            <button
              type="button"
              onClick={() => setIsMobileOpen(true)}
              className="rounded-lg p-2 text-gray-600 hover:bg-gray-100"
              aria-label="Abrir menú"
            >
              ☰
            </button>
          </header>

          <main className="flex-1 p-6 md:p-8 xl:p-10">{children}</main>
        </div>
      </div>
    </div>
  )
}
