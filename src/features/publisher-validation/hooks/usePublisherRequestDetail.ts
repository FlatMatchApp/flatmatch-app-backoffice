import { useEffect, useState } from 'react'
import { getPublisherRequest } from '@/features/publisher-validation/services/publisherValidationService'
import type { PublisherRequest } from '@/features/publisher-validation/types/publisherValidation.types'

export function usePublisherRequestDetail(requestId: string | undefined) {
  const [state, setState] = useState<{
    requestId: string | undefined
    request: PublisherRequest | null
    isLoading: boolean
    error: string | null
  }>({
    requestId: undefined,
    request: null,
    isLoading: true,
    error: null,
  })

  useEffect(() => {
    let isMounted = true

    if (!requestId) {
      Promise.resolve().then(() => {
        if (isMounted) {
          setState({
            requestId,
            request: null,
            isLoading: false,
            error: 'No se indicó el número de solicitud.',
          })
        }
      })
      return
    }

    getPublisherRequest(requestId)
      .then((request) => {
        if (isMounted) {
          setState({
            requestId,
            request,
            isLoading: false,
            error: null,
          })
        }
      })
      .catch((caughtError: unknown) => {
        if (isMounted) {
          setState({
            requestId,
            request: null,
            isLoading: false,
            error:
              caughtError instanceof Error
                ? caughtError.message
                : 'No se pudo cargar el detalle de la solicitud.',
          })
        }
      })

    return () => {
      isMounted = false
    }
  }, [requestId])

  function updateRequest(updatedRequest: PublisherRequest) {
    setState({
      requestId: updatedRequest.id,
      request: updatedRequest,
      isLoading: false,
      error: null,
    })
  }

  const isCurrentRequest = state.requestId === requestId

  return {
    request: isCurrentRequest ? state.request : null,
    isLoading: !isCurrentRequest || state.isLoading,
    error: isCurrentRequest ? state.error : null,
    updateRequest,
  }
}
