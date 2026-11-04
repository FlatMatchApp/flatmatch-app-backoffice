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
    throw new Error(
      'El servicio no está disponible en este momento. Inténtalo nuevamente más tarde.',
    )
  }

  const supabase = await getSupabaseClient()
  const { data, error } = await supabase.auth.getSession()
  if (error) {
    throw new Error('No pudimos verificar tu sesión. Inicia sesión nuevamente.', {
      cause: error,
    })
  }

  const accessToken = data.session?.access_token
  if (!accessToken) {
    throw new Error('Tu sesión venció. Inicia sesión nuevamente para continuar.')
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
        'La conexión está tardando más de lo esperado. Comprueba tu conexión e inténtalo nuevamente.',
        { cause: caughtError },
      )
    }

    throw new Error(
      'No pudimos conectar con el servicio. Comprueba tu conexión e inténtalo nuevamente.',
      { cause: caughtError },
    )
  }

  const responseText = await response.text()
  let responseBody: unknown = null
  if (responseText) {
    try {
      responseBody = JSON.parse(responseText)
    } catch (caughtError) {
      throw new Error(
        'Recibimos una respuesta inesperada. Inténtalo nuevamente más tarde.',
        { cause: caughtError },
      )
    }
  }

  if (!response.ok) {
    const message =
      response.status === 401
        ? 'Tu sesión venció. Inicia sesión nuevamente.'
        : response.status === 403
          ? 'No tienes permiso para realizar esta acción.'
          : response.status === 404
            ? 'No encontramos la información solicitada. Actualiza la página e inténtalo nuevamente.'
            : response.status === 409
              ? 'La información cambió. Actualiza la página e inténtalo nuevamente.'
              : response.status === 429
                ? 'Hay demasiados intentos. Espera un momento e inténtalo nuevamente.'
                : response.status >= 500
                  ? 'El servicio no está disponible en este momento. Inténtalo nuevamente más tarde.'
                  : 'No pudimos completar la solicitud. Revisa la información e inténtalo nuevamente.'
    throw new Error(message)
  }

  return responseBody as T
}
