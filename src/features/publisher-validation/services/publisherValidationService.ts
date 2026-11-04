import { apiRequest } from '@/services/api'
import type {
  PublisherRequest,
  PublisherRequestStatus,
  PublisherValidationApprovalResponse,
  PublisherValidationHistoryResponse,
  PublisherValidationRejectionResponse,
  PublisherValidationRequestDetailResponse,
  PublisherValidationRequestListResponse,
  PublisherValidationRequestResponse,
  RequestHistoryEvent,
} from '@/features/publisher-validation/types/publisherValidation.types'

const requestsPath = '/backoffice/publisher-validation-requests'
const apiPageSize = 100

function mapRequest(
  request: PublisherValidationRequestResponse,
): PublisherRequest {
  return {
    id: request.id,
    userId: request.user_id,
    applicantName: request.applicant_name?.trim() || 'Sin nombre informado',
    requestedAt: request.requested_at,
    status: request.status,
    reviewedAt: request.reviewed_at,
    reviewedByAdminId: request.reviewed_by_admin_id ?? null,
    rejectionReason: request.rejection_reason ?? null,
  }
}

function mapDetail(
  response: PublisherValidationRequestDetailResponse,
): PublisherRequest {
  const request = mapRequest(response)
  const profile = response.profile

  return {
    ...request,
    applicantName:
      response.applicant_name?.trim() ||
      [profile?.first_name, profile?.last_name].filter(Boolean).join(' ') ||
      profile?.agency_name ||
      'Sin nombre informado',
    profile: profile
      ? {
          publisherType: profile.publisher_type,
          firstName: profile.first_name,
          lastName: profile.last_name,
          phone: profile.phone,
          address: profile.address,
          agencyName: profile.agency_name,
          agencyTaxId: profile.agency_tax_id,
        }
      : null,
    missingRequiredFields: response.missing_required_fields,
  }
}

async function fetchRequestPage(
  status: PublisherRequestStatus | undefined,
  limit: number,
  offset: number,
): Promise<PublisherValidationRequestListResponse> {
  const query = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
  })
  if (status) {
    query.set('status', status)
  }

  return apiRequest(`${requestsPath}?${query.toString()}`)
}

export async function getPublisherRequests(
  status: PublisherRequestStatus | undefined,
  limit: number,
  offset: number,
): Promise<{ items: PublisherRequest[]; total: number }> {
  const response = await fetchRequestPage(status, limit, offset)
  return {
    items: response.items.map(mapRequest),
    total: response.total,
  }
}

export async function getAllPublisherRequests(
  status?: PublisherRequestStatus,
): Promise<PublisherRequest[]> {
  const items: PublisherRequest[] = []
  let offset = 0

  while (true) {
    const response = await fetchRequestPage(status, apiPageSize, offset)
    items.push(...response.items.map(mapRequest))

    if (response.items.length === 0 && offset < response.total) {
      throw new Error(
        'No fue posible descargar todas las solicitudes. Inténtalo nuevamente.',
      )
    }

    offset += response.items.length
    if (offset >= response.total) {
      break
    }
  }

  return items
}

export async function getPublisherRequestCounts(): Promise<
  Record<'all' | PublisherRequestStatus, number>
> {
  const statuses: PublisherRequestStatus[] = ['pending', 'approved', 'rejected']
  const [all, ...filtered] = await Promise.all([
    fetchRequestPage(undefined, 1, 0),
    ...statuses.map((status) => fetchRequestPage(status, 1, 0)),
  ])

  return {
    all: all.total,
    pending: filtered[0].total,
    approved: filtered[1].total,
    rejected: filtered[2].total,
  }
}

export async function getPublisherRequest(
  requestId: string,
): Promise<PublisherRequest> {
  const response = await apiRequest<PublisherValidationRequestDetailResponse>(
    `${requestsPath}/${encodeURIComponent(requestId)}`,
  )
  return mapDetail(response)
}

export async function getPublisherRequestHistory(
  requestId: string,
): Promise<RequestHistoryEvent[]> {
  const response = await apiRequest<PublisherValidationHistoryResponse>(
    `${requestsPath}/${encodeURIComponent(requestId)}/history`,
  )
  return response.events.map((event) => ({
    id: event.id,
    requestId: event.request_id,
    previousStatus: event.previous_status,
    newStatus: event.new_status,
    actionAt: event.action_at,
    adminId: event.admin_id,
    rejectionReason: event.rejection_reason,
  }))
}

export async function approvePublisherRequest(
  requestId: string,
): Promise<PublisherRequest> {
  await apiRequest<PublisherValidationApprovalResponse>(
    `${requestsPath}/${encodeURIComponent(requestId)}/approve`,
    { method: 'POST' },
  )
  return getPublisherRequest(requestId)
}

export async function rejectPublisherRequest(
  requestId: string,
  reason: string,
): Promise<PublisherRequest> {
  const normalizedReason = reason.trim()
  if (normalizedReason.length < 3 || normalizedReason.length > 1000) {
    throw new Error('El motivo debe tener entre 3 y 1000 caracteres.')
  }

  await apiRequest<PublisherValidationRejectionResponse>(
    `${requestsPath}/${encodeURIComponent(requestId)}/reject`,
    {
      method: 'POST',
      body: { reason: normalizedReason },
    },
  )
  return getPublisherRequest(requestId)
}
