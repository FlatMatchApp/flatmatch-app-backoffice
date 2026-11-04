import { useEffect, useState } from 'react'
import { getPublisherRequestHistory } from '@/features/publisher-validation/services/publisherValidationService'
import type { RequestHistoryEvent } from '@/features/publisher-validation/types/publisherValidation.types'

export function usePublisherRequestHistory(requestId?: string) {
  const [state, setState] = useState<{
    requestId: string | undefined
    events: RequestHistoryEvent[]
    isLoading: boolean
    error: string | null
  }>({
    requestId: undefined,
    events: [],
    isLoading: true,
    error: null,
  })

  useEffect(() => {
    let isMounted = true

    if (!requestId) {
      return
    }

    getPublisherRequestHistory(requestId)
      .then((events) => {
        if (isMounted) {
          setState({ requestId, events, isLoading: false, error: null })
        }
      })
      .catch((caughtError: unknown) => {
        if (isMounted) {
          setState({
            requestId,
            events: [],
            isLoading: false,
            error:
              caughtError instanceof Error
                ? caughtError.message
                : 'No se pudo cargar el historial. Intenta nuevamente.',
          })
        }
      })

    return () => {
      isMounted = false
    }
  }, [requestId])

  const isCurrentHistory = state.requestId === requestId

  return {
    events: isCurrentHistory ? state.events : [],
    isLoading: Boolean(requestId) && (!isCurrentHistory || state.isLoading),
    error: !requestId
      ? 'No se indicó el número de solicitud.'
      : isCurrentHistory
        ? state.error
        : null,
  }
}
