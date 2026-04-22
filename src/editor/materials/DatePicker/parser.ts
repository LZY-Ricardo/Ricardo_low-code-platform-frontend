export function normalizeDatePickerValue(value: unknown): string | undefined {
  if (typeof value !== 'string') {
    return undefined
  }

  const trimmed = value.trim()
  return trimmed ? trimmed : undefined
}

export function getDatePickerNextValue(dateString: string | string[]): string | undefined {
  const nextValue = Array.isArray(dateString) ? dateString[0] ?? '' : dateString ?? ''
  return normalizeDatePickerValue(nextValue)
}
