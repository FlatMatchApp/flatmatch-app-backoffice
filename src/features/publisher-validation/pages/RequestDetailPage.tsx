import { useState } from 'react'
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  CircleCheck,
  Clock3,
  ClipboardList,
  History,
  X,
} from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import ApplicantInformation from '@/features/publisher-validation/components/ApplicantInformation'
import ApproveRequestModal from '@/features/publisher-validation/components/ApproveRequestModal'
import DocumentsViewer from '@/features/publisher-validation/components/DocumentsViewer'
import RejectRequestModal from '@/features/publisher-validation/components/RejectRequestModal'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { usePublisherRequestDetail } from '@/features/publisher-validation/hooks/usePublisherRequestDetail'
import {
  getApplicantDetails,
  getRequestDocuments,
  resolvePublisherRequest,
} from '@/features/publisher-validation/services/publisherValidationService'
import type {
  PublisherRequest,
  PublisherRequestStatus,
} from '@/features/publisher-validation/types/publisherValidation.types'

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(value))
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

function StatusBadge({ status }: { status: PublisherRequestStatus }) {
  const styles: Record<PublisherRequestStatus, string> = {
    pending: 'bg-[#fff2e8] text-[#e86b0c]',
    approved: 'bg-[#eaf6ed] text-[#26793a]',
    rejected: 'bg-[#fff0f0] text-[#d92727]',
  }
  const labels: Record<PublisherRequestStatus, string> = {
    pending: 'Pendiente',
    approved: 'Aprobada',
    rejected: 'Rechazada',
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[10px] font-semibold ${styles[status]}`}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {labels[status]}
    </span>
  )
}

function RequestDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const { request, isLoading, error, updateRequest } =
    usePublisherRequestDetail(id)
  const [dialog, setDialog] = useState<'approve' | 'reject' | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [decisionError, setDecisionError] = useState<string | null>(null)

  async function saveDecision(
    status: 'approved' | 'rejected',
    reason: string,
    category?: string,
  ) {
    if (!request) {
      return
    }

    setIsSubmitting(true)
    setDecisionError(null)

    try {
      const updatedRequest = await resolvePublisherRequest(request.id, {
        status,
        responsible: user?.name ?? 'Administradora',
        reason,
        ...(category ? { category } : {}),
      })
      updateRequest(updatedRequest)
      setDialog(null)
    } catch (caughtError) {
      setDecisionError(
        caughtError instanceof Error
          ? caughtError.message
          : 'No se pudo guardar la resolución. Intenta nuevamente.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <main className="grid min-h-[60vh] place-items-center text-sm text-[#7b8581]">
        Cargando solicitud…
      </main>
    )
  }

  if (error || !request) {
    return (
      <main className="grid min-h-[60vh] place-items-center px-4 text-center">
        <div>
          <h1 className="text-lg font-medium text-[#303936]">
            No se pudo abrir la solicitud
          </h1>
          <p className="mt-1 text-sm text-[#7b8581]">
            {error ?? 'No se encontró la solicitud.'}
          </p>
          <Link
            className="mt-4 inline-flex text-sm font-semibold text-[#147bc3] hover:underline"
            to="/requests"
          >
            Volver a solicitudes
          </Link>
        </div>
      </main>
    )
  }

  const applicantDetails = getApplicantDetails(request)
  const documents = getRequestDocuments(request)
  const statusNotice =
    request.status === 'approved'
      ? {
          className: 'bg-[#eaf6ef] text-[#26793a]',
          title: 'Solicitud aprobada. Publicador habilitado.',
          description: `${request.applicantName} ya puede publicar inmuebles. Se enviará una notificación a su correo.`,
          icon: <CheckCircle2 aria-hidden="true" size={18} />,
        }
      : request.status === 'rejected'
        ? {
            className: 'bg-[#fff0f0] text-[#c62828]',
            title: 'Solicitud rechazada.',
            description:
              'El solicitante recibirá el motivo de rechazo registrado en la resolución.',
            icon: <X aria-hidden="true" size={18} />,
          }
        : null

  return (
    <>
      <main className="mx-auto w-full max-w-[1440px] px-4 py-5 sm:px-6 lg:px-7 lg:py-7">
        <Link
          className="inline-flex items-center gap-2 text-[10px] font-medium text-[#147bc3] hover:underline"
          to="/requests"
        >
          <ArrowLeft aria-hidden="true" size={16} />
          Volver a solicitudes
        </Link>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#eaf0ee] text-xs font-medium text-[#147bc3]">
              {getInitials(request.applicantName)}
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-xl font-medium tracking-tight text-[#303936] sm:text-[22px]">
                  {request.applicantName}
                </h1>
                <StatusBadge status={request.status} />
              </div>
              <p className="mt-1 text-[9px] text-[#7b8581] sm:text-[10px]">
                Solicitud {request.id} · {request.publisherType} ·{' '}
                {formatDateTime(request.submittedAt)} h
              </p>
            </div>
          </div>
          <Link
            className="inline-flex h-9 items-center gap-2 rounded-md border border-[#dfe5e2] bg-white px-3 text-[10px] font-semibold text-[#3d4642] shadow-sm hover:bg-[#f8faf9]"
            to={`/requests/${request.id}/history`}
          >
            <History aria-hidden="true" size={14} />
            Ver historial
          </Link>
        </div>

        {statusNotice && (
          <div
            className={`mt-4 flex items-start gap-2.5 rounded-md px-3.5 py-3 ${statusNotice.className}`}
            role="status"
          >
            <span className="mt-0.5 shrink-0">{statusNotice.icon}</span>
            <div>
              <p className="text-[11px] font-semibold">{statusNotice.title}</p>
              <p className="mt-0.5 text-[10px] leading-4">
                {statusNotice.description}
              </p>
            </div>
          </div>
        )}

        <div className="mt-4 grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
          <div className="space-y-4">
            <ApplicantInformation
              details={applicantDetails}
              request={request}
            />
            <DocumentsViewer
              applicantName={request.applicantName}
              documents={documents}
              submittedAt={request.submittedAt}
            />
          </div>

          <aside className="space-y-4">
            {request.status === 'pending' ? (
              <section className="overflow-hidden rounded-lg border border-[#e1e6e3] bg-white">
                <header className="border-b border-[#e7ebe9] px-4 py-3.5">
                  <h2 className="text-sm font-medium text-[#303936]">
                    Resolver solicitud
                  </h2>
                </header>
                <div className="p-4">
                  <p className="flex items-center gap-2 text-[10px] font-semibold text-[#147bc3]">
                    <Clock3 aria-hidden="true" size={15} />
                    Esperando revisión
                  </p>
                  <p className="mt-3 text-[10px] leading-4 text-[#7b8581]">
                    Verifica la identidad y la vigencia de los documentos antes
                    de resolver.
                  </p>
                  {decisionError && (
                    <p
                      className="mt-3 rounded-md bg-[#fff0f0] px-3 py-2 text-[10px] text-[#b42318]"
                      role="alert"
                    >
                      {decisionError}
                    </p>
                  )}
                  <div className="mt-4 space-y-2">
                    <button
                      className="flex h-9 w-full items-center justify-center gap-2 rounded-md bg-[#147bc3] text-[10px] font-semibold text-white hover:bg-[#116eae]"
                      onClick={() => {
                        setDecisionError(null)
                        setDialog('approve')
                      }}
                      type="button"
                    >
                      <Check aria-hidden="true" size={14} />
                      Aprobar solicitud
                    </button>
                    <button
                      className="flex h-9 w-full items-center justify-center gap-2 rounded-md border border-[#f2c5c5] bg-white text-[10px] font-semibold text-[#c62828] hover:bg-[#fff7f7]"
                      onClick={() => {
                        setDecisionError(null)
                        setDialog('reject')
                      }}
                      type="button"
                    >
                      <X aria-hidden="true" size={14} />
                      Rechazar solicitud
                    </button>
                  </div>
                  <p className="mt-4 text-[9px] leading-4 text-[#89938f]">
                    La decisión se registrará en el historial y se notificará
                    al solicitante.
                  </p>
                </div>
              </section>
            ) : (
              <ResolutionCard request={request} />
            )}

            <section className="overflow-hidden rounded-lg border border-[#e1e6e3] bg-white">
              <header className="border-b border-[#e7ebe9] px-4 py-3.5">
                <h2 className="text-sm font-medium text-[#303936]">
                  Control de documentación
                </h2>
              </header>
              <ul className="space-y-3 px-4 py-4">
                {[
                  'Identidad legible y coincidente',
                  'Información de contacto completa',
                  'Documentación presentada para revisión',
                ].map((check) => (
                  <li
                    className="flex items-start gap-2 text-[10px] text-[#4c5751]"
                    key={check}
                  >
                    <CircleCheck
                      aria-hidden="true"
                      className="shrink-0 text-[#147bc3]"
                      size={14}
                    />
                    {check}
                  </li>
                ))}
              </ul>
            </section>

            <p className="flex items-start gap-2 px-1 text-[9px] leading-4 text-[#89938f]">
              <ClipboardList
                aria-hidden="true"
                className="mt-0.5 shrink-0"
                size={14}
              />
              Cada resolución conserva su fecha, responsable y motivo en el
              historial.
            </p>
          </aside>
        </div>

        <p className="mt-6 text-[9px] text-[#89938f]">
          Todos los horarios corresponden a Argentina (UTC−3).
        </p>
      </main>

      {dialog === 'approve' && (
        <ApproveRequestModal
          error={decisionError}
          isSubmitting={isSubmitting}
          onClose={() => setDialog(null)}
          onConfirm={(reason) => void saveDecision('approved', reason)}
          request={request}
          responsible={user?.name ?? 'Administradora'}
        />
      )}
      {dialog === 'reject' && (
        <RejectRequestModal
          error={decisionError}
          isSubmitting={isSubmitting}
          onClose={() => setDialog(null)}
          onConfirm={(category, reason) =>
            void saveDecision('rejected', reason, category)
          }
          request={request}
          responsible={user?.name ?? 'Administradora'}
        />
      )}
    </>
  )
}

function ResolutionCard({ request }: { request: PublisherRequest }) {
  const isApproved = request.status === 'approved'
  const resolution = request.resolution
  const defaultReason = isApproved
    ? 'Solicitud aprobada y publicador habilitado.'
    : 'La solicitud no cumple con los requisitos de validación.'

  return (
    <section className="overflow-hidden rounded-lg border border-[#e1e6e3] bg-white">
      <header className="border-b border-[#e7ebe9] px-4 py-3.5">
        <h2 className="text-sm font-medium text-[#303936]">
          Resolución registrada
        </h2>
      </header>
      <dl className="space-y-3.5 p-4">
        <ResolutionField
          label="Decisión"
          value={
            isApproved
              ? 'Aprobada · Publicador habilitado'
              : 'Rechazada'
          }
        />
        {resolution?.category && (
          <ResolutionField label="Categoría" value={resolution.category} />
        )}
        <ResolutionField
          label="Responsable"
          value={resolution?.responsible ?? 'Mariana López'}
        />
        <ResolutionField
          label="Fecha de resolución"
          value={
            resolution
              ? `${formatDateTime(resolution.resolvedAt)} h (UTC−3)`
              : 'Registro de demostración'
          }
        />
        <ResolutionField
          label={isApproved ? 'Motivo de aprobación' : 'Motivo del rechazo'}
          value={resolution?.reason ?? defaultReason}
        />
      </dl>
    </section>
  )
}

function ResolutionField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[9px] text-[#89938f]">{label}</dt>
      <dd className="mt-1 break-words text-[10px] font-medium leading-4 text-[#3d4642]">
        {value}
      </dd>
    </div>
  )
}

export default RequestDetailPage
