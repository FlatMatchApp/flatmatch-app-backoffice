import { useEffect, useState, type ReactNode } from 'react'
import { AuthContext } from '@/features/auth/context/AuthContext'
import {
  login,
  logout,
  toAdminUser,
} from '@/features/auth/services/authService'
import type { AdminUser } from '@/features/auth/types/auth.types'
import { getSupabaseClient } from '@/services/supabase'

type AuthProviderProps = {
  children: ReactNode
}

function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AdminUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [authError, setAuthError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true
    let unsubscribe = () => {}

    async function initializeAuth() {
      const supabase = await getSupabaseClient()
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        if (!isMounted) {
          return
        }

        setUser(toAdminUser(session?.user ?? null))
        setAuthError(null)
        setIsLoading(false)
      })
      unsubscribe = () => subscription.unsubscribe()

      const { data, error } = await supabase.auth.getSession()
      if (error) {
        throw error
      }

      if (isMounted) {
        setUser(toAdminUser(data.session?.user ?? null))
        setAuthError(null)
        setIsLoading(false)
      }
    }

    void initializeAuth().catch((error: unknown) => {
      if (isMounted) {
        setAuthError(
          error instanceof Error
            ? error.message
            : 'No se pudo inicializar la autenticación con Supabase.',
        )
        setIsLoading(false)
      }
    })

    return () => {
      isMounted = false
      unsubscribe()
    }
  }, [])

  async function signIn(email: string, password: string) {
    setAuthError(null)
    const authenticatedUser = await login(email, password)
    setUser(authenticatedUser)
  }

  async function signOut() {
    await logout()
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: user !== null,
        isLoading,
        authError,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider
