// src/app/login/page.tsx
'use client';
//Le dice a Next.js que este
// componente se ejecuta en el navegador
// del usuario. Es necesario porque usamos hooks
// (useState- Es para que React "recuerde" lo que el usuario escribe en los campos.) e interacciones (clics)
import React, { useState } from 'react';

import { signIn } from 'next-auth/react'; //Es la función "mágica" de NextAuth. Ella se encarga de enviar los datos a tu API, manejar las cookies y crear la sesión.
import { useRouter } from 'next/navigation'; //Nos permite cambiar de página (redireccionar) mediante código.

export default function LoginPage() {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault(); // Detiene el envío clásico de HTML
        setError(null);     // Limpia errores anteriores
        setLoading(true);   // Activa el estado de carga para el botón

        try {
            // Usamos NextAuth para la autenticación
            const result = await signIn('credentials', {
                redirect: false,
                email,
                password,
            });

            if (result?.error) {
                setError("Credenciales inválidas. Inténtalo de nuevo.");
            } else {
                // Redirigir y refrescar el estado de la sesión
                router.push('/dashboard');
                router.refresh();
            }
        } catch (err) {
            setError("Ocurrió un error inesperado.");
            console.error("Login error:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4" >
            <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-10 shadow-xl border border-gray-100" >
                <div className="text-center" >
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900" > Iniciar Sesión </h2>
                    < p className="mt-2 text-sm text-gray-600" > Accede a tu cuenta de WALO - SAAS </p>
                </div>

                < form className="mt-8 space-y-6" onSubmit={handleSubmit} >
                    {error && (
                        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700 border border-red-200 animate-pulse" >
                            {error}
                        </div>
                    )
                    }

                    <div className="space-y-4" >
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700" >
                                Correo electrónico
                            </label>
                            < input
                                id="email"
                                type="email"
                                required
                                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500 transition-all outline-none"
                                placeholder="nombre@ejemplo.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        < div >
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700" >
                                Contraseña
                            </label>
                            < input
                                id="password"
                                type="password"
                                required
                                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500 transition-all outline-none"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    < button
                        type="submit"
                        disabled={loading}
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                        {
                            loading ? (
                                <span className="flex items-center" >
                                    <svg className="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24" >
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Verificando...
                                </ span >
                            ) : 'Entrar'}
                    </button>
                </form>
            </div>
        </main>
    );
}

//Resumen del flujo
//1. El usuario escribe su email.
//2. El componente guarda ese email en el estado.
//3. El usuario hace clic en "Entrar".
//4. handleSubmit se activa y le pasa el email a NextAuth.
//5. NextAuth va a tu archivo src/server/auth.ts, busca en la base de datos PostgreSQL mediante Prisma y compara la contraseña.
//6.Si coinciden, NextAuth crea una Cookie de sesión y nosotros redirigimos al usuario.