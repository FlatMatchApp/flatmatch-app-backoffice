import { Fragment, useMemo, useState, type ReactNode } from 'react'
import {
  ArrowDownWideNarrow,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleX,
  Clock3,
  Download,
  ExternalLink,
  Search,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { usePublisherRequests } from '@/features/publisher-validation/hooks/usePublisherRequests'
import type {
  PublisherRequest,
  PublisherRequestStatus,
  PublisherType,
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
    'Correo electrónico',
    'Solicitud',
    'Tipo de publicador',
    'Fecha de envío',
    'Estado',
  ]
  const rows = requests.map((request) => [
    request.applicantName,
    request.email,
    request.id,
    request.publisherType,
    `${formatDate(request.submittedAt)} ${formatTime(request.submittedAt)}`,
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
  const { requests, isLoading, error } = usePublisherRequests()
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [search, setSearch] = useState('')
  const [publisherType, setPublisherType] = useState<'all' | PublisherType>('all')
  const [dateFilter, setDateFilter] = useState<'30' | 'all'>('30')
  const [sortNewestFirst, setSortNewestFirst] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)

  const statusCounts = useMemo(
    () => ({
      all: requests.length,
      pending: requests.filter((request) => request.status === 'pending').length,
      approved: requests.filter((request) => request.status === 'approved').length,
      rejected: requests.filter((request) => request.status === 'rejected').length,
    }),
    [requests],
  )

  const filteredRequests = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase('es')
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - 30)

    return requests
      .filter((request) => {
        const matchesStatus =
          statusFilter === 'all' || request.status === statusFilter
        const matchesType =
          publisherType === 'all' || request.publisherType === publisherType
        const matchesDate =
          dateFilter === 'all' || new Date(request.submittedAt) >= cutoff
        const searchableText =
          `${request.applicantName} ${request.email} ${request.id}`.toLocaleLowerCase(
            'es',
          )

        return (
          matchesStatus &&
          matchesType &&
          matchesDate &&
          searchableText.includes(normalizedSearch)
        )
      })
      .sort((first, second) => {
        const direction = sortNewestFirst ? -1 : 1
        return (
          direction *
          (new Date(first.submittedAt).getTime() -
            new Date(second.submittedAt).getTime())
        )
      })
  }, [dateFilter, publisherType, requests, search, sortNewestFirst, statusFilter])

  const pageCount = Math.max(1, Math.ceil(filteredRequests.length / pageSize))
  const visibleRequests = filteredRequests.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  )

  function updateFilter(update: () => void) {
    update()
    setCurrentPage(1)
  }

  function exportRequests() {
    downloadCsv(filteredRequests)
  }

  return (
    <main className="mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-6 lg:px-7 lg:py-7">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-medium tracking-tight text-[#303936] sm:text-[24px]">
            Solicitudes de validación
          </h1>
          <p className="mt-1 text-[13px] text-[#7b8581] sm:text-[13px]">
            Revisa y gestiona las habilitaciones para publicar inmuebles.
          </p>
        </div>
        <button
          className="inline-flex h-9 items-center gap-2 rounded-md border border-[#dfe5e2] bg-white px-3 text-[13px] font-semibold text-[#3d4642] shadow-sm transition-colors hover:bg-[#f8faf9] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#147bc3]"
          onClick={exportRequests}
          type="button"
        >
          <Download aria-hidden="true" size={14} />
          Exportar listado
        </button>
      </div>

      <section aria-label="Resumen de solicitudes" className="mb-5 grid gap-3 sm:grid-cols-3">
        <StatCard
          caption="3 recibidas hoy"
          icon={<Clock3 aria-hidden="true" size={16} />}
          label="Pendientes de revisión"
          marker="bg-[#f07218]"
          value={statusCounts.pending}
        />
        <StatCard
          caption="Últimos 30 días"
          icon={<CheckCircle2 aria-hidden="true" size={16} />}
          label="Aprobadas"
          marker="bg-[#00a63e]"
          value={statusCounts.approved}
        />
        <StatCard
          caption="Últimos 30 días"
          icon={<CircleX aria-hidden="true" size={16} />}
          label="Rechazadas"
          marker="bg-[#ef4444]"
          value={statusCounts.rejected}
        />
      </section>

      <section className="overflow-hidden rounded-lg border border-[#e1e6e3] bg-white shadow-[0_1px_2px_rgba(20,35,28,0.03)]">
        <div
          aria-label="Filtrar por estado"
          className="flex overflow-x-auto border-b border-[#e7ebe9] px-4 sm:px-5"
          role="tablist"
        >
          <StatusTab
            active={statusFilter === 'all'}
            count={statusCounts.all}
            label="Todas"
            onClick={() => updateFilter(() => setStatusFilter('all'))}
          />
          <StatusTab
            active={statusFilter === 'pending'}
            count={statusCounts.pending}
            label="Pendientes"
            onClick={() => updateFilter(() => setStatusFilter('pending'))}
          />
          <StatusTab
            active={statusFilter === 'approved'}
            count={statusCounts.approved}
            label="Aprobadas"
            onClick={() => updateFilter(() => setStatusFilter('approved'))}
          />
          <StatusTab
            active={statusFilter === 'rejected'}
            count={statusCounts.rejected}
            label="Rechazadas"
            onClick={() => updateFilter(() => setStatusFilter('rejected'))}
          />
        </div>

        <div className="flex flex-col gap-2.5 border-b border-[#e7ebe9] p-3.5 sm:flex-row sm:items-center sm:px-4">
          <label className="flex h-[34px] min-w-[190px] flex-1 items-center gap-2 rounded-md border border-[#dfe5e2] px-2.5 text-[#84908b] focus-within:border-[#147bc3] focus-within:ring-2 focus-within:ring-[#147bc3]/10">
            <Search aria-hidden="true" size={15} />
            <span className="sr-only">Buscar solicitudes</span>
            <input
              className="h-full min-w-0 flex-1 border-0 bg-transparent text-[12px] text-[#3d4642] outline-none placeholder:text-[#89938f]"
              onChange={(event) =>
                updateFilter(() => setSearch(event.target.value))
              }
              placeholder="Buscar por nombre, correo o N.º de solicitud"
              type="search"
              value={search}
            />
          </label>

          <label className="relative flex h-[34px] items-center gap-2 rounded-md border border-[#dfe5e2] px-2.5 text-[#424b47]">
            <ChevronDown aria-hidden="true" className="pointer-events-none absolute right-2" size={14} />
            <span className="sr-only">Tipo de publicador</span>
            <select
              className="h-full min-w-0 appearance-none bg-transparent pr-5 text-[12px] font-semibold outline-none"
              onChange={(event) =>
                updateFilter(() =>
                  setPublisherType(event.target.value as 'all' | PublisherType),
                )
              }
              value={publisherType}
            >
              <option value="all">Todos los tipos</option>
              <option value="Corredor inmobiliario">Corredor inmobiliario</option>
              <option value="Propietario particular">Propietario particular</option>
            </select>
          </label>

          <label className="relative flex h-[34px] items-center gap-2 rounded-md border border-[#dfe5e2] px-2.5 text-[#424b47]">
            <CalendarDays aria-hidden="true" size={14} />
            <span className="sr-only">Período</span>
            <select
              className="h-full appearance-none bg-transparent pr-1 text-[12px] font-semibold outline-none"
              onChange={(event) =>
                updateFilter(() => setDateFilter(event.target.value as '30' | 'all'))
              }
              value={dateFilter}
            >
              <option value="30">Últimos 30 días</option>
              <option value="all">Todo el período</option>
            </select>
            <ChevronDown aria-hidden="true" className="pointer-events-none" size={14} />
          </label>

          <button
            className="hidden items-center justify-end gap-1.5 px-1 text-[12px] text-[#78837e] sm:flex"
            onClick={() => setSortNewestFirst((newestFirst) => !newestFirst)}
            type="button"
          >
            <ArrowDownWideNarrow aria-hidden="true" size={13} />
            {sortNewestFirst ? 'Más recientes' : 'Más antiguas'}
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
        ) : visibleRequests.length === 0 ? (
          <div className="grid min-h-56 place-items-center px-4 text-center">
            <div>
              <p className="text-sm font-medium text-[#3d4642]">
                No se encontraron solicitudes
              </p>
              <p className="mt-1 text-[13px] text-[#7b8581]">
                Prueba cambiar los filtros o el término de búsqueda.
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[740px] table-fixed border-collapse text-left">
              <colgroup>
                <col className="w-[30%]" />
                <col className="w-[20%]" />
                <col className="w-[18%]" />
                <col className="w-[14%]" />
                <col className="w-[18%]" />
              </colgroup>
              <thead>
                <tr className="h-[34px] border-b border-[#e7ebe9] bg-[#fafbfb] text-[11px] font-medium text-[#74807b]">
                  <th className="px-4 font-medium sm:px-5">Solicitante</th>
                  <th className="px-3 font-medium">Solicitud / Tipo</th>
                  <th className="px-3 font-medium">
                    <button
                      className="inline-flex items-center gap-1"
                      onClick={() =>
                        setSortNewestFirst((newestFirst) => !newestFirst)
                      }
                      type="button"
                    >
                      Fecha de envío
                      <span aria-hidden="true">{sortNewestFirst ? '↓' : '↑'}</span>
                    </button>
                  </th>
                  <th className="px-3 font-medium">Estado</th>
                  <th className="px-4 text-right font-medium sm:px-5">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {visibleRequests.map((request, index) => (
                  <tr
                    className={`h-[48px] border-b border-[#e7ebe9] text-[12px] last:border-b-0 ${
                      index === 0 && currentPage === 1
                        ? 'bg-[#fbf9ff]'
                        : 'bg-white hover:bg-[#fafbfb]'
                    }`}
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
                          <span className="mt-0.5 block truncate text-[11px] text-[#858f8b]">
                            {request.email}
                          </span>
                        </span>
                      </div>
                    </td>
                    <td className="px-3">
                      <span className="block font-semibold text-[#3d4642]">
                        {request.id}
                      </span>
                      <span className="mt-0.5 block text-[11px] text-[#858f8b]">
                        {request.publisherType}
                      </span>
                    </td>
                    <td className="px-3">
                      <span className="block text-[#424b47]">
                        {formatDate(request.submittedAt)}
                      </span>
                      <span className="mt-0.5 block text-[11px] text-[#858f8b]">
                        {formatTime(request.submittedAt)} h
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
                {Array.from(
                  { length: pageSize - visibleRequests.length },
                  (_, index) => (
                    <tr
                      aria-hidden="true"
                      className="h-[48px] border-b border-[#e7ebe9] last:border-b-0"
                      key={`empty-row-${index}`}
                    >
                      <td colSpan={5} />
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        )}

        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-[#e7ebe9] px-4 py-2.5 sm:px-4">
          <p aria-live="polite" className="text-[11px] text-[#7b8581]">
            {filteredRequests.length === 0
              ? 'No hay solicitudes para mostrar'
              : `Mostrando ${(currentPage - 1) * pageSize + 1}–${Math.min(
                  currentPage * pageSize,
                  filteredRequests.length,
                )} de ${filteredRequests.length} solicitudes`}
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
  caption,
  icon,
  label,
  marker,
  value,
}: {
  caption: string
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
      <span className="hidden text-right text-[10px] text-[#89938f] sm:block">
        {caption}
      </span>
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
    <nav aria-label="Paginación" className="flex items-center gap-1">
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
        <Fragment key={page}>
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
        </Fragment>
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

export default RequestsPage
