'use client';

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

type Tab = 'login' | 'register';

export default function AuthPage() {
    const [tab, setTab] = useState<Tab>('login');
    const router = useRouter();

    return (
        <div className="flex min-h-screen font-sans">
            {/* Panel izquierdo */}
            <div className="hidden lg:flex lg:w-1/2 bg-gray-900 flex-col justify-between p-12 text-white">
                <div className="text-2xl font-bold tracking-tight">WALO</div>
                <div>
                    <div className="mb-8">
                        <div className="w-14 h-14 bg-green-500 rounded-2xl flex items-center justify-center mb-8">
                            <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
                                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <polyline points="9 22 9 12 15 12 15 22" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <h1 className="text-4xl font-bold leading-tight mb-4">
                            Tu tienda digital,<br />lista para vender
                        </h1>
                        <p className="text-gray-400 text-lg">
                            Crea tu catálogo, comparte el link y recibe pedidos por WhatsApp. Así de simple.
                        </p>
                    </div>
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
                            onClick={() => setTab('login')}
                            className={`flex-1 py-2 text-sm font-medium rounded-full transition-all ${tab === 'login' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Iniciar sesión
                        </button>
                        <button
                            onClick={() => setTab('register')}
                            className={`flex-1 py-2 text-sm font-medium rounded-full transition-all ${tab === 'register' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Crear cuenta
                        </button>
                    </div>

                    {tab === 'login' ? <LoginForm router={router} /> : <RegisterForm onSuccess={() => setTab('login')} />}
                </div>
            </div>
        </div>
    );
}

function LoginForm({ router }: { router: ReturnType<typeof useRouter> }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

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
        <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-1">Bienvenido de vuelta</h2>
            <p className="text-gray-500 mb-8">Ingresa a tu cuenta para continuar.</p>

            {error && <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 border border-red-200">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
                <Field label="CORREO ELECTRÓNICO" id="email" type="email" placeholder="tucorreo@ejemplo.com"
                    value={email} onChange={setEmail} />
                <Field label="CONTRASEÑA" id="password" type="password" placeholder="••••••••"
                    value={password} onChange={setPassword} />
                <SubmitButton loading={loading} label="Iniciar sesión" loadingLabel="Verificando..." />
            </form>
        </div>
    );
}

function RegisterForm({ onSuccess }: { onSuccess: () => void }) {
    const [name, setName] = useState('');
    const [storeName, setStoreName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, storeName, email, password }),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.error ?? 'Error al crear la cuenta.');
            } else {
                onSuccess();
            }
        } catch {
            setError('Ocurrió un error inesperado.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-1">Crea tu tienda</h2>
            <p className="text-gray-500 mb-8">Configura tu catálogo digital en 2 minutos.</p>

            {error && <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 border border-red-200">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
                <Field label="TU NOMBRE" id="name" type="text" placeholder="María González"
                    value={name} onChange={setName} />
                <Field label="NOMBRE DE TU TIENDA" id="storeName" type="text" placeholder="Boutique María"
                    value={storeName} onChange={setStoreName} />
                <Field label="CORREO ELECTRÓNICO" id="reg-email" type="email" placeholder="tucorreo@ejemplo.com"
                    value={email} onChange={setEmail} />
                <Field label="CONTRASEÑA" id="reg-password" type="password" placeholder="Mínimo 6 caracteres"
                    value={password} onChange={setPassword} />
                <SubmitButton loading={loading} label="🏪 Crear mi tienda gratis" loadingLabel="Creando tu tienda..." green />
            </form>

            <p className="mt-4 text-center text-xs text-gray-400">
                Al registrarte aceptas nuestros Términos de Servicio y Política de Privacidad.
            </p>
        </div>
    );
}

function Field({ label, id, type, placeholder, value, onChange }: {
    label: string; id: string; type: string; placeholder: string;
    value: string; onChange: (v: string) => void;
}) {
    return (
        <div>
            <label htmlFor={id} className="block text-xs font-semibold text-gray-500 tracking-widest mb-1">{label}</label>
            <input
                id={id} type={type} placeholder={placeholder} value={value} required
                onChange={(e) => onChange(e.target.value)}
                className="w-full rounded-xl bg-gray-100 border border-transparent px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-green-500 focus:bg-white transition-all"
            />
        </div>
    );
}

function SubmitButton({ loading, label, loadingLabel, green }: {
    loading: boolean; label: string; loadingLabel: string; green?: boolean;
}) {
    return (
        <button
            type="submit" disabled={loading}
            className={`w-full py-3 px-4 rounded-xl font-semibold text-white transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-2 ${green ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-900 hover:bg-gray-700'
                }`}
        >
            {loading ? loadingLabel : label}
        </button>
    );
}