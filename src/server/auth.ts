import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

export const authOptions: NextAuthOptions = {
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: {
          label: 'Email',
          type: 'email',
        },
        password: {
          label: 'Contraseña',
          type: 'password',
        },
      },
      async authorize() {
        // La validación real de credenciales se implementa con WALO-001/WALO-004
        return null
      },
    }),
  ],
  pages: {
    signIn: '/login',
  },
}
