import { useEffect, useState } from 'react'
import { getPublisherRequests } from '@/features/publisher-validation/services/publisherValidationService'
import type { PublisherRequest } from '@/features/publisher-validation/types/publisherValidation.types'

export function usePublisherRequests() {
  const [requests, setRequests] = useState<PublisherRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    getPublisherRequests()
      .then((result) => {
        if (isMounted) {
          setRequests(result)
        }
      })
      .catch(() => {
        if (isMounted) {
          setError('No se pudieron cargar las solicitudes. Intenta nuevamente.')
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [])

  return { requests, isLoading, error }
}
