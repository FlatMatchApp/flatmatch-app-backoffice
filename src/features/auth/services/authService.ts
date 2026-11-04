import type { AdminUser } from '@/features/auth/types/auth.types'
import type { User } from '@supabase/supabase-js'
import { apiRequest } from '@/services/api'
import { getSupabaseClient } from '@/services/supabase'

type CurrentUserResponse = {
  roles: string[]
}

export async function login(email: string, password: string): Promise<AdminUser> {
  if (!email.trim() || !password) {
    throw new Error('Ingresa tu correo electrónico y contraseña.')
  }

  const supabase = await getSupabaseClient()
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  })

  if (error) {
    throw new Error(getLoginErrorMessage(error.message), { cause: error })
  }

  if (!data.user) {
    throw new Error('No pudimos iniciar sesión. Inténtalo nuevamente.')
  }

  try {
    return await getAdminUser(data.user)
  } catch (caughtError) {
    if (caughtError instanceof Error) {
      throw caughtError
    }

    throw new Error('No pudimos verificar los permisos de tu cuenta.', {
      cause: caughtError,
    })
  }
}

export async function logout(): Promise<void> {
  const supabase = await getSupabaseClient()
  const { error } = await supabase.auth.signOut()
  if (error) {
    throw new Error('No pudimos cerrar tu sesión. Inténtalo nuevamente.', {
      cause: error,
    })
  }
}

export async function getAdminUser(user: User): Promise<AdminUser> {
  try {
    const profile = await apiRequest<CurrentUserResponse>('/me')
    if (
      !profile ||
      !Array.isArray(profile.roles) ||
      !profile.roles.every((role) => typeof role === 'string')
    ) {
      throw new Error(
        'No pudimos verificar los permisos de tu cuenta. Inténtalo nuevamente.',
      )
    }

    if (!profile.roles.includes('admin')) {
      throw new Error(
        'Tu cuenta no tiene permiso para acceder a este panel. Contacta a un administrador.',
      )
    }

    return toAdminUser(user, profile.roles)
  } catch (error) {
    try {
      await logout()
    } catch (logoutError) {
      throw new Error(
        'No pudimos completar la verificación de acceso. Cierra sesión e inténtalo nuevamente.',
        { cause: logoutError },
      )
    }

    throw error
  }
}

function getLoginErrorMessage(message: string): string {
  const normalizedMessage = message.toLowerCase()

  if (normalizedMessage.includes('invalid login credentials')) {
    return 'El correo electrónico o la contraseña no son correctos.'
  }

  if (normalizedMessage.includes('email not confirmed')) {
    return 'Confirma tu correo electrónico antes de iniciar sesión.'
  }

  if (normalizedMessage.includes('too many requests')) {
    return 'Hubo demasiados intentos. Espera un momento antes de volver a intentarlo.'
  }

  return 'No pudimos iniciar sesión. Verifica tus datos e inténtalo nuevamente.'
}

function toAdminUser(user: User, roles: string[]): AdminUser {
  const name =
    user.user_metadata.full_name ??
    user.user_metadata.name ??
    user.email?.split('@')[0] ??
    'Usuario'

  return {
    name: typeof name === 'string' ? name : 'Usuario',
    email: user.email ?? '',
    role: roles.join(', '),
  }
}
