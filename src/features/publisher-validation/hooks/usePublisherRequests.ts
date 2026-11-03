import { useEffect, useState } from 'react'
import {
  getPublisherRequestCounts,
  getPublisherRequests,
} from '@/features/publisher-validation/services/publisherValidationService'
import type {
  PublisherRequest,
  PublisherRequestStatus,
} from '@/features/publisher-validation/types/publisherValidation.types'

export function usePublisherRequests(
  status: PublisherRequestStatus | undefined,
  page: number,
  pageSize: number,
) {
  const [refreshKey, setRefreshKey] = useState(0)
  const [state, setState] = useState<{
    queryKey: string | null
    requests: PublisherRequest[]
    total: number
    counts: Record<'all' | PublisherRequestStatus, number>
    isLoading: boolean
    error: string | null
  }>({
    queryKey: null,
    requests: [],
    total: 0,
    counts: { all: 0, pending: 0, approved: 0, rejected: 0 },
    isLoading: true,
    error: null,
  })

  useEffect(() => {
    let isMounted = true
    const queryKey = `${status ?? 'all'}:${page}:${pageSize}:${refreshKey}`

    Promise.all([
      getPublisherRequests(status, pageSize, (page - 1) * pageSize),
      getPublisherRequestCounts(),
    ])
      .then(([result, counts]) => {
        if (isMounted) {
          setState({
            queryKey,
            requests: result.items,
            total: result.total,
            counts,
            isLoading: false,
            error: null,
          })
        }
      })
      .catch((caughtError: unknown) => {
        if (isMounted) {
          setState((current) => ({
            ...current,
            queryKey,
            isLoading: false,
            error:
              caughtError instanceof Error
                ? caughtError.message
                : 'No se pudieron cargar las solicitudes. Intenta nuevamente.',
          }))
        }
      })

    return () => {
      isMounted = false
    }
  }, [page, pageSize, refreshKey, status])

  const isCurrentQuery =
    state.queryKey === `${status ?? 'all'}:${page}:${pageSize}:${refreshKey}`

  return {
    ...state,
    isLoading: !isCurrentQuery || state.isLoading,
    error: isCurrentQuery ? state.error : null,
    refresh: () => setRefreshKey((key) => key + 1),
  }
}
