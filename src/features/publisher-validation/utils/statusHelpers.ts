export function formatPublisherType(value: string | null | undefined): string {
  if (!value) {
    return 'No informado'
  }

  const labels: Record<string, string> = {
    agency: 'Agencia',
    individual: 'Particular',
    owner: 'Dueño directo',
  }

  return labels[value] ?? value
}
