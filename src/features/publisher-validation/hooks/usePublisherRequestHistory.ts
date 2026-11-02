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

    getPublisherRequestHistory(requestId)
      .then((events) => {
        if (isMounted) {
          setState({ requestId, events, isLoading: false, error: null })
        }
      })
      .catch(() => {
        if (isMounted) {
          setState({
            requestId,
            events: [],
            isLoading: false,
            error: 'No se pudo cargar el historial. Intenta nuevamente.',
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
    isLoading: !isCurrentHistory || state.isLoading,
    error: isCurrentHistory ? state.error : null,
  }
}
