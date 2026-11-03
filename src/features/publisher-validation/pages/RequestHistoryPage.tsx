import { useState } from 'react'
import { ArrowLeft, ChevronLeft, ChevronRight, Download } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { usePublisherRequestDetail } from '@/features/publisher-validation/hooks/usePublisherRequestDetail'
import { usePublisherRequestHistory } from '@/features/publisher-validation/hooks/usePublisherRequestHistory'
import type {
  PublisherRequestStatus,
  RequestHistoryEvent,
} from '@/features/publisher-validation/types/publisherValidation.types'

const pageSize = 7

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
  const header = [
    'Fecha',
    'Solicitud',
    'Estado anterior',
    'Estado nuevo',
    'ID administrador',
    'Motivo de rechazo',
  ]
  const rows = events.map((event) => [
    formatDateTime(event.actionAt),
    event.requestId,
    statusLabels[event.previousStatus],
    statusLabels[event.newStatus],
    event.adminId ?? '',
    event.rejectionReason ?? '',
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
  const link = document.createElement('a')
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
  const [currentPage, setCurrentPage] = useState(1)

  if (isRequestLoading || isHistoryLoading) {
    return (
      <main className="grid min-h-[60vh] place-items-center text-sm text-[#7b8581]">
        Cargando historial…
      </main>
    )
  }

  if (requestError || historyError || !request) {
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
            to="/requests"
          >
            Volver a solicitudes
          </Link>
        </div>
      </main>
    )
  }

  const pageCount = Math.max(1, Math.ceil(events.length / pageSize))
  const visibleEvents = events.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  )

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
            Historial de decisiones
          </h1>
          <p className="mt-1 text-[13px] text-[#7b8581]">
            Decisiones registradas por la administración para esta solicitud.
          </p>
        </div>
        <button
          className="inline-flex h-9 items-center gap-2 rounded-md border border-[#dfe5e2] bg-white px-3 text-[13px] font-semibold text-[#3d4642] shadow-sm hover:bg-[#f8faf9] disabled:opacity-50"
          disabled={events.length === 0}
          onClick={() => exportHistory(events)}
          type="button"
        >
          <Download aria-hidden="true" size={14} />
          Exportar historial
        </button>
      </div>

      <section className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#e1e6e3] bg-white px-4 py-3 sm:px-5">
        <div className="min-w-0">
          <p className="truncate text-[13px] font-semibold text-[#303936]">
            {request.applicantName}
          </p>
          <p className="mt-0.5 truncate text-[11px] text-[#7b8581]">
            Solicitud {request.id} · Usuario {request.userId}
          </p>
        </div>
        <span
          className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${getStatusClass(
            request.status,
          )}`}
        >
          {statusLabels[request.status]}
        </span>
      </section>

      <section className="mt-4 overflow-hidden rounded-lg border border-[#e1e6e3] bg-white">
        {events.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-[#7b8581]">
            La administración todavía no registró decisiones para esta solicitud.
          </p>
        ) : (
          <>
            <ol className="divide-y divide-[#e7ebe9]">
              {visibleEvents.map((event) => (
                <li className="px-4 py-4 sm:px-5" key={event.id}>
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-full px-2 py-1 text-[11px] font-semibold ${getStatusClass(
                          event.newStatus,
                        )}`}
                      >
                        {statusLabels[event.newStatus]}
                      </span>
                      <span className="text-[12px] text-[#7b8581]">
                        {statusLabels[event.previousStatus]} →{' '}
                        {statusLabels[event.newStatus]}
                      </span>
                    </div>
                    <time
                      className="text-[11px] text-[#89938f]"
                      dateTime={event.actionAt}
                    >
                      {formatDateTime(event.actionAt)} h
                    </time>
                  </div>
                  <p className="mt-2 text-[12px] text-[#4c5751]">
                    Administrador: {event.adminId ?? 'No disponible'}
                  </p>
                  {event.rejectionReason && (
                    <p className="mt-2 text-[12px] leading-5 text-[#7b8581]">
                      Motivo: {event.rejectionReason}
                    </p>
                  )}
                </li>
              ))}
            </ol>
            <footer className="flex items-center justify-between border-t border-[#e7ebe9] px-4 py-2.5 sm:px-5">
              <p className="text-[11px] text-[#7b8581]">
                Mostrando {(currentPage - 1) * pageSize + 1}–
                {Math.min(currentPage * pageSize, events.length)} de{' '}
                {events.length} eventos
              </p>
              <nav aria-label="Paginación del historial" className="flex gap-1">
                <button
                  aria-label="Página anterior"
                  className="grid size-7 place-items-center rounded border border-[#e1e6e3] disabled:opacity-40"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                  type="button"
                >
                  <ChevronLeft aria-hidden="true" size={14} />
                </button>
                <span className="px-2 self-center text-[11px] text-[#606b66]">
                  {currentPage} / {pageCount}
                </span>
                <button
                  aria-label="Página siguiente"
                  className="grid size-7 place-items-center rounded border border-[#e1e6e3] disabled:opacity-40"
                  disabled={currentPage === pageCount}
                  onClick={() =>
                    setCurrentPage((page) => Math.min(pageCount, page + 1))
                  }
                  type="button"
                >
                  <ChevronRight aria-hidden="true" size={14} />
                </button>
              </nav>
            </footer>
          </>
        )}
      </section>
    </main>
  )
}

export default RequestHistoryPage
