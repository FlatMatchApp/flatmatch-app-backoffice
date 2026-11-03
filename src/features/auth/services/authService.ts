import type { AdminUser } from '@/features/auth/types/auth.types'
import type { User } from '@supabase/supabase-js'
import { getSupabaseClient } from '@/services/supabase'

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
    throw new Error(error.message, { cause: error })
  }

  if (!data.user) {
    throw new Error('Supabase no devolvió un usuario para esta sesión.')
  }

  return toAdminUser(data.user)
}

export async function logout(): Promise<void> {
  const supabase = await getSupabaseClient()
  const { error } = await supabase.auth.signOut()
  if (error) {
    throw new Error(error.message, { cause: error })
  }
}

export function toAdminUser(user: User | null): AdminUser | null {
  if (!user) {
    return null
  }

  const name =
    user.user_metadata.full_name ??
    user.user_metadata.name ??
    user.email?.split('@')[0] ??
    'Usuario'
  const role = user.app_metadata.role

  return {
    name: typeof name === 'string' ? name : 'Usuario',
    email: user.email ?? '',
    role: typeof role === 'string' ? role : 'Cuenta autenticada',
  }
}
