import { useEffect, useState } from 'react'
import { AlertCircle, UserRoundX, X } from 'lucide-react'
import type { PublisherRequest } from '@/features/publisher-validation/types/publisherValidation.types'

const rejectionCategories = [
  'Documentación vencida',
  'Documentación incompleta',
  'Datos no coincidentes',
  'Otro motivo',
]

type RejectRequestModalProps = {
  request: PublisherRequest
  responsible: string
  isSubmitting: boolean
  error: string | null
  onClose: () => void
  onConfirm: (category: string, reason: string) => void
}

function RejectRequestModal({
  request,
  responsible,
  isSubmitting,
  error,
  onClose,
  onConfirm,
}: RejectRequestModalProps) {
  const [category, setCategory] = useState(rejectionCategories[0])
  const [reason, setReason] = useState('')

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && !isSubmitting) {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isSubmitting, onClose])

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-[#101b17]/65 p-4 backdrop-blur-[2px]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isSubmitting) {
          onClose()
        }
      }}
      role="presentation"
    >
      <section
        aria-labelledby="reject-modal-title"
        aria-modal="true"
        className="w-full max-w-[600px] rounded-xl bg-white p-5 shadow-2xl sm:p-8"
        role="dialog"
      >
        <div className="mb-4 flex items-start justify-between">
          <span className="grid size-11 place-items-center rounded-full bg-[#fff0f0] text-[#d92727]">
            <UserRoundX aria-hidden="true" size={22} />
          </span>
          <button
            aria-label="Cerrar diálogo"
            className="rounded p-1 text-[#6f7a74] hover:bg-[#f1f4f2]"
            disabled={isSubmitting}
            onClick={onClose}
            type="button"
          >
            <X aria-hidden="true" size={24} />
          </button>
        </div>

        <h2
          className="text-[22px] font-medium tracking-tight text-[#27312e]"
          id="reject-modal-title"
        >
          Rechazar solicitud
        </h2>
        <p className="mt-1.5 max-w-[510px] text-sm leading-5 text-[#74807a]">
          {request.applicantName} no quedará habilitado para publicar. Indica un
          motivo claro para que pueda corregir su documentación.
        </p>

        <div className="mt-5 flex items-center gap-3 rounded-lg bg-[#f5f8f7] px-3.5 py-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#e8efed] text-[10px] font-semibold text-[#147bc3]">
            {request.applicantName
              .split(' ')
              .map((part) => part[0])
              .slice(0, 2)
              .join('')
              .toUpperCase()}
          </span>
          <div>
            <p className="text-xs font-semibold text-[#303936]">
              {request.applicantName}
            </p>
            <p className="mt-0.5 text-[10px] text-[#7b8581]">
              {request.id} · {request.publisherType}
            </p>
          </div>
        </div>

        <label
          className="mt-5 block text-[11px] font-semibold text-[#303936]"
          htmlFor="rejection-category"
        >
          Categoría
        </label>
        <select
          className="mt-1.5 h-10 w-full rounded-md border border-[#dfe5e2] bg-white px-3 text-xs text-[#3d4642] outline-none focus:border-[#147bc3] focus:ring-2 focus:ring-[#147bc3]/10"
          id="rejection-category"
          onChange={(event) => setCategory(event.target.value)}
          value={category}
        >
          {rejectionCategories.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <div className="mt-4 flex items-center justify-between gap-2">
          <label
            className="text-[11px] font-semibold text-[#303936]"
            htmlFor="rejection-reason"
          >
            Motivo del rechazo <span className="text-[#d92727]">*</span>
          </label>
          {!reason.trim() && (
            <span className="text-[10px] text-[#d92727]">Obligatorio</span>
          )}
        </div>
        <textarea
          aria-describedby="rejection-hint rejection-counter"
          className="mt-1.5 min-h-[112px] w-full resize-y rounded-md border border-[#b8c2bd] p-3 text-xs leading-5 text-[#3d4642] outline-none focus:border-[#147bc3] focus:ring-2 focus:ring-[#147bc3]/10"
          id="rejection-reason"
          maxLength={500}
          onChange={(event) => setReason(event.target.value)}
          placeholder="Explica qué documentación debe corregir o completar."
          required
          value={reason}
        />
        <div className="mt-1 flex justify-between gap-2 text-[9px] text-[#89938f]">
          <span id="rejection-hint">Escribe un motivo claro para el solicitante.</span>
          <span id="rejection-counter">{reason.length}/500</span>
        </div>

        <div className="mt-4 flex items-start gap-2 rounded-md bg-[#fff0f0] px-3 py-3 text-[10px] leading-4 text-[#c62828]">
          <AlertCircle aria-hidden="true" className="mt-0.5 shrink-0" size={15} />
          <p>
            Este motivo se enviará al solicitante y quedará registrado en el
            historial de resoluciones.
          </p>
        </div>

        {error && (
          <p
            className="mt-3 rounded-md bg-[#fff0f0] px-3 py-2 text-xs text-[#b42318]"
            role="alert"
          >
            {error}
          </p>
        )}

        <p className="mt-4 border-b border-[#e0e5e2] pb-4 text-[10px] text-[#74807a]">
          Responsable: {responsible}
        </p>

        <div className="mt-4 flex flex-col-reverse justify-end gap-2 sm:flex-row">
          <button
            className="h-10 rounded-md border border-[#dfe5e2] px-4 text-xs font-semibold text-[#3d4642] hover:bg-[#f7f9f8] disabled:opacity-60"
            disabled={isSubmitting}
            onClick={onClose}
            type="button"
          >
            Cancelar
          </button>
          <button
            className="h-10 rounded-md bg-[#147bc3] px-4 text-xs font-semibold text-white hover:bg-[#116eae] disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isSubmitting || !reason.trim()}
            onClick={() => onConfirm(category, reason)}
            type="button"
          >
            {isSubmitting ? 'Guardando…' : 'Confirmar rechazo'}
          </button>
        </div>
      </section>
    </div>
  )
}

export default RejectRequestModal
