export function filterBindingValues(
  values: Record<string, string>,
  bindableProps: string[],
): Record<string, string> {
  const allowed = new Set(bindableProps)

  return Object.fromEntries(
    Object.entries(values).filter(([key, value]) => allowed.has(key) && typeof value === 'string' && value.trim()),
  )
}
