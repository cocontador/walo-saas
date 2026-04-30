'use client'

import { signOut } from 'next-auth/react'

export function SignOutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: '/login' })}
      className="rounded-lg bg-red-600 px-4 py-2 font-semibold text-white transition hover:bg-red-700"
    >
      Cerrar Sesión
    </button>
  )
}
