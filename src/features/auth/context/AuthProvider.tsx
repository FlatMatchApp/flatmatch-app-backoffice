import { useState, type ReactNode } from 'react'
import { AuthContext } from '@/features/auth/context/AuthContext'
import {
  getCurrentUser,
  login,
  logout,
} from '@/features/auth/services/authService'
import type { AdminUser } from '@/features/auth/types/auth.types'

type AuthProviderProps = {
  children: ReactNode
}

function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AdminUser | null>(getCurrentUser)

  async function signIn(email: string, password: string) {
    const authenticatedUser = await login(email, password)
    setUser(authenticatedUser)
  }

  function signOut() {
    logout()
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: user !== null,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider
