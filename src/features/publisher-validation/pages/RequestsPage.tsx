import { useState, type ReactNode } from 'react'
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleX,
  Clock3,
  Download,
  ExternalLink,
  RefreshCw,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { usePublisherRequests } from '@/features/publisher-validation/hooks/usePublisherRequests'
import { getAllPublisherRequests } from '@/features/publisher-validation/services/publisherValidationService'
import type {
  PublisherRequest,
  PublisherRequestStatus,
} from '@/features/publisher-validation/types/publisherValidation.types'

type StatusFilter = 'all' | PublisherRequestStatus

const pageSize = 7

const statusLabels: Record<PublisherRequestStatus, string> = {
  pending: 'Pendiente',
  approved: 'Aprobada',
  rejected: 'Rechazada',
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'America/Argentina/Buenos_Aires',
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

function escapeCsv(value: string) {
  return `"${value.replaceAll('"', '""')}"`
}

function downloadCsv(requests: PublisherRequest[]) {
  const headers = [
    'Solicitante',
    'ID de solicitud',
    'ID de usuario',
    'Fecha de envío',
    'Estado',
  ]
  const rows = requests.map((request) => [
    request.applicantName,
    request.id,
    request.userId,
    `${formatDate(request.requestedAt)} ${formatTime(request.requestedAt)}`,
    statusLabels[request.status],
  ])
  const csv = [headers, ...rows]
    .map((row) => row.map(escapeCsv).join(','))
    .join('\n')
  const blob = new Blob(['\uFEFF', csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'solicitudes-publicadores.csv'
  link.click()
  URL.revokeObjectURL(url)
}

function StatusBadge({ status }: { status: PublisherRequestStatus }) {
  const colorClasses: Record<PublisherRequestStatus, string> = {
    pending: 'bg-[#fff2e8] text-[#e86b0c]',
    approved: 'bg-[#eaf6ed] text-[#26793a]',
    rejected: 'bg-[#fff0f0] text-[#d92727]',
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[12px] font-semibold ${colorClasses[status]}`}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {statusLabels[status]}
    </span>
  )
}

function RequestsPage() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [isExporting, setIsExporting] = useState(false)
  const [exportError, setExportError] = useState<string | null>(null)
  const {
    requests,
    total,
    counts,
    isLoading,
    error,
    refresh,
  } = usePublisherRequests(
    statusFilter === 'all' ? undefined : statusFilter,
    currentPage,
    pageSize,
  )
  const pageCount = Math.max(1, Math.ceil(total / pageSize))

  async function exportRequests() {
    setIsExporting(true)
    setExportError(null)
    try {
      const allRequests = await getAllPublisherRequests(
        statusFilter === 'all' ? undefined : statusFilter,
      )
      downloadCsv(allRequests)
    } catch (caughtError) {
      setExportError(
        caughtError instanceof Error
          ? caughtError.message
          : 'No se pudo exportar el listado.',
      )
    } finally {
      setIsExporting(false)
    }
  }

  function changeStatus(status: StatusFilter) {
    setStatusFilter(status)
    setCurrentPage(1)
  }

  return (
    <main className="mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-6 lg:px-7 lg:py-7">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-medium tracking-tight text-[#303936] sm:text-[24px]">
            Solicitudes de validación
          </h1>
          <p className="mt-1 text-[13px] text-[#7b8581]">
            Revisa y gestiona las habilitaciones para publicar inmuebles.
          </p>
        </div>
        <button
          className="inline-flex h-9 items-center gap-2 rounded-md border border-[#dfe5e2] bg-white px-3 text-[13px] font-semibold text-[#3d4642] shadow-sm transition-colors hover:bg-[#f8faf9] disabled:cursor-wait disabled:opacity-60"
          disabled={isExporting}
          onClick={() => void exportRequests()}
          type="button"
        >
          <Download aria-hidden="true" size={14} />
          {isExporting ? 'Exportando…' : 'Exportar listado'}
        </button>
      </div>

      {exportError && (
        <p className="mb-4 text-sm text-[#b42318]" role="alert">
          {exportError}
        </p>
      )}

      <section
        aria-label="Resumen de solicitudes"
        className="mb-5 grid gap-3 sm:grid-cols-3"
      >
        <StatCard
          icon={<Clock3 aria-hidden="true" size={16} />}
          label="Pendientes de revisión"
          marker="bg-[#f07218]"
          value={counts.pending}
        />
        <StatCard
          icon={<CheckCircle2 aria-hidden="true" size={16} />}
          label="Aprobadas"
          marker="bg-[#00a63e]"
          value={counts.approved}
        />
        <StatCard
          icon={<CircleX aria-hidden="true" size={16} />}
          label="Rechazadas"
          marker="bg-[#ef4444]"
          value={counts.rejected}
        />
      </section>

      <section className="overflow-hidden rounded-lg border border-[#e1e6e3] bg-white shadow-[0_1px_2px_rgba(20,35,28,0.03)]">
        <div className="flex items-center justify-between gap-2 border-b border-[#e7ebe9] px-3 sm:px-4">
          <div
            aria-label="Filtrar por estado"
            className="flex min-w-0 overflow-x-auto"
            role="tablist"
          >
            <StatusTab
              active={statusFilter === 'all'}
              count={counts.all}
              label="Todas"
              onClick={() => changeStatus('all')}
            />
            <StatusTab
              active={statusFilter === 'pending'}
              count={counts.pending}
              label="Pendientes"
              onClick={() => changeStatus('pending')}
            />
            <StatusTab
              active={statusFilter === 'approved'}
              count={counts.approved}
              label="Aprobadas"
              onClick={() => changeStatus('approved')}
            />
            <StatusTab
              active={statusFilter === 'rejected'}
              count={counts.rejected}
              label="Rechazadas"
              onClick={() => changeStatus('rejected')}
            />
          </div>
          <button
            aria-label="Actualizar solicitudes"
            className="grid size-8 shrink-0 place-items-center rounded-md text-[#74807b] transition-colors hover:bg-[#f3f6f5] hover:text-[#147bc3] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#147bc3] disabled:cursor-wait disabled:opacity-50"
            disabled={isLoading}
            onClick={refresh}
            title="Actualizar solicitudes"
            type="button"
          >
            <RefreshCw
              aria-hidden="true"
              className={isLoading ? 'animate-spin' : undefined}
              size={16}
            />
          </button>
        </div>

        {isLoading ? (
          <div className="grid min-h-56 place-items-center text-sm text-[#7b8581]">
            Cargando solicitudes…
          </div>
        ) : error ? (
          <div
            className="grid min-h-56 place-items-center px-4 text-center text-sm text-[#c62828]"
            role="alert"
          >
            {error}
          </div>
        ) : requests.length === 0 ? (
          <div className="grid min-h-56 place-items-center px-4 text-center">
            <p className="text-sm text-[#7b8581]">
              No hay solicitudes para este estado.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] table-fixed border-collapse text-left">
              <colgroup>
                <col className="w-[32%]" />
                <col className="w-[23%]" />
                <col className="w-[20%]" />
                <col className="w-[12%]" />
                <col className="w-[13%]" />
              </colgroup>
              <thead>
                <tr className="h-[34px] border-b border-[#e7ebe9] bg-[#fafbfb] text-[11px] font-medium text-[#74807b]">
                  <th className="px-4 font-medium sm:px-5">Solicitante</th>
                  <th className="px-3 font-medium">Solicitud</th>
                  <th className="px-3 font-medium">Fecha de envío</th>
                  <th className="px-3 font-medium">Estado</th>
                  <th className="px-4 text-right font-medium sm:px-5">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {requests.map((request) => (
                  <tr
                    className="h-[56px] border-b border-[#e7ebe9] text-[12px] last:border-b-0 hover:bg-[#fafbfb]"
                    key={request.id}
                  >
                    <td className="px-4 sm:px-5">
                      <div className="flex items-center gap-2.5">
                        <span className="grid size-[27px] shrink-0 place-items-center rounded-full bg-[#edf1f0] text-[11px] font-semibold text-[#4c78c2]">
                          {getInitials(request.applicantName)}
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate font-semibold text-[#303936]">
                            {request.applicantName}
                          </span>
                          <span className="mt-0.5 block truncate text-[10px] text-[#858f8b]">
                            Usuario {request.userId}
                          </span>
                        </span>
                      </div>
                    </td>
                    <td className="px-3 font-medium text-[#3d4642]">
                      {request.id}
                    </td>
                    <td className="px-3">
                      <span className="block text-[#424b47]">
                        {formatDate(request.requestedAt)}
                      </span>
                      <span className="mt-0.5 block text-[11px] text-[#858f8b]">
                        {formatTime(request.requestedAt)} h
                      </span>
                    </td>
                    <td className="px-3">
                      <StatusBadge status={request.status} />
                    </td>
                    <td className="px-4 text-right sm:px-5">
                      <Link
                        className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#2857d5] hover:text-[#173cb0] hover:underline"
                        to={`/requests/${request.id}`}
                      >
                        Ver detalle
                        <ExternalLink aria-hidden="true" size={12} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-[#e7ebe9] px-4 py-2.5 sm:px-4">
          <p aria-live="polite" className="text-[11px] text-[#7b8581]">
            {total === 0
              ? 'No hay solicitudes para mostrar'
              : `Mostrando ${(currentPage - 1) * pageSize + 1}–${Math.min(
                  currentPage * pageSize,
                  total,
                )} de ${total} solicitudes`}
          </p>
          <Pagination
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            pageCount={pageCount}
          />
        </footer>
      </section>

      <p className="mt-4 text-[11px] text-[#8a9490]">
        Fechas y horarios en hora de Argentina (UTC−3).
      </p>
    </main>
  )
}

function StatCard({
  icon,
  label,
  marker,
  value,
}: {
  icon: ReactNode
  label: string
  marker: string
  value: number
}) {
  return (
    <article className="flex min-h-[68px] items-center gap-3 rounded-lg border border-[#e1e6e3] bg-white px-3.5 py-3 shadow-[0_1px_2px_rgba(20,35,28,0.03)] sm:px-4">
      <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-[#f7f9f8] text-[#64716b]">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] text-[#78837e]">{label}</p>
        <p className="mt-0.5 flex items-center gap-1.5 text-[20px] leading-none font-medium text-[#303936]">
          {value}
          <span className={`size-1.5 rounded-full ${marker}`} />
        </p>
      </div>
    </article>
  )
}

function StatusTab({
  active,
  count,
  label,
  onClick,
}: {
  active: boolean
  count: number
  label: string
  onClick: () => void
}) {
  return (
    <button
      aria-selected={active}
      className={`relative shrink-0 px-3 py-3 text-[12px] ${
        active
          ? 'font-semibold text-[#35403b] after:absolute after:right-3 after:bottom-0 after:left-3 after:h-0.5 after:bg-[#f07218] sm:px-2'
          : 'text-[#7b8581] hover:text-[#35403b]'
      }`}
      onClick={onClick}
      role="tab"
      type="button"
    >
      {label} · {count}
    </button>
  )
}

function Pagination({
  currentPage,
  onPageChange,
  pageCount,
}: {
  currentPage: number
  onPageChange: (page: number) => void
  pageCount: number
}) {
  return (
    <nav aria-label="Paginación" className="flex items-center gap-1">
      <button
        aria-label="Página anterior"
        className="flex h-7 items-center gap-1 rounded-md border border-[#e1e6e3] px-2 text-[11px] text-[#424b47] disabled:opacity-40"
        disabled={currentPage <= 1}
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        type="button"
      >
        <ChevronLeft aria-hidden="true" size={12} />
        <span className="hidden sm:inline">Anterior</span>
      </button>
      <span className="px-2 text-[11px] text-[#606b66]">
        Página {currentPage} de {pageCount}
      </span>
      <button
        aria-label="Página siguiente"
        className="flex h-7 items-center gap-1 rounded-md border border-[#e1e6e3] px-2 text-[11px] text-[#424b47] disabled:opacity-40"
        disabled={currentPage >= pageCount}
        onClick={() => onPageChange(Math.min(pageCount, currentPage + 1))}
        type="button"
      >
        <span className="hidden sm:inline">Siguiente</span>
        <ChevronRight aria-hidden="true" size={12} />
      </button>
    </nav>
  )
}

export default RequestsPage
