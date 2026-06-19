import Link from 'next/link'
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'WALO SaaS',
  description: 'Base técnica inicial del MVP multitenant de WALO',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="flex min-h-screen flex-col bg-neutral-50 text-neutral-950">
        <div className="flex-1">{children}</div>
        <footer className="border-t border-gray-200 bg-white py-4 text-center text-sm text-gray-500">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-2 px-6 text-sm text-gray-500">
            <span>© 2026 WALO · Hecho para microemprendedores</span>
            <span className="hidden sm:inline">·</span>
            <Link href="/legal/terminos" className="font-semibold text-gray-700 transition hover:text-gray-900">
              Términos de uso
            </Link>
          </div>
        </footer>
      </body>
    </html>
  )
}
