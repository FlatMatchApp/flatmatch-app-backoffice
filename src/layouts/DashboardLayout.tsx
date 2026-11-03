import { House, LogOut, Inbox } from 'lucide-react'
import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/hooks/useAuth'

function DashboardLayout() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [signOutError, setSignOutError] = useState('')

  async function handleSignOut() {
    setSignOutError('')
    try {
      await signOut()
      navigate('/login', { replace: true })
    } catch (error) {
      setSignOutError(
        error instanceof Error
          ? error.message
          : 'No se pudo cerrar la sesión. Intenta nuevamente.',
      )
    }
  }

  return (
    <div className="min-h-screen bg-[#f3f5f6] lg:flex">
      <aside className="flex shrink-0 flex-col bg-[#147bc3] text-white lg:min-h-screen lg:w-[200px]">
        <div className="flex items-center gap-2 px-4 py-4">
          <span className="grid size-7 place-items-center rounded-md bg-white text-[#147bc3]">
            <House aria-hidden="true" size={18} strokeWidth={2.2} />
          </span>
          <span className="text-xl font-medium tracking-tight">FlatMatch</span>
        </div>

        <div className="hidden px-3 pt-2 pb-1 text-[11px] font-semibold tracking-wide text-blue-100 lg:block">
          GESTIÓN DE PUBLICADORES
        </div>

        <nav aria-label="Navegación principal" className="flex gap-1 px-2 pb-3 lg:flex-col">
          <NavLink
            className={({ isActive }) =>
              `flex min-h-9 flex-1 items-center gap-2 rounded-md px-2.5 text-sm transition-colors lg:flex-none ${
                isActive ? 'bg-white/15 font-semibold' : 'text-white/90 hover:bg-white/10'
              }`
            }
            to="/requests"
          >
            <Inbox aria-hidden="true" size={16} />
            Solicitudes
          </NavLink>
        </nav>

        <div className="mt-auto hidden space-y-1 px-2 pb-3 lg:block">
          <button
            className="flex h-9 w-full items-center gap-2 rounded-md px-2.5 text-left text-sm text-white/90 hover:bg-white/10"
            onClick={handleSignOut}
            type="button"
          >
            <LogOut aria-hidden="true" size={16} />
            Cerrar sesión
          </button>
          <p className="px-2.5 pt-1 text-[11px] text-blue-100">FlatMatch Backoffice · v1.0</p>
        </div>
      </aside>

      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <header className="h-[58px] shrink-0 border-b border-[#e6e9e8] bg-white">
          <div className="mx-auto flex h-full w-full max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-7">
            <div className="flex items-center gap-2 text-[13px] text-[#7b8581]">
              <span>Backoffice</span>
              <span aria-hidden="true">›</span>
              <span className="font-medium text-[#3d4642]">Validación de publicadores</span>
            </div>
            <div className="flex items-center gap-3 sm:gap-4">
              {signOutError && (
                <p aria-live="polite" className="text-xs text-[#b42318]" role="status">
                  {signOutError}
                </p>
              )}
              <div className="hidden h-6 border-l border-[#e5e9e7] sm:block" />
              <div className="grid size-7 place-items-center rounded-full bg-[#eef2f1] text-[12px] font-medium text-[#147bc3]">
                {user?.name
                  .split(' ')
                  .map((part) => part[0])
                  .join('')}
              </div>
              <div className="hidden leading-tight sm:block">
                <p className="text-[13px] font-semibold text-[#303936]">{user?.name}</p>
                <p className="text-[11px] text-[#7b8581]">{user?.role}</p>
              </div>
              <button
                aria-label="Cerrar sesión"
                className="ml-1 text-[#74807b] hover:text-[#147bc3] lg:hidden"
                onClick={handleSignOut}
                type="button"
              >
                <LogOut aria-hidden="true" size={16} />
              </button>
            </div>
          </div>
        </header>

        <div className="min-w-0 flex-1">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

export default DashboardLayout
