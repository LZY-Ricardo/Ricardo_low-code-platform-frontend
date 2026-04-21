export interface ParsedSelectOption {
  label: string
  value: string
}

export function parseSelectOptions(input: string): ParsedSelectOption[] {
  return input
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
    .map((value) => ({
      label: value,
      value,
    }))
}

export function normalizeSelectOptions(input: unknown): ParsedSelectOption[] {
  if (!Array.isArray(input)) {
    return []
  }

  return input.flatMap((item) => {
    if (typeof item === 'string') {
      return [{ label: item, value: item }]
    }

    if (
      typeof item === 'object'
      && item !== null
      && typeof (item as Record<string, unknown>).label === 'string'
      && typeof (item as Record<string, unknown>).value === 'string'
    ) {
      return [{
        label: (item as Record<string, string>).label,
        value: (item as Record<string, string>).value,
      }]
    }

    return []
  })
}
