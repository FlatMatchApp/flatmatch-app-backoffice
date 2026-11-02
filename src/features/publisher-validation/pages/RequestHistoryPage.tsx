import { useState } from 'react'
import {
  ArrowLeft,
  ArrowUpDown,
  Check,
  ChevronLeft,
  ChevronRight,
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

const pageSize = 7

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
  const [currentPage, setCurrentPage] = useState(1)

  const sortedEvents = mostRecentFirst
    ? events
    : [...events].reverse()
  const pageCount = Math.max(1, Math.ceil(events.length / pageSize))
  const visibleEvents = events.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  )

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
            <p className="mt-1 text-[13px] text-[#7b8581] sm:text-[13px]">
              Consulta las decisiones administrativas registradas.
            </p>
          </div>
          <button
            className="inline-flex h-9 items-center gap-2 rounded-md border border-[#dfe5e2] bg-white px-3 text-[13px] font-semibold text-[#3d4642] shadow-sm hover:bg-[#f8faf9]"
            onClick={() => exportHistory(events)}
            type="button"
          >
            <Download aria-hidden="true" size={14} />
            Exportar historial
          </button>
        </div>

        <section className="mt-5 overflow-hidden rounded-lg border border-[#e1e6e3] bg-white">
          <div className="overflow-x-auto">
            <div className="min-h-[440px] min-w-[620px]">
              <div className="grid grid-cols-[minmax(0,1.3fr)_minmax(100px,0.7fr)_minmax(110px,0.8fr)_minmax(90px,0.7fr)] gap-3 border-b border-[#e7ebe9] bg-[#fafbfb] px-4 py-3 text-[11px] font-medium text-[#74807b] sm:px-5">
                <span>Evento</span>
                <span>Solicitud</span>
                <span>Fecha</span>
                <span>Estado</span>
              </div>
              {visibleEvents.map((event) => (
                <Link
                  className="grid grid-cols-[minmax(0,1.3fr)_minmax(100px,0.7fr)_minmax(110px,0.8fr)_minmax(90px,0.7fr)] items-center gap-3 border-b border-[#e7ebe9] px-4 py-3 last:border-b-0 hover:bg-[#fafbfb] sm:px-5"
                  key={event.id}
                  to={`/requests/${event.historyOwnerId ?? event.requestId}/history`}
                >
                  <span className="min-w-0">
                    <span className="block truncate text-[12px] font-semibold text-[#3d4642]">
                      {event.title}
                    </span>
                    <span className="mt-1 block truncate text-[11px] text-[#89938f]">
                      {event.actor} · {event.actorRole}
                    </span>
                  </span>
                  <span className="text-[12px] text-[#3d4642]">{event.requestId}</span>
                  <span className="text-[11px] text-[#74807b]">
                    {formatTime(event.occurredAt)}
                  </span>
                  <span
                    className={`w-fit rounded-full px-2 py-1 text-[11px] font-semibold ${getStatusClass(
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
          <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-[#e7ebe9] px-4 py-2.5 sm:px-5">
            <p aria-live="polite" className="text-[11px] text-[#7b8581]">
              {events.length === 0
                ? 'No hay resoluciones para mostrar'
                : `Mostrando ${(currentPage - 1) * pageSize + 1}–${Math.min(
                    currentPage * pageSize,
                    events.length,
                  )} de ${events.length} resoluciones`}
            </p>
            <HistoryPagination
              currentPage={currentPage}
              onPageChange={setCurrentPage}
              pageCount={pageCount}
            />
          </footer>
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
        className="inline-flex items-center gap-2 text-[12px] font-medium text-[#147bc3] hover:underline"
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
          <p className="mt-1 text-[13px] text-[#7b8581] sm:text-[13px]">
            Decisiones y actividad administrativa asociadas al solicitante.
          </p>
        </div>
        <button
          className="inline-flex h-9 items-center gap-2 rounded-md border border-[#dfe5e2] bg-white px-3 text-[13px] font-semibold text-[#3d4642] shadow-sm hover:bg-[#f8faf9]"
          onClick={() => exportHistory(events)}
          type="button"
        >
          <Download aria-hidden="true" size={14} />
          Exportar historial
        </button>
      </div>

      <section className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#e1e6e3] bg-white px-4 py-3 sm:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#eaf0ee] text-[13px] font-medium text-[#147bc3]">
            {request.applicantName
              .split(' ')
              .map((part) => part[0])
              .slice(0, 2)
              .join('')
              .toUpperCase()}
          </span>
          <div className="min-w-0">
            <p className="truncate text-[13px] font-semibold text-[#303936]">
              {request.applicantName}
            </p>
            <p className="mt-0.5 truncate text-[11px] text-[#7b8581]">
              {request.email} · {request.id}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden border-r border-[#e5e9e7] pr-3 text-right sm:block">
            <p className="text-[10px] uppercase text-[#89938f]">Solicitud actual</p>
            <p className="mt-0.5 text-[12px] font-semibold text-[#3d4642]">
              {request.id}
            </p>
          </div>
          <span
            className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${getStatusClass(
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
              className="inline-flex shrink-0 items-center gap-1.5 text-[11px] text-[#7b8581] hover:text-[#3d4642]"
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
              <span className="text-[11px] text-[#89938f]">
                {Number(isApproved || isRejected) + Number(previousResolution)}
              </span>
            </header>
            <div className="divide-y divide-[#e7ebe9] px-4">
              <div className="py-3.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[12px] font-medium text-[#3d4642]">
                    {request.id}
                  </span>
                  <span
                    className={`rounded-full px-2 py-1 text-[11px] font-semibold ${getStatusClass(
                      request.status,
                    )}`}
                  >
                    {statusLabels[request.status]}
                  </span>
                </div>
                <p className="mt-2 text-[11px] text-[#89938f]">
                  {request.resolution
                    ? formatTime(request.resolution.resolvedAt)
                    : `Presentada ${formatTime(request.submittedAt)}`}
                </p>
                <p className="mt-1.5 text-[12px] font-medium text-[#4c5751]">
                  {request.resolution?.responsible ?? request.applicantName}
                </p>
                <p className="mt-1.5 text-[11px] leading-4 text-[#89938f]">
                  {request.resolution?.reason ??
                    'Solicitud pendiente de resolución administrativa.'}
                </p>
              </div>

              {previousResolution && (
                <div className="py-3.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[12px] font-medium text-[#3d4642]">
                      SOL-1031
                    </span>
                    <span
                      className={`rounded-full px-2 py-1 text-[11px] font-semibold ${getStatusClass(
                        'rejected',
                      )}`}
                    >
                      Rechazada
                    </span>
                  </div>
                  <p className="mt-2 text-[11px] text-[#89938f]">
                    20 oct 2026 · 12:18 h
                  </p>
                  <p className="mt-1.5 text-[12px] font-medium text-[#4c5751]">
                    Diego Salvatierra
                  </p>
                  <p className="mt-1.5 text-[11px] leading-4 text-[#89938f]">
                    No se adjuntó la constancia de matrícula profesional.
                  </p>
                </div>
              )}
            </div>
          </section>

          <p className="flex items-start gap-2 px-1 text-[11px] leading-4 text-[#89938f]">
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

      <p className="mt-6 text-[11px] text-[#89938f]">
        Fechas y horarios en hora de Argentina (UTC−3).
      </p>
    </main>
  )
}

function HistoryPagination({
  currentPage,
  onPageChange,
  pageCount,
}: {
  currentPage: number
  onPageChange: (page: number) => void
  pageCount: number
}) {
  let pages: number[]

  if (pageCount <= 4) {
    pages = Array.from({ length: pageCount }, (_, index) => index + 1)
  } else if (currentPage <= 2) {
    pages = [1, 2, 3, pageCount]
  } else if (currentPage >= pageCount - 1) {
    pages = [1, pageCount - 2, pageCount - 1, pageCount]
  } else {
    pages = [1, currentPage - 1, currentPage, currentPage + 1, pageCount]
  }

  return (
    <nav aria-label="Paginación del historial" className="flex items-center gap-1">
      <button
        aria-label="Página anterior"
        className="flex h-7 items-center gap-1 rounded-md border border-[#e1e6e3] px-2 text-[11px] text-[#424b47] disabled:opacity-40"
        disabled={currentPage === 1}
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        type="button"
      >
        <ChevronLeft aria-hidden="true" size={12} />
        <span className="hidden sm:inline">Anterior</span>
      </button>
      {pages.map((page, index) => (
        <span className="flex items-center gap-1" key={page}>
          {index > 0 && page - pages[index - 1] > 1 && (
            <span aria-hidden="true" className="px-1 text-[12px] text-[#7b8581]">
              …
            </span>
          )}
          <button
            aria-current={currentPage === page ? 'page' : undefined}
            className={`grid size-7 place-items-center rounded-md text-[11px] ${
              currentPage === page
                ? 'bg-[#e9eaff] font-semibold text-[#3e57c7]'
                : 'text-[#606b66] hover:bg-[#f2f4f3]'
            }`}
            onClick={() => onPageChange(page)}
            type="button"
          >
            {page}
          </button>
        </span>
      ))}
      <button
        aria-label="Página siguiente"
        className="flex h-7 items-center gap-1 rounded-md border border-[#e1e6e3] px-2 text-[11px] text-[#424b47] disabled:opacity-40"
        disabled={currentPage === pageCount}
        onClick={() => onPageChange(Math.min(pageCount, currentPage + 1))}
        type="button"
      >
        <span className="hidden sm:inline">Siguiente</span>
        <ChevronRight aria-hidden="true" size={12} />
      </button>
    </nav>
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
          <h3 className="text-[12px] font-semibold text-[#35403b]">
            {event.title}
          </h3>
          <time
            className="shrink-0 text-[10px] text-[#89938f]"
            dateTime={event.occurredAt}
          >
            {formatTime(event.occurredAt)}
          </time>
        </div>
        <p className="mt-1 text-[10px] text-[#89938f]">
          {event.actor} · {event.actorRole}
        </p>
        <p className="mt-1.5 text-[11px] leading-4 text-[#7b8581]">
          {event.description}
        </p>
      </div>
    </li>
  )
}

export default RequestHistoryPage
