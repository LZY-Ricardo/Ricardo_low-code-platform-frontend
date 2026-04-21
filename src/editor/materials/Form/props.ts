export function normalizeFormLayout(value: unknown): 'horizontal' | 'vertical' | 'inline' {
  if (value === 'horizontal' || value === 'vertical' || value === 'inline') {
    return value
  }

  return 'vertical'
}
