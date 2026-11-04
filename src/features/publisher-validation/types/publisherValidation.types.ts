export type PublisherRequestStatus = 'pending' | 'approved' | 'rejected'

export type PublisherProfile = {
  publisherType: string | null
  firstName: string | null
  lastName: string | null
  phone: string | null
  address: string | null
  agencyName: string | null
  agencyTaxId: string | null
}

export type PublisherRequest = {
  id: string
  userId: string
  applicantName: string
  requestedAt: string
  status: PublisherRequestStatus
  reviewedAt: string | null
  reviewedByAdminId: string | null
  rejectionReason: string | null
  profile?: PublisherProfile | null
  missingRequiredFields?: string[]
}

export type PublisherValidationRequestListResponse = {
  items: PublisherValidationRequestResponse[]
  total: number
  limit: number
  offset: number
}

export type PublisherValidationRequestResponse = {
  id: string
  user_id: string
  applicant_name: string | null
  requested_at: string
  status: PublisherRequestStatus
  reviewed_at: string | null
  reviewed_by_admin_id?: string | null
  rejection_reason?: string | null
}

export type PublisherValidationRequestDetailResponse =
  PublisherValidationRequestResponse & {
    profile: {
      publisher_type: string | null
      first_name: string | null
      last_name: string | null
      phone: string | null
      address: string | null
      agency_name: string | null
      agency_tax_id: string | null
    } | null
    missing_required_fields: string[]
  }

export type PublisherValidationHistoryEventResponse = {
  id: string
  request_id: string
  previous_status: PublisherRequestStatus
  new_status: PublisherRequestStatus
  action_at: string
  admin_id: string | null
  rejection_reason: string | null
}

export type PublisherValidationHistoryResponse = {
  request_id: string
  events: PublisherValidationHistoryEventResponse[]
  message: string
}

export type PublisherValidationApprovalResponse = {
  request_id: string
  user_id: string
  status: 'approved'
  reviewed_at: string
  reviewed_by_admin_id: string
  message: string
}

export type PublisherValidationRejectionResponse = {
  request_id: string
  user_id: string
  status: 'rejected'
  rejection_reason: string
  reviewed_at: string
  reviewed_by_admin_id: string
  message: string
}

export type RequestHistoryEvent = {
  id: string
  requestId: string
  previousStatus: PublisherRequestStatus
  newStatus: PublisherRequestStatus
  actionAt: string
  adminId: string | null
  rejectionReason: string | null
}
