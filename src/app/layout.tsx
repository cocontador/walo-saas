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
      <body className="min-h-full bg-neutral-50 text-neutral-950">
        {children}
      </body>
    </html>
  )
}
