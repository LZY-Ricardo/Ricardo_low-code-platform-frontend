export function normalizeTagColor(value: unknown): string {
  return typeof value === 'string' && value.trim() ? value : 'default'
}
