'use client';

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            const result = await signIn('credentials', { redirect: false, email, password });
            if (result?.error) {
                setError('Credenciales inválidas. Inténtalo de nuevo.');
            } else {
                router.push('/dashboard');
                router.refresh();
            }
        } catch {
            setError('Ocurrió un error inesperado.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen font-sans">
            {/* Panel izquierdo */}
            <div className="hidden lg:flex lg:w-1/2 bg-gray-900 flex-col justify-between p-12 text-white">
                <div className="text-2xl font-bold tracking-tight">WALO</div>
                <div>
                    <div className="w-14 h-14 bg-green-500 rounded-2xl flex items-center justify-center mb-8">
                        <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
                            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <polyline points="9 22 9 12 15 12 15 22" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                    <h1 className="text-4xl font-bold leading-tight mb-4">
                        Tu tienda digital,<br />lista para vender
                    </h1>
                    <p className="text-gray-400 text-lg mb-8">
                        Crea tu catálogo, comparte el link y recibe pedidos por WhatsApp. Así de simple.
                    </p>
                    <ul className="space-y-3">
                        {['Catálogo compartible con link único', 'Pedidos directo a tu WhatsApp', 'Gratis para empezar'].map((item) => (
                            <li key={item} className="flex items-center gap-3 text-gray-300">
                                <span className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                                        <path d="M2 5l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </span>
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>
                <p className="text-gray-600 text-sm">© 2026 WALO · Para micro-emprendedores</p>
            </div>

            {/* Panel derecho */}
            <div className="w-full lg:w-1/2 flex flex-col items-center justify-center bg-gray-50 px-6 py-12">
                <div className="w-full max-w-md">
                    <button
                        onClick={() => router.push('/')}
                        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-8 transition-colors"
                    >
                        <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                            <path d="M19 12H5M5 12l7 7M5 12l7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Volver al inicio
                    </button>

                    {/* Tabs */}
                    <div className="flex bg-gray-200 rounded-full p-1 mb-8">
                        <button
                            className="flex-1 py-2 text-sm font-medium rounded-full bg-white text-gray-900 shadow-sm"
                        >
                            Iniciar sesión
                        </button>
                        <button
                            onClick={() => router.push('/register')}
                            className="flex-1 py-2 text-sm font-medium rounded-full text-gray-500 hover:text-gray-700 transition-all"
                        >
                            Crear cuenta
                        </button>
                    </div>

                    <h2 className="text-3xl font-bold text-gray-900 mb-1">Bienvenido de vuelta</h2>
                    <p className="text-gray-500 mb-8">Ingresa a tu cuenta para continuar.</p>

                    {error && (
                        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 border border-red-200">{error}</div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-xs font-semibold text-gray-500 tracking-widest mb-1">CORREO ELECTRÓNICO</label>
                            <input id="email" type="email" placeholder="tucorreo@ejemplo.com" value={email} required
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full rounded-xl bg-gray-100 border border-transparent px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-green-500 focus:bg-white transition-all"
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-xs font-semibold text-gray-500 tracking-widest mb-1">CONTRASEÑA</label>
                            <input id="password" type="password" placeholder="••••••••" value={password} required
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full rounded-xl bg-gray-100 border border-transparent px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-green-500 focus:bg-white transition-all"
                            />
                        </div>
                        <button
                            type="submit" disabled={loading}
                            className="w-full py-3 px-4 rounded-xl font-semibold text-white bg-gray-900 hover:bg-gray-700 transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-2"
                        >
                            {loading ? 'Verificando...' : 'Iniciar sesión'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}