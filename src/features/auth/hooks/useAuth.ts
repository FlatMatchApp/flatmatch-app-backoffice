import { useContext } from 'react'
import { AuthContext } from '@/features/auth/context/AuthContext'

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error(
      'No se pudo acceder a tu sesión. Actualiza la página e inténtalo nuevamente.',
    )
  }

  return context
}
