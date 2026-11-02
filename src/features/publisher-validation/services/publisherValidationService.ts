import type {
  ApplicantDetails,
  PublisherRequest,
  PublisherRequestDecision,
  PublisherRequestStatus,
  PublisherType,
  RequestHistoryEvent,
  RequestDocument,
} from '@/features/publisher-validation/types/publisherValidation.types'

const STORAGE_KEY = 'flatmatch.mock-publisher-requests'

const initialRequests: PublisherRequest[] = [
  {
    id: 'SOL-1048',
    applicantName: 'Ana Martínez',
    email: 'ana.martinez@gmail.com',
    publisherType: 'Corredor inmobiliario',
    submittedAt: '2026-10-27T09:42:00',
    status: 'pending',
  },
  {
    id: 'SOL-1047',
    applicantName: 'Carlos Rodríguez',
    email: 'carlos.rodriguez@gmail.com',
    publisherType: 'Corredor inmobiliario',
    submittedAt: '2026-10-26T16:10:00',
    status: 'pending',
  },
  {
    id: 'SOL-1046',
    applicantName: 'Lucía Fernández',
    email: 'lucia.fernandez@gmail.com',
    publisherType: 'Propietario particular',
    submittedAt: '2026-10-26T11:25:00',
    status: 'pending',
  },
  {
    id: 'SOL-1045',
    applicantName: 'Martín Gómez',
    email: 'martin.gomez@gmail.com',
    publisherType: 'Corredor inmobiliario',
    submittedAt: '2026-10-25T14:38:00',
    status: 'approved',
  },
  {
    id: 'SOL-1044',
    applicantName: 'Valentina Ruiz',
    email: 'valentina.ruiz@gmail.com',
    publisherType: 'Propietario particular',
    submittedAt: '2026-10-24T10:05:00',
    status: 'approved',
  },
  {
    id: 'SOL-1043',
    applicantName: 'Diego Pérez',
    email: 'diego.perez@gmail.com',
    publisherType: 'Corredor inmobiliario',
    submittedAt: '2026-10-23T17:52:00',
    status: 'rejected',
    resolution: {
      status: 'rejected',
      responsible: 'Diego Salvatierra',
      resolvedAt: '2026-10-23T18:20:00',
      reason: 'No se adjuntó la constancia de matrícula profesional.',
      category: 'Documentación incompleta',
    },
  },
  {
    id: 'SOL-1042',
    applicantName: 'Sofía Torres',
    email: 'sofia.torres@gmail.com',
    publisherType: 'Propietario particular',
    submittedAt: '2026-10-22T08:31:00',
    status: 'approved',
  },
]

const sampleApplicants = [
  ['Joaquín Herrera', 'joaquin.herrera@gmail.com'],
  ['Camila Díaz', 'camila.diaz@gmail.com'],
  ['Mateo Silva', 'mateo.silva@gmail.com'],
  ['Florencia Castro', 'florencia.castro@gmail.com'],
  ['Tomás López', 'tomas.lopez@gmail.com'],
  ['Julieta Romero', 'julieta.romero@gmail.com'],
  ['Benjamín Acosta', 'benjamin.acosta@gmail.com'],
  ['Agustina Molina', 'agustina.molina@gmail.com'],
]

const publisherTypes: PublisherType[] = [
  'Corredor inmobiliario',
  'Propietario particular',
]

const generatedRequests: PublisherRequest[] = Array.from(
  { length: 49 },
  (_, index) => {
    const requestNumber = 1041 - index
    const [applicantName, email] =
      sampleApplicants[index % sampleApplicants.length]
    const date = new Date(Date.UTC(2026, 9, 21 - (index % 18)))
    const isoDate = date.toISOString().slice(0, 10)
    const hour = String(8 + (index % 10)).padStart(2, '0')
    const minute = String((index * 7) % 60).padStart(2, '0')
    let status: PublisherRequestStatus

    if (index < 9) {
      status = 'pending'
    } else if (index < 44) {
      status = 'approved'
    } else {
      status = 'rejected'
    }

    return {
      id: `SOL-${requestNumber}`,
      applicantName,
      email,
      publisherType: publisherTypes[index % publisherTypes.length],
      submittedAt: `${isoDate}T${hour}:${minute}:00`,
      status,
    }
  },
)

const defaultRequests = [...initialRequests, ...generatedRequests]
const invalidStatuses = new Set(['pending', 'approved', 'rejected'])

function isPublisherRequest(value: unknown): value is PublisherRequest {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  return (
    'id' in value &&
    typeof value.id === 'string' &&
    'applicantName' in value &&
    typeof value.applicantName === 'string' &&
    'email' in value &&
    typeof value.email === 'string' &&
    'publisherType' in value &&
    typeof value.publisherType === 'string' &&
    'submittedAt' in value &&
    typeof value.submittedAt === 'string' &&
    'status' in value &&
    typeof value.status === 'string' &&
    invalidStatuses.has(value.status)
  )
}

function readStoredRequests(): PublisherRequest[] | null {
  const storedValue = localStorage.getItem(STORAGE_KEY)

  if (!storedValue) {
    return null
  }

  const parsedValue: unknown = JSON.parse(storedValue)

  if (!Array.isArray(parsedValue) || !parsedValue.every(isPublisherRequest)) {
    throw new Error('Los datos simulados de solicitudes no tienen un formato válido.')
  }

  return parsedValue
}

function saveRequests(requests: PublisherRequest[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(requests))
}

export async function getPublisherRequests(): Promise<PublisherRequest[]> {
  return readStoredRequests() ?? defaultRequests
}

export async function getPublisherRequest(
  requestId: string,
): Promise<PublisherRequest | null> {
  const requests = readStoredRequests() ?? defaultRequests
  return requests.find((request) => request.id === requestId) ?? null
}

export async function getPublisherRequestHistory(
  requestId?: string,
): Promise<RequestHistoryEvent[]> {
  const requests = readStoredRequests() ?? defaultRequests
  const matchingRequests = requestId
    ? requests.filter((request) => request.id === requestId)
    : requests.filter(
        (request) => request.status !== 'pending' || request.resolution,
      )

  const events = matchingRequests.flatMap((request) => {
    const requestEvents: RequestHistoryEvent[] = [
      {
        id: `${request.id}-submitted`,
        requestId: request.id,
        type: 'submitted',
        title: `Nueva solicitud presentada · ${request.id}`,
        actor: request.applicantName,
        actorRole: 'Solicitante',
        occurredAt: request.submittedAt,
        description:
          'Presentó la documentación requerida para solicitar la habilitación como publicador.',
      },
    ]

    if (request.id === 'SOL-1048') {
      requestEvents.push({
        id: 'SOL-1048-previous-rejection',
        requestId: 'SOL-1031',
        historyOwnerId: request.id,
        type: 'rejected',
        title: 'Solicitud anterior rechazada · SOL-1031',
        actor: 'Diego Salvatierra',
        actorRole: 'Administrador',
        occurredAt: '2026-10-20T12:18:00',
        description:
          'No se adjuntó la constancia de matrícula profesional. Se solicitó presentar una nueva solicitud con el documento.',
      })
      requestEvents.push({
        id: 'SOL-1048-reviewed',
        requestId: request.id,
        type: 'reviewed',
        title: 'Revisión de documentación',
        actor: 'Mariana López',
        actorRole: 'Administradora',
        occurredAt: '2026-10-28T10:22:00',
        description:
          'Se revisaron el DNI y la matrícula profesional. Los datos coinciden con la información declarada.',
      })
    }

    if (request.resolution) {
      requestEvents.push({
        id: `${request.id}-resolution`,
        requestId: request.id,
        type: request.resolution.status,
        title:
          request.resolution.status === 'approved'
            ? 'Solicitud aprobada'
            : 'Solicitud rechazada',
        actor: request.resolution.responsible,
        actorRole: 'Administradora',
        occurredAt: request.resolution.resolvedAt,
        description: request.resolution.reason,
      })
    }

    return requestEvents
  })

  return events.sort(
    (first, second) =>
      new Date(second.occurredAt).getTime() -
      new Date(first.occurredAt).getTime(),
  )
}

export async function resolvePublisherRequest(
  requestId: string,
  decision: PublisherRequestDecision,
): Promise<PublisherRequest> {
  if (!decision.reason.trim()) {
    throw new Error('El motivo de la resolución es obligatorio.')
  }

  const requests = readStoredRequests() ?? defaultRequests
  const request = requests.find((item) => item.id === requestId)

  if (!request) {
    throw new Error('No se encontró la solicitud que intentas resolver.')
  }

  if (request.status !== 'pending') {
    throw new Error('Esta solicitud ya fue resuelta.')
  }

  const updatedRequest: PublisherRequest = {
    ...request,
    status: decision.status,
    resolution: {
      status: decision.status,
      responsible: decision.responsible,
      resolvedAt: new Date().toISOString(),
      reason: decision.reason.trim(),
      ...(decision.category ? { category: decision.category } : {}),
    },
  }

  saveRequests(
    requests.map((item) => (item.id === requestId ? updatedRequest : item)),
  )

  return updatedRequest
}

export function getApplicantDetails(request: PublisherRequest): ApplicantDetails {
  if (request.id === 'SOL-1048') {
    return {
      identityDocument: 'DNI 32.456.789',
      taxId: '27-32456789-4',
      phone: '+54 9 11 5482-9031',
      locality: 'Palermo, CABA',
      professionalLicense: 'CUCICBA · 7842',
    }
  }

  const number = request.id.replace(/\D/g, '').slice(-6)
  const sequence = Number(number) || 0

  return {
    identityDocument: `DNI ${String(28000000 + sequence).replace(/(\d)(?=(\d{3})+$)/g, '$1.')}`,
    taxId: `20-${28000000 + sequence}-${(sequence % 9) + 1}`,
    phone: '+54 9 11 4567-2380',
    locality: 'Palermo, CABA',
    professionalLicense:
      request.publisherType === 'Corredor inmobiliario'
        ? `CUCICBA · ${7000 + (sequence % 1000)}`
        : 'No aplica',
  }
}

export function getRequestDocuments(request: PublisherRequest): RequestDocument[] {
  return [
    { id: `${request.id}-dni-front`, name: 'DNI - Frente', size: '1,2 MB', kind: 'identity-front' },
    { id: `${request.id}-dni-back`, name: 'DNI - Dorso', size: '980 KB', kind: 'identity-back' },
    {
      id: `${request.id}-license`,
      name:
        request.publisherType === 'Corredor inmobiliario'
          ? 'Matrícula profesional'
          : 'Comprobante de domicilio',
      size: '842 KB',
      kind: 'license',
    },
  ]
}
