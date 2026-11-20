import LoginForm from '@/features/auth/components/LoginForm'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { Navigate } from 'react-router-dom'

function LoginPage() {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#147bc3] px-5 py-10">
        <p aria-live="polite" className="text-sm text-white" role="status">
          Verificando sesión…
        </p>
      </main>
    )
  }

  if (isAuthenticated) {
    return <Navigate to="/requests" replace />
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[#147bc3] px-5 py-10">
      <section
        aria-labelledby="login-title"
        className="w-full max-w-[358px] rounded-[10px] bg-white px-[30px] py-[30px] shadow-sm sm:px-[30px]"
      >
        <header className="mb-6 text-center">
          <img
            alt="FlatMatch"
            className="mx-auto mb-2 block h-auto w-full max-w-[240px]"
            src="/flatiHeader.png"
          />
        </header>

        <div className="mb-5">
          <p className="text-[13px] leading-[1.5] text-[#747e7a]">
            Inicia sesión con tu cuenta administrativa para gestionar la
            validación de publicadores.
          </p>
        </div>

        <LoginForm />
      </section>
    </main>
  )
}

export default LoginPage
