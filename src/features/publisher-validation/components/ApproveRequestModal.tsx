import { useEffect, useState } from 'react'
import { Check, CheckCircle2, X } from 'lucide-react'
import type { PublisherRequest } from '@/features/publisher-validation/types/publisherValidation.types'

type ApproveRequestModalProps = {
  request: PublisherRequest
  responsible: string
  isSubmitting: boolean
  error: string | null
  onClose: () => void
  onConfirm: (reason: string) => void
}

function ApproveRequestModal({
  request,
  responsible,
  isSubmitting,
  error,
  onClose,
  onConfirm,
}: ApproveRequestModalProps) {
  const [reason, setReason] = useState(
    'Identidad y matrícula verificadas. Documentación completa y vigente.',
  )

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
      className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-[#101b17]/55 p-4 backdrop-blur-[2px]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isSubmitting) {
          onClose()
        }
      }}
      role="presentation"
    >
      <section
        aria-labelledby="approve-modal-title"
        aria-modal="true"
        className="w-full max-w-[500px] rounded-xl bg-white p-5 shadow-2xl sm:p-7"
        role="dialog"
      >
        <div className="mb-4 flex items-start justify-between">
          <span className="grid size-10 place-items-center rounded-full bg-[#eaf6ed] text-[#16843b]">
            <CheckCircle2 aria-hidden="true" size={21} />
          </span>
          <button
            aria-label="Cerrar diálogo"
            className="rounded p-1 text-[#77837d] hover:bg-[#f1f4f2]"
            disabled={isSubmitting}
            onClick={onClose}
            type="button"
          >
            <X aria-hidden="true" size={21} />
          </button>
        </div>

        <h2
          className="text-xl font-medium tracking-tight text-[#28332e]"
          id="approve-modal-title"
        >
          ¿Aprobar esta solicitud?
        </h2>
        <p className="mt-1.5 text-sm leading-5 text-[#74807a]">
          {request.applicantName} quedará habilitado como publicador y podrá
          comenzar a publicar inmuebles en FlatMatch.
        </p>

        <div className="mt-4 flex items-center gap-3 rounded-lg bg-[#f5f8f7] px-3.5 py-3">
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
          className="mt-4 block text-[11px] font-semibold text-[#303936]"
          htmlFor="approval-reason"
        >
          Motivo que se registrará
        </label>
        <textarea
          className="mt-1.5 min-h-[78px] w-full resize-y rounded-md border border-[#dfe5e2] p-3 text-xs leading-5 text-[#4c5751] outline-none focus:border-[#147bc3] focus:ring-2 focus:ring-[#147bc3]/10"
          id="approval-reason"
          maxLength={500}
          onChange={(event) => setReason(event.target.value)}
          value={reason}
        />
        <p className="mt-1 text-[9px] text-[#89938f]">
          Se guardará en el historial de resoluciones.
        </p>

        {error && (
          <p
            className="mt-3 rounded-md bg-[#fff0f0] px-3 py-2 text-xs text-[#b42318]"
            role="alert"
          >
            {error}
          </p>
        )}

        <p className="mt-4 border-t border-[#e5e9e7] pt-3 text-[10px] text-[#74807a]">
          Responsable: {responsible}
        </p>

        <div className="mt-5 flex flex-col-reverse justify-end gap-2 border-t border-[#e5e9e7] pt-4 sm:flex-row">
          <button
            className="h-10 rounded-md border border-[#dfe5e2] px-4 text-xs font-semibold text-[#3d4642] hover:bg-[#f7f9f8] disabled:opacity-60"
            disabled={isSubmitting}
            onClick={onClose}
            type="button"
          >
            Cancelar
          </button>
          <button
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[#147bc3] px-4 text-xs font-semibold text-white hover:bg-[#116eae] disabled:cursor-wait disabled:opacity-60"
            disabled={isSubmitting || !reason.trim()}
            onClick={() => onConfirm(reason)}
            type="button"
          >
            <Check aria-hidden="true" size={15} />
            {isSubmitting ? 'Guardando…' : 'Confirmar aprobación'}
          </button>
        </div>
        <p className="mt-3 text-center text-[9px] text-[#89938f]">
          Se enviará una notificación al solicitante.
        </p>
      </section>
    </div>
  )
}

export default ApproveRequestModal
