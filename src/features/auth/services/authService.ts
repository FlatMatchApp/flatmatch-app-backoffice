import type { AdminUser } from '@/features/auth/types/auth.types'

const SESSION_KEY = 'flatmatch.mock-admin'

export async function login(email: string, password: string): Promise<AdminUser> {
  if (!email.trim() || !password) {
    throw new Error('Ingresa tu correo electrónico y contraseña.')
  }

  const user: AdminUser = {
    name: 'Mariana López',
    email: email.trim(),
    role: 'Administradora',
  }

  sessionStorage.setItem(SESSION_KEY, JSON.stringify(user))
  return user
}

export function getCurrentUser(): AdminUser | null {
  const storedUser = sessionStorage.getItem(SESSION_KEY)

  if (!storedUser) {
    return null
  }

  try {
    const user: unknown = JSON.parse(storedUser)

    if (
      typeof user === 'object' &&
      user !== null &&
      'name' in user &&
      'email' in user &&
      'role' in user &&
      typeof user.name === 'string' &&
      typeof user.email === 'string' &&
      typeof user.role === 'string'
    ) {
      return {
        name: user.name,
        email: user.email,
        role: user.role,
      }
    }
  } catch {
    sessionStorage.removeItem(SESSION_KEY)
  }

  return null
}

export function logout(): void {
  sessionStorage.removeItem(SESSION_KEY)
}
