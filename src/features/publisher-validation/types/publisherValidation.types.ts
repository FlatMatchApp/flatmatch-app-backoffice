export type PublisherRequestStatus = 'pending' | 'approved' | 'rejected'

export type PublisherType = 'Corredor inmobiliario' | 'Propietario particular'

export type Resolution = {
  status: Exclude<PublisherRequestStatus, 'pending'>
  responsible: string
  resolvedAt: string
  reason: string
  category?: string
}

export type PublisherRequest = {
  id: string
  applicantName: string
  email: string
  publisherType: PublisherType
  submittedAt: string
  status: PublisherRequestStatus
  resolution?: Resolution
}

export type PublisherRequestDecision = {
  status: Exclude<PublisherRequestStatus, 'pending'>
  responsible: string
  reason: string
  category?: string
}

export type ApplicantDetails = {
  identityDocument: string
  taxId: string
  phone: string
  locality: string
  professionalLicense: string
}

export type RequestDocument = {
  id: string
  name: string
  size: string
  kind: 'identity-front' | 'identity-back' | 'license'
}

export type RequestHistoryEvent = {
  id: string
  requestId: string
  historyOwnerId?: string
  type: 'approved' | 'rejected' | 'reviewed' | 'submitted'
  title: string
  actor: string
  actorRole: string
  occurredAt: string
  description: string
}
