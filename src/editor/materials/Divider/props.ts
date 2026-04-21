export function normalizeDividerOrientation(value: unknown): 'left' | 'center' | 'right' {
  if (value === 'left' || value === 'center' || value === 'right') {
    return value
  }

  return 'center'
}
