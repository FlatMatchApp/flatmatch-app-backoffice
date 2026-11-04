import { useState } from 'react'
import { Download, Eye, FileText } from 'lucide-react'

const documents = [
  { id: 'dni-front', name: 'Documento de identidad · Frente', size: '1,2 MB' },
  { id: 'dni-back', name: 'Documento de identidad · Dorso', size: '980 KB' },
  { id: 'professional-license', name: 'Matrícula profesional', size: '842 KB' },
]

function DocumentationPresented() {
  const [selectedDocumentId, setSelectedDocumentId] = useState(documents[0].id)
  const selectedDocument =
    documents.find((document) => document.id === selectedDocumentId) ??
    documents[0]

  return (
    <section className="overflow-hidden rounded-lg border border-[#e1e6e3] bg-white">
      <header className="flex items-center justify-between border-b border-[#e7ebe9] px-4 py-3.5 sm:px-5">
        <h2 className="text-sm font-medium text-[#303936]">
          Documentación presentada
        </h2>
        <span className="text-[11px] text-[#89938f]">
          {documents.length} archivos adjuntos
        </span>
      </header>

      <div className="grid gap-4 p-4 sm:p-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        <ul aria-label="Archivos presentados" className="space-y-2">
          {documents.map((document) => {
            const isSelected = document.id === selectedDocumentId

            return (
              <li key={document.id}>
                <button
                  aria-pressed={isSelected}
                  className={`flex min-h-[58px] w-full items-center gap-3 rounded-md border px-3 py-2 text-left transition-colors ${
                    isSelected
                      ? 'border-[#b8b5ff] bg-[#f0efff]'
                      : 'border-[#e7ebe9] bg-white hover:bg-[#f8faf9]'
                  }`}
                  onClick={() => setSelectedDocumentId(document.id)}
                  type="button"
                >
                  <span
                    className={`grid size-8 shrink-0 place-items-center rounded ${
                      isSelected
                        ? 'bg-white text-[#147bc3]'
                        : 'bg-[#f3f6f5] text-[#77837d]'
                    }`}
                  >
                    <FileText aria-hidden="true" size={16} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[12px] font-medium text-[#3d4642]">
                      {document.name}
                    </span>
                    <span className="mt-0.5 block text-[10px] text-[#89938f]">
                      PDF · {document.size}
                      {isSelected ? ' · Vista previa' : ''}
                    </span>
                  </span>
                  {isSelected && (
                    <Eye
                      aria-hidden="true"
                      className="shrink-0 text-[#147bc3]"
                      size={15}
                    />
                  )}
                </button>
              </li>
            )
          })}
        </ul>

        <div
          aria-label={`Vista previa de ejemplo: ${selectedDocument.name}`}
          className="flex min-h-[230px] flex-col overflow-hidden rounded-md border border-[#e7ebe9] bg-[#f4f7f6]"
          role="img"
        >
          <div className="flex flex-1 items-center justify-center p-5">
            <div className="flex aspect-[1.42/1] w-full max-w-[330px] flex-col justify-between rounded-sm border border-[#e1e6e3] bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2 border-b border-[#e7ebe9] pb-3">
                <span className="grid size-7 place-items-center rounded bg-[#edf5fb] text-[#147bc3]">
                  <FileText aria-hidden="true" size={15} />
                </span>
                <div>
                  <p className="text-[9px] font-semibold uppercase tracking-wide text-[#3d4642]">
                    FlatMatch
                  </p>
                  <p className="text-[8px] text-[#89938f]">
                    Documento de ejemplo
                  </p>
                </div>
              </div>
              <div className="space-y-2 py-3">
                <p className="text-[10px] font-semibold text-[#3d4642]">
                  {selectedDocument.name}
                </p>
                <div className="h-1.5 w-4/5 rounded bg-[#e7ebe9]" />
                <div className="h-1.5 w-3/5 rounded bg-[#e7ebe9]" />
                <div className="h-1.5 w-2/3 rounded bg-[#e7ebe9]" />
              </div>
              <p className="border-t border-[#e7ebe9] pt-2 text-[8px] text-[#89938f]">
                Vista previa simulada · Archivo de muestra
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between border-t border-[#e7ebe9] bg-white px-3 py-2">
            <span className="truncate text-[10px] text-[#74807b]">
              {selectedDocument.name}
            </span>
            <Download
              aria-hidden="true"
              className="ml-2 shrink-0 text-[#89938f]"
              size={14}
            />
          </div>
        </div>
      </div>

      <footer className="flex flex-wrap items-center justify-between gap-2 px-4 pb-4 text-[10px] text-[#89938f] sm:px-5">
        <span>Documentación de muestra para revisión visual.</span>
        <span>Los archivos reales estarán disponibles próximamente.</span>
      </footer>
    </section>
  )
}

export default DocumentationPresented
