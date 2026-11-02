import type { ApplicantDetails, PublisherRequest } from '@/features/publisher-validation/types/publisherValidation.types'

type ApplicantInformationProps = {
  request: PublisherRequest
  details: ApplicantDetails
}

function ApplicantInformation({ request, details }: ApplicantInformationProps) {
  const fields = [
    { label: 'Documento de identidad', value: details.identityDocument },
    { label: 'CUIT / CUIL', value: details.taxId },
    { label: 'Teléfono', value: details.phone },
    { label: 'Correo electrónico', value: request.email },
    { label: 'Localidad', value: details.locality },
    { label: 'Matrícula profesional', value: details.professionalLicense },
  ]

  return (
    <section className="overflow-hidden rounded-lg border border-[#e1e6e3] bg-white">
      <header className="flex items-center justify-between border-b border-[#e7ebe9] px-4 py-3.5 sm:px-5">
        <h2 className="text-sm font-medium text-[#303936]">
          Información del solicitante
        </h2>
        <span className="text-[11px] text-[#89938f]">Datos declarados</span>
      </header>
      <dl className="grid gap-x-6 gap-y-4 px-4 py-4 sm:grid-cols-2 sm:px-5 lg:grid-cols-3">
        {fields.map((field) => (
          <div className="min-w-0" key={field.label}>
            <dt className="text-[12px] text-[#858f8b]">{field.label}</dt>
            <dd className="mt-1 break-words text-[13px] font-medium text-[#3d4642]">
              {field.value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

export default ApplicantInformation
