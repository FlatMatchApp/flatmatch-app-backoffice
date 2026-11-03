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
      'Configura EXPO_PUBLIC_SUPABASE_URL y EXPO_PUBLIC_SUPABASE_ANON_KEY para iniciar sesión.',
    )
  }

  supabaseClientPromise = import('@supabase/supabase-js')
    .then(({ createClient }) => createClient(supabaseUrl, supabaseAnonKey))
    .catch((error: unknown) => {
      supabaseClientPromise = null
      throw error
    })

  return supabaseClientPromise
}
