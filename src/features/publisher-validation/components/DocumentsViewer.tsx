import { useState } from 'react'
import { Download, Eye, FileText, Landmark, Maximize2 } from 'lucide-react'
import type { RequestDocument } from '@/features/publisher-validation/types/publisherValidation.types'

type DocumentsViewerProps = {
  applicantName: string
  documents: RequestDocument[]
  submittedAt: string
}

function formatUploadDate(value: string) {
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(value))
}

function downloadDocument(document: RequestDocument, applicantName: string) {
  const contents = [
    'Documento de demostración FlatMatch',
    `Archivo: ${document.name}`,
    `Solicitante: ${applicantName}`,
    'Este archivo es un placeholder del prototipo y no contiene documentación real.',
  ].join('\n')
  const blob = new Blob([contents], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = window.document.createElement('a')
  link.href = url
  link.download = `${document.name.toLowerCase().replaceAll(' ', '-')}-demo.txt`
  link.click()
  URL.revokeObjectURL(url)
}

function DocumentsViewer({
  applicantName,
  documents,
  submittedAt,
}: DocumentsViewerProps) {
  const [selectedDocumentId, setSelectedDocumentId] = useState(documents[0]?.id)
  const selectedDocument =
    documents.find((document) => document.id === selectedDocumentId) ?? documents[0]

  if (!selectedDocument) {
    return null
  }

  function downloadAll() {
    const contents = documents
      .map(
        (document) =>
          `${document.name} (${document.size}) — documento de demostración`,
      )
      .join('\n')
    const blob = new Blob([contents], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = window.document.createElement('a')
    link.href = url
    link.download = 'documentacion-demo.txt'
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <section className="overflow-hidden rounded-lg border border-[#e1e6e3] bg-white">
      <header className="flex items-center justify-between border-b border-[#e7ebe9] px-4 py-3.5 sm:px-5">
        <h2 className="text-sm font-medium text-[#303936]">
          Documentación presentada
        </h2>
        <span className="text-[9px] text-[#89938f]">
          {documents.length} archivos adjuntos
        </span>
      </header>

      <div className="grid gap-3 p-4 sm:p-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(190px,0.9fr)]">
        <div className="space-y-2">
          {documents.map((document) => {
            const isSelected = document.id === selectedDocument.id

            return (
              <div
                className={`flex min-h-[48px] items-center gap-2 rounded-md border px-2.5 ${
                  isSelected
                    ? 'border-[#c6c7ff] bg-[#f0efff]'
                    : 'border-[#e1e6e3] bg-white'
                }`}
                key={document.id}
              >
                <span
                  className={`grid size-7 shrink-0 place-items-center rounded ${
                    isSelected
                      ? 'bg-white text-[#147bc3]'
                      : 'bg-[#f5f7f6] text-[#84908b]'
                  }`}
                >
                  <FileText aria-hidden="true" size={15} />
                </span>
                <button
                  aria-pressed={isSelected}
                  className="min-w-0 flex-1 text-left"
                  onClick={() => setSelectedDocumentId(document.id)}
                  type="button"
                >
                  <span className="block truncate text-[10px] font-medium text-[#3d4642]">
                    {document.name}
                  </span>
                  <span className="mt-0.5 block text-[9px] text-[#89938f]">
                    PDF · {document.size} · Vista previa
                  </span>
                </button>
                <button
                  aria-label={`Descargar ${document.name}`}
                  className="grid size-7 shrink-0 place-items-center rounded text-[#77837d] hover:bg-white hover:text-[#147bc3]"
                  onClick={() => downloadDocument(document, applicantName)}
                  type="button"
                >
                  {isSelected ? (
                    <Eye aria-hidden="true" size={14} />
                  ) : (
                    <Download aria-hidden="true" size={14} />
                  )}
                </button>
              </div>
            )
          })}
          <p className="pt-4 text-[9px] text-[#89938f]">
            Cargados el {formatUploadDate(submittedAt)}
          </p>
        </div>

        <div
          aria-label={`Vista previa de ${selectedDocument.name}`}
          className="overflow-hidden rounded-md border border-[#e1e6e3] bg-[#f8faf9]"
          role="img"
        >
          <div className="flex min-h-[190px] flex-col bg-white p-3 sm:min-h-[214px] sm:p-4">
            <div className="flex items-center gap-2 border-b border-[#e6ebe8] pb-2">
              <Landmark aria-hidden="true" className="text-[#147bc3]" size={17} />
              <div className="text-[7px] font-semibold leading-tight text-[#3d4642]">
                COLEGIO PROFESIONAL
                <br />
                DE CORREDORES INMOBILIARIOS
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <p className="text-[9px] font-medium uppercase text-[#68746e]">
                {selectedDocument.name}
              </p>
              <p className="text-[8px] uppercase leading-relaxed text-[#56615b]">
                Constancia de presentación de documentación
              </p>
              <p className="text-[10px] font-semibold text-[#303936]">
                {applicantName}
              </p>
              <p className="text-[8px] text-[#77837d]">
                Documento presentado para revisión administrativa
              </p>
              <div className="mt-4 h-px w-14 bg-[#aeb9b3]" />
            </div>
            <div className="mt-auto flex justify-end">
              <span className="rounded border border-[#7bb7ea] px-1.5 py-1 text-[7px] text-[#147bc3]">
                DEMO
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between bg-[#edf1ef] px-2.5 py-1.5 text-[8px] text-[#7b8581]">
            <span>Página 1 de 1 · Vista de demostración</span>
            <Maximize2 aria-hidden="true" size={12} />
          </div>
        </div>
      </div>

      <footer className="flex justify-end px-4 pb-4 sm:px-5">
        <button
          className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-[#147bc3] hover:underline"
          onClick={downloadAll}
          type="button"
        >
          <Download aria-hidden="true" size={13} />
          Descargar todo
        </button>
      </footer>
    </section>
  )
}

export default DocumentsViewer
