import { useState } from 'react'
import {
  ArrowLeft,
  ArrowUpDown,
  Check,
  Clock3,
  Download,
  FileCheck2,
  FileText,
  Plus,
  X,
} from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { usePublisherRequestDetail } from '@/features/publisher-validation/hooks/usePublisherRequestDetail'
import { usePublisherRequestHistory } from '@/features/publisher-validation/hooks/usePublisherRequestHistory'
import type {
  PublisherRequestStatus,
  RequestHistoryEvent,
} from '@/features/publisher-validation/types/publisherValidation.types'

const eventStyles: Record<
  RequestHistoryEvent['type'],
  { icon: typeof Check; className: string }
> = {
  approved: { icon: Check, className: 'bg-[#eaf6ed] text-[#31834a]' },
  rejected: { icon: X, className: 'bg-[#fff0f0] text-[#df4949]' },
  reviewed: { icon: FileText, className: 'bg-[#f0f3f2] text-[#718078]' },
  submitted: { icon: Plus, className: 'bg-[#f0f3f2] text-[#718078]' },
}

const statusLabels: Record<PublisherRequestStatus, string> = {
  pending: 'Pendiente',
  approved: 'Aprobada',
  rejected: 'Rechazada',
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'America/Argentina/Buenos_Aires',
  }).format(new Date(value))
}

function formatTime(value: string) {
  return `${formatDateTime(value)} h`
}

function getStatusClass(status: PublisherRequestStatus) {
  if (status === 'approved') {
    return 'bg-[#eaf6ed] text-[#26793a]'
  }
  if (status === 'rejected') {
    return 'bg-[#fff0f0] text-[#d92727]'
  }
  return 'bg-[#fff2e8] text-[#e86b0c]'
}

function exportHistory(events: RequestHistoryEvent[]) {
  const header = ['Fecha', 'Solicitud', 'Evento', 'Responsable', 'Rol', 'Detalle']
  const rows = events.map((event) => [
    formatTime(event.occurredAt),
    event.requestId,
    event.title,
    event.actor,
    event.actorRole,
    event.description,
  ])
  const csv = [header, ...rows]
    .map((row) =>
      row
        .map((value) => `"${value.replaceAll('"', '""')}"`)
        .join(','),
    )
    .join('\n')
  const blob = new Blob(['\uFEFF', csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = window.document.createElement('a')
  link.href = url
  link.download = 'historial-de-resoluciones.csv'
  link.click()
  URL.revokeObjectURL(url)
}

function RequestHistoryPage() {
  const { id } = useParams()
  const { request, isLoading: isRequestLoading, error: requestError } =
    usePublisherRequestDetail(id)
  const { events, isLoading: isHistoryLoading, error: historyError } =
    usePublisherRequestHistory(id)
  const [mostRecentFirst, setMostRecentFirst] = useState(true)

  const sortedEvents = mostRecentFirst
    ? events
    : [...events].reverse()

  if ((id && isRequestLoading) || isHistoryLoading) {
    return (
      <main className="grid min-h-[60vh] place-items-center text-sm text-[#7b8581]">
        Cargando historial…
      </main>
    )
  }

  if (historyError || (id && (requestError || !request))) {
    return (
      <main className="grid min-h-[60vh] place-items-center px-4 text-center">
        <div>
          <h1 className="text-lg font-medium text-[#303936]">
            No se pudo cargar el historial
          </h1>
          <p className="mt-1 text-sm text-[#7b8581]">
            {requestError ?? historyError ?? 'No se encontró la solicitud.'}
          </p>
          <Link
            className="mt-4 inline-flex text-sm font-semibold text-[#147bc3] hover:underline"
            to={id ? `/requests/${id}` : '/requests'}
          >
            Volver
          </Link>
        </div>
      </main>
    )
  }

  if (!id) {
    return (
      <main className="mx-auto w-full max-w-[1440px] px-4 py-5 sm:px-6 lg:px-7 lg:py-7">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-[22px] font-medium tracking-tight text-[#303936] sm:text-[24px]">
              Historial de resoluciones
            </h1>
            <p className="mt-1 text-[11px] text-[#7b8581] sm:text-xs">
              Consulta las decisiones administrativas registradas.
            </p>
          </div>
          <button
            className="inline-flex h-9 items-center gap-2 rounded-md border border-[#dfe5e2] bg-white px-3 text-[11px] font-semibold text-[#3d4642] shadow-sm hover:bg-[#f8faf9]"
            onClick={() => exportHistory(events)}
            type="button"
          >
            <Download aria-hidden="true" size={14} />
            Exportar historial
          </button>
        </div>

        <section className="mt-5 overflow-hidden rounded-lg border border-[#e1e6e3] bg-white">
          <div className="overflow-x-auto">
            <div className="min-w-[620px]">
              <div className="grid grid-cols-[minmax(0,1.3fr)_minmax(100px,0.7fr)_minmax(110px,0.8fr)_minmax(90px,0.7fr)] gap-3 border-b border-[#e7ebe9] bg-[#fafbfb] px-4 py-3 text-[9px] font-medium text-[#74807b] sm:px-5">
                <span>Evento</span>
                <span>Solicitud</span>
                <span>Fecha</span>
                <span>Estado</span>
              </div>
              {events.map((event) => (
                <Link
                  className="grid grid-cols-[minmax(0,1.3fr)_minmax(100px,0.7fr)_minmax(110px,0.8fr)_minmax(90px,0.7fr)] items-center gap-3 border-b border-[#e7ebe9] px-4 py-3 last:border-b-0 hover:bg-[#fafbfb] sm:px-5"
                  key={event.id}
                  to={`/requests/${event.historyOwnerId ?? event.requestId}/history`}
                >
                  <span className="min-w-0">
                    <span className="block truncate text-[10px] font-semibold text-[#3d4642]">
                      {event.title}
                    </span>
                    <span className="mt-1 block truncate text-[9px] text-[#89938f]">
                      {event.actor} · {event.actorRole}
                    </span>
                  </span>
                  <span className="text-[10px] text-[#3d4642]">{event.requestId}</span>
                  <span className="text-[9px] text-[#74807b]">
                    {formatTime(event.occurredAt)}
                  </span>
                  <span
                    className={`w-fit rounded-full px-2 py-1 text-[9px] font-semibold ${getStatusClass(
                      event.type === 'approved' || event.type === 'rejected'
                        ? event.type
                        : 'pending',
                    )}`}
                  >
                    {event.type === 'approved' || event.type === 'rejected'
                      ? statusLabels[event.type]
                      : event.type === 'reviewed'
                        ? 'Revisión'
                        : 'Presentada'}
                  </span>
                </Link>
              ))}
            </div>
          </div>
          {events.length === 0 && (
            <p className="px-5 py-10 text-center text-sm text-[#7b8581]">
              Todavía no hay resoluciones registradas.
            </p>
          )}
        </section>
      </main>
    )
  }

  if (!request) {
    return null
  }

  const isApproved = request.status === 'approved'
  const isRejected = request.status === 'rejected'
  const previousResolution = id === 'SOL-1048'

  return (
    <main className="mx-auto w-full max-w-[1440px] px-4 py-5 sm:px-6 lg:px-7 lg:py-7">
      <Link
        className="inline-flex items-center gap-2 text-[10px] font-medium text-[#147bc3] hover:underline"
        to={`/requests/${request.id}`}
      >
        <ArrowLeft aria-hidden="true" size={16} />
        Volver al detalle de la solicitud
      </Link>

      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-medium tracking-tight text-[#303936] sm:text-[24px]">
            Historial de resoluciones
          </h1>
          <p className="mt-1 text-[11px] text-[#7b8581] sm:text-xs">
            Decisiones y actividad administrativa asociadas al solicitante.
          </p>
        </div>
        <button
          className="inline-flex h-9 items-center gap-2 rounded-md border border-[#dfe5e2] bg-white px-3 text-[11px] font-semibold text-[#3d4642] shadow-sm hover:bg-[#f8faf9]"
          onClick={() => exportHistory(events)}
          type="button"
        >
          <Download aria-hidden="true" size={14} />
          Exportar historial
        </button>
      </div>

      <section className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#e1e6e3] bg-white px-4 py-3 sm:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#eaf0ee] text-xs font-medium text-[#147bc3]">
            {request.applicantName
              .split(' ')
              .map((part) => part[0])
              .slice(0, 2)
              .join('')
              .toUpperCase()}
          </span>
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-[#303936]">
              {request.applicantName}
            </p>
            <p className="mt-0.5 truncate text-[9px] text-[#7b8581]">
              {request.email} · {request.id}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden border-r border-[#e5e9e7] pr-3 text-right sm:block">
            <p className="text-[8px] uppercase text-[#89938f]">Solicitud actual</p>
            <p className="mt-0.5 text-[10px] font-semibold text-[#3d4642]">
              {request.id}
            </p>
          </div>
          <span
            className={`rounded-full px-2.5 py-1 text-[9px] font-semibold ${getStatusClass(
              request.status,
            )}`}
          >
            {statusLabels[request.status]}
          </span>
        </div>
      </section>

      <div className="mt-4 grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
        <section className="overflow-hidden rounded-lg border border-[#e1e6e3] bg-white">
          <header className="flex items-center justify-between gap-3 border-b border-[#e7ebe9] px-4 py-3.5 sm:px-5">
            <h2 className="text-sm font-medium text-[#303936]">
              Trazabilidad del solicitante
            </h2>
            <button
              className="inline-flex shrink-0 items-center gap-1.5 text-[9px] text-[#7b8581] hover:text-[#3d4642]"
              onClick={() => setMostRecentFirst((value) => !value)}
              type="button"
            >
              <ArrowUpDown aria-hidden="true" size={12} />
              {mostRecentFirst ? 'Más reciente primero' : 'Más antiguo primero'}
            </button>
          </header>

          {historyError ? (
            <p className="p-5 text-sm text-[#b42318]" role="alert">
              {historyError}
            </p>
          ) : events.length === 0 ? (
            <p className="p-8 text-center text-sm text-[#7b8581]">
              Todavía no hay actividad para esta solicitud.
            </p>
          ) : (
            <ol className="px-4 py-2 sm:px-5">
              {sortedEvents.map((event, index) => (
                <HistoryTimelineItem
                  event={event}
                  isLast={index === sortedEvents.length - 1}
                  key={event.id}
                />
              ))}
            </ol>
          )}
        </section>

        <div className="space-y-4">
          <section className="overflow-hidden rounded-lg border border-[#e1e6e3] bg-white">
            <header className="flex items-center justify-between border-b border-[#e7ebe9] px-4 py-3.5">
              <h2 className="text-sm font-medium text-[#303936]">
                Resoluciones del solicitante
              </h2>
              <span className="text-[9px] text-[#89938f]">
                {Number(isApproved || isRejected) + Number(previousResolution)}
              </span>
            </header>
            <div className="divide-y divide-[#e7ebe9] px-4">
              <div className="py-3.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-medium text-[#3d4642]">
                    {request.id}
                  </span>
                  <span
                    className={`rounded-full px-2 py-1 text-[9px] font-semibold ${getStatusClass(
                      request.status,
                    )}`}
                  >
                    {statusLabels[request.status]}
                  </span>
                </div>
                <p className="mt-2 text-[9px] text-[#89938f]">
                  {request.resolution
                    ? formatTime(request.resolution.resolvedAt)
                    : `Presentada ${formatTime(request.submittedAt)}`}
                </p>
                <p className="mt-1.5 text-[10px] font-medium text-[#4c5751]">
                  {request.resolution?.responsible ?? request.applicantName}
                </p>
                <p className="mt-1.5 text-[9px] leading-4 text-[#89938f]">
                  {request.resolution?.reason ??
                    'Solicitud pendiente de resolución administrativa.'}
                </p>
              </div>

              {previousResolution && (
                <div className="py-3.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-medium text-[#3d4642]">
                      SOL-1031
                    </span>
                    <span
                      className={`rounded-full px-2 py-1 text-[9px] font-semibold ${getStatusClass(
                        'rejected',
                      )}`}
                    >
                      Rechazada
                    </span>
                  </div>
                  <p className="mt-2 text-[9px] text-[#89938f]">
                    20 oct 2026 · 12:18 h
                  </p>
                  <p className="mt-1.5 text-[10px] font-medium text-[#4c5751]">
                    Diego Salvatierra
                  </p>
                  <p className="mt-1.5 text-[9px] leading-4 text-[#89938f]">
                    No se adjuntó la constancia de matrícula profesional.
                  </p>
                </div>
              )}
            </div>
          </section>

          <p className="flex items-start gap-2 px-1 text-[9px] leading-4 text-[#89938f]">
            <FileCheck2
              aria-hidden="true"
              className="mt-0.5 shrink-0"
              size={14}
            />
            Las nuevas solicitudes no reemplazan las decisiones anteriores del
            solicitante.
          </p>
        </div>
      </div>

      <p className="mt-6 text-[9px] text-[#89938f]">
        Fechas y horarios en hora de Argentina (UTC−3).
      </p>
    </main>
  )
}

function HistoryTimelineItem({
  event,
  isLast,
}: {
  event: RequestHistoryEvent
  isLast: boolean
}) {
  const { icon: EventIcon, className } = eventStyles[event.type]

  return (
    <li className="relative flex gap-3 py-3.5">
      {!isLast && (
        <span
          aria-hidden="true"
          className="absolute top-9 bottom-0 left-[11px] w-px bg-[#e5eae7]"
        />
      )}
      <span
        className={`relative z-10 grid size-[23px] shrink-0 place-items-center rounded-full ${className}`}
      >
        {event.type === 'reviewed' ? (
          <Clock3 aria-hidden="true" size={12} />
        ) : event.type === 'submitted' ? (
          <Plus aria-hidden="true" size={13} />
        ) : (
          <EventIcon aria-hidden="true" size={13} />
        )}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
          <h3 className="text-[10px] font-semibold text-[#35403b]">
            {event.title}
          </h3>
          <time
            className="shrink-0 text-[8px] text-[#89938f]"
            dateTime={event.occurredAt}
          >
            {formatTime(event.occurredAt)}
          </time>
        </div>
        <p className="mt-1 text-[8px] text-[#89938f]">
          {event.actor} · {event.actorRole}
        </p>
        <p className="mt-1.5 text-[9px] leading-4 text-[#7b8581]">
          {event.description}
        </p>
      </div>
    </li>
  )
}

export default RequestHistoryPage
