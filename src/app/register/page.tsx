import { RegisterForm } from '@/features/auth/components/RegisterForm'
import { PublicRegisterTour } from '@/features/auth/components/PublicRegisterTour'

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-6 py-12 font-sans">
      <div className="w-full max-w-md">
        <div className="mb-4 flex justify-end">
          <PublicRegisterTour label="Ver cómo registrarme" />
        </div>
        <RegisterForm />
      </div>
    </div>
  )
}
