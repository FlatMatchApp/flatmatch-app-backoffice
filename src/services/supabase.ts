import type { SupabaseClient } from '@supabase/supabase-js'

let supabaseClientPromise: Promise<SupabaseClient> | null = null

export function getSupabaseClient(): Promise<SupabaseClient> {
  if (supabaseClientPromise) {
    return supabaseClientPromise
  }

  const supabaseUrl = import.meta.env.EXPO_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = import.meta.env.EXPO_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'No pudimos iniciar sesión en este momento. Inténtalo nuevamente más tarde.',
    )
  }

  supabaseClientPromise = import('@supabase/supabase-js')
    .then(({ createClient }) => createClient(supabaseUrl, supabaseAnonKey))
    .catch((error: unknown) => {
      supabaseClientPromise = null
      throw new Error(
        'No pudimos iniciar sesión en este momento. Inténtalo nuevamente más tarde.',
        { cause: error },
      )
    })

  return supabaseClientPromise
}
