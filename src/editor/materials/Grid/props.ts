export function normalizeGridSpan(value: unknown): number {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return 24
  }

  return Math.min(Math.max(Math.round(value), 1), 24)
}
