import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/hooks/useAuth'

function LoginForm() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [passwordVisible, setPasswordVisible] = useState(false)
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage('')
    setIsSubmitting(true)

    const formData = new FormData(event.currentTarget)

    try {
      await signIn(
        String(formData.get('email') ?? ''),
        String(formData.get('password') ?? ''),
      )
      navigate('/requests', { replace: true })
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : 'No se pudo iniciar sesión. Intenta nuevamente.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div>
        <label
          className="mb-1.5 block text-[10px] font-semibold text-[#303936]"
          htmlFor="email"
        >
          Correo electrónico
        </label>
        <div className="flex h-9 items-center gap-2 rounded-[5px] border border-[#dfe5e2] px-2.5 focus-within:border-[#147bc3] focus-within:ring-2 focus-within:ring-[#147bc3]/15">
          <svg
            aria-hidden="true"
            className="size-4 shrink-0 text-[#7b8984]"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              d="M3.75 6.75h16.5v10.5H3.75z"
              stroke="currentColor"
              strokeLinejoin="round"
              strokeWidth="1.8"
            />
            <path
              d="m4.5 7.5 7.5 6 7.5-6"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.8"
            />
          </svg>
          <input
            autoComplete="username"
            className="h-full min-w-0 flex-1 border-0 bg-transparent text-[11px] text-[#303936] outline-none placeholder:text-[#9aa39f]"
            id="email"
            name="email"
            placeholder="nombre@empresa.com"
            required
            type="email"
          />
        </div>
      </div>

      <div>
        <label
          className="mb-1.5 block text-[10px] font-semibold text-[#303936]"
          htmlFor="password"
        >
          Contraseña
        </label>
        <div className="flex h-9 items-center gap-2 rounded-[5px] border border-[#dfe5e2] px-2.5 focus-within:border-[#147bc3] focus-within:ring-2 focus-within:ring-[#147bc3]/15">
          <svg
            aria-hidden="true"
            className="size-4 shrink-0 text-[#7b8984]"
            fill="none"
            viewBox="0 0 24 24"
          >
            <rect
              height="10"
              rx="1.5"
              stroke="currentColor"
              strokeWidth="1.8"
              width="15"
              x="4.5"
              y="10.25"
            />
            <path
              d="M8 10.25V7a4 4 0 0 1 8 0v3.25"
              stroke="currentColor"
              strokeLinecap="round"
              strokeWidth="1.8"
            />
            <circle cx="12" cy="15.25" r="1" fill="currentColor" />
          </svg>
          <input
            autoComplete="current-password"
            className="h-full min-w-0 flex-1 border-0 bg-transparent text-[11px] text-[#303936] outline-none placeholder:text-[#9aa39f]"
            id="password"
            name="password"
            placeholder="Ingresa tu contraseña"
            required
            type={passwordVisible ? 'text' : 'password'}
          />
          <button
            aria-label={passwordVisible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            className="grid size-6 shrink-0 place-items-center rounded text-[#7b8984] hover:text-[#303936] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#147bc3]"
            onClick={() => setPasswordVisible((visible) => !visible)}
            type="button"
          >
            {passwordVisible ? (
              <svg
                aria-hidden="true"
                className="size-4"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  d="M3 3l18 18M10.6 10.7a2 2 0 0 0 2.7 2.7"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeWidth="1.8"
                />
                <path
                  d="M9.9 5.2A10.7 10.7 0 0 1 12 5c5.4 0 9 7 9 7a15.4 15.4 0 0 1-3.1 3.8M6.2 6.3C3.9 8 3 12 3 12s3.6 7 9 7c1 0 2-.2 2.8-.6"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.8"
                />
              </svg>
            ) : (
              <svg
                aria-hidden="true"
                className="size-4"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  d="M3 12s3.6-7 9-7 9 7 9 7-3.6 7-9 7-9-7-9-7Z"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.8"
                />
                <circle
                  cx="12"
                  cy="12"
                  r="2.5"
                  stroke="currentColor"
                  strokeWidth="1.8"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      <div className="flex justify-end pt-0.5">
        <button
          className="text-[10px] font-semibold text-[#147bc3] hover:underline focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#147bc3]"
          onClick={() =>
            setMessage('La recuperación de contraseña estará disponible próximamente.')
          }
          type="button"
        >
          ¿Olvidaste tu contraseña?
        </button>
      </div>

      <button
        className="flex h-9 w-full items-center justify-center gap-2 rounded-[5px] bg-[#147bc3] text-[11px] font-medium text-white transition-colors hover:bg-[#116eae] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#147bc3] active:bg-[#0f629e] disabled:cursor-wait disabled:opacity-70"
        disabled={isSubmitting}
        type="submit"
      >
        {isSubmitting ? 'Ingresando…' : 'Iniciar sesión'}
        <svg
          aria-hidden="true"
          className="size-4"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            d="M5 12h14m-6-6 6 6-6 6"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.8"
          />
        </svg>
      </button>

      {message && (
        <p aria-live="polite" className="text-center text-[10px] text-[#b42318]" role="status">
          {message}
        </p>
      )}

      <div className="border-t border-[#e5e9e7] pt-3">
        <p className="flex items-center justify-center gap-1.5 text-[9px] text-[#7b8581]">
          <svg
            aria-hidden="true"
            className="size-3.5"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              d="M12 3.5 5.5 6v5.3c0 4.2 2.8 7.4 6.5 9.2 3.7-1.8 6.5-5 6.5-9.2V6L12 3.5Z"
              stroke="currentColor"
              strokeLinejoin="round"
              strokeWidth="1.8"
            />
            <path
              d="m9.5 12 1.7 1.7 3.5-3.7"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.8"
            />
          </svg>
          Acceso exclusivo para administradores
        </p>
      </div>
    </form>
  )
}

export default LoginForm
