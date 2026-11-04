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
          <div className="mb-2 flex items-center justify-center gap-2">
            <span className="grid size-[26px] place-items-center rounded-md bg-[#147bc3] text-white">
              <svg
                aria-hidden="true"
                className="size-[18px]"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  d="m3.75 10 8.25-6.5 8.25 6.5v9.25a1.5 1.5 0 0 1-1.5 1.5h-13.5a1.5 1.5 0 0 1-1.5-1.5V10Z"
                  stroke="currentColor"
                  strokeLinejoin="round"
                  strokeWidth="1.8"
                />
                <path
                  d="M9 20.75v-7h6v7"
                  stroke="currentColor"
                  strokeLinejoin="round"
                  strokeWidth="1.8"
                />
              </svg>
            </span>
            <span className="text-[21px] font-medium tracking-tight text-[#147bc3]">
              FlatMatch
            </span>
          </div>
          <p className="text-[10px] font-medium uppercase tracking-wide text-[#84908c]">
            Backoffice administrativo
          </p>
        </header>

        <div className="mb-5">
          <h1
            className="mb-1 text-[21px] leading-tight font-medium text-[#27312e]"
            id="login-title"
          >
            Te damos la bienvenida
          </h1>
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
