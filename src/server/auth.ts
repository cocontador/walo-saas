import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";         // Para comparar las contraseñas
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
      // Cambia la línea donde empieza el authorize por esta:
async authorize(credentials: Record<"email" | "password", string> | undefined) {
        // La validación real de credenciales se implementa con WALO-001/WALO-004

        // 1. Verificar que el usuario envió email y password
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // 2. Buscar al usuario en la base de datos PostgreSQL usando Prisma
        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        });

        // 3. Si el usuario no existe o no tiene contraseña, denegar acceso
        if (!user || !user.password) {
          return null;
        }

        // 4. Comparar la contraseña ingresada con la guardada en la DB
        const isPasswordCorrect = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordCorrect) {
          return null;
        }

        // 5. Si todo está ok, devolvemos el usuario para la sesión
        return {
          id: user.id.toString(), // NextAuth suele esperar que el ID sea string
          email: user.email,
          name: user.name,
        };
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    // Esto es opcional pero recomendado: permite que el ID esté disponible en el cliente
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub as string;
      }
      return session;
    },
  },
};