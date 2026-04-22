export interface CustomComponentDefinition {
  id: string
  name: string
  displayName: string
  description: string
  code: string
  defaultProps: Record<string, unknown>
  setterConfig: Array<Record<string, unknown>>
  source: 'user' | 'market'
  createdAt: number
  updatedAt: number
}

const STORAGE_KEY = 'lowcode_custom_components'

export function loadCustomComponents(): CustomComponentDefinition[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []

    return parsed.map((item) => ({
      ...item,
      source: item?.source === 'market' ? 'market' : 'user',
    }))
  } catch {
    return []
  }
}

export function saveCustomComponents(components: CustomComponentDefinition[]): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(components))
    return true
  } catch (error) {
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      console.error('LocalStorage quota exceeded')
      return false
    }
    throw error
  }
}
