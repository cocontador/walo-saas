import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'

import { DashboardShell } from '@/features/dashboard/components/DashboardShell'
import { authOptions } from '@/server/auth'

type DashboardLayoutProps = {
  children: React.ReactNode
}

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/login')
  }

  return (
    <DashboardShell
      userName={session.user.name ?? 'Usuario'}
      userEmail={session.user.email ?? 'sin-correo@walo.local'}
    >
      {children}
    </DashboardShell>
  )
}
