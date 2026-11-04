import type { PublisherRequest } from '@/features/publisher-validation/types/publisherValidation.types'
import { formatPublisherType } from '@/features/publisher-validation/utils/statusHelpers'

type ApplicantInformationProps = {
  request: PublisherRequest
}

function ApplicantInformation({ request }: ApplicantInformationProps) {
  const profile = request.profile
  const fields = [
    {
      label: 'Nombre',
      value: [profile?.firstName, profile?.lastName].filter(Boolean).join(' '),
      emptyValue: 'No informado',
    },
    {
      label: 'Tipo de publicador',
      value: formatPublisherType(profile?.publisherType),
      emptyValue: 'No informado',
    },
    { label: 'Teléfono', value: profile?.phone, emptyValue: 'No informado' },
    { label: 'Domicilio', value: profile?.address, emptyValue: 'No informado' },
    {
      label: 'Nombre de la agencia',
      value: profile?.agencyName,
      emptyValue: 'No corresponde',
    },
    {
      label: 'CUIT de la agencia',
      value: profile?.agencyTaxId,
      emptyValue: 'No corresponde',
    },
  ]

  return (
    <section className="overflow-hidden rounded-lg border border-[#e1e6e3] bg-white">
      <header className="flex items-center justify-between border-b border-[#e7ebe9] px-4 py-3.5 sm:px-5">
        <h2 className="text-sm font-medium text-[#303936]">
          Perfil del solicitante
        </h2>
        <span className="text-[11px] text-[#89938f]">
          Datos informados al solicitar la validación
        </span>
      </header>
      {profile ? (
        <dl className="grid gap-x-6 gap-y-4 px-4 py-4 sm:grid-cols-2 sm:px-5 lg:grid-cols-3">
          {fields.map((field) => (
            <div className="min-w-0" key={field.label}>
              <dt className="text-[12px] text-[#858f8b]">{field.label}</dt>
              <dd className="mt-1 break-words text-[13px] font-medium text-[#3d4642]">
                {field.value?.trim() || field.emptyValue}
              </dd>
            </div>
          ))}
        </dl>
      ) : (
        <p className="px-4 py-5 text-[13px] text-[#7b8581]">
          La administración no cuenta con información de perfil para esta solicitud.
        </p>
      )}
      {request.missingRequiredFields &&
        request.missingRequiredFields.length > 0 && (
          <div className="border-t border-[#e7ebe9] px-4 py-3 sm:px-5">
            <p className="text-[12px] font-semibold text-[#b42318]">
              Campos requeridos faltantes
            </p>
            <p className="mt-1 text-[12px] text-[#7b8581]">
              {request.missingRequiredFields.join(', ')}
            </p>
          </div>
        )}
    </section>
  )
}

export default ApplicantInformation
