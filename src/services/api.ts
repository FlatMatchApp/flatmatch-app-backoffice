import { getSupabaseClient } from '@/services/supabase'

const apiBaseUrl = import.meta.env.EXPO_PUBLIC_API_URL?.replace(/\/+$/, '')

type ApiRequestOptions = {
  method?: 'GET' | 'POST'
  body?: unknown
}

export async function apiRequest<T>(
  path: string,
  { method = 'GET', body }: ApiRequestOptions = {},
): Promise<T> {
  if (!apiBaseUrl) {
    throw new Error('Configura EXPO_PUBLIC_API_URL para conectar con el backend.')
  }

  const supabase = await getSupabaseClient()
  const { data, error } = await supabase.auth.getSession()
  if (error) {
    throw new Error('No se pudo recuperar la sesión de Supabase para la API.', {
      cause: error,
    })
  }

  const accessToken = data.session?.access_token
  if (!accessToken) {
    throw new Error('Inicia sesión nuevamente para continuar.')
  }

  let response: Response
  try {
    response = await fetch(`${apiBaseUrl}${path}`, {
      method,
      signal: AbortSignal.timeout(15_000),
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
        ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    })
  } catch (caughtError) {
    if (caughtError instanceof DOMException && caughtError.name === 'TimeoutError') {
      throw new Error(
        `La API no respondió en 15 segundos (${apiBaseUrl}). Verifica que el backend esté activo y que la URL sea accesible desde el navegador.`,
        { cause: caughtError },
      )
    }

    throw new Error(
      `No se pudo conectar con la API en ${apiBaseUrl}. Verifica que esté activa y permita CORS.`,
      { cause: caughtError },
    )
  }

  const responseText = await response.text()
  const responseBody: unknown = responseText ? JSON.parse(responseText) : null

  if (!response.ok) {
    const detail =
      typeof responseBody === 'object' &&
      responseBody !== null &&
      'detail' in responseBody
        ? responseBody.detail
        : null
    const message =
      typeof detail === 'string'
        ? detail
        : response.status === 401 || response.status === 403
          ? 'La sesión no es válida o no tiene permisos de administrador.'
          : `La API respondió con el estado ${response.status}.`
    throw new Error(message)
  }

  return responseBody as T
}
