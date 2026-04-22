import { beforeEach, describe, expect, it, vi } from 'vitest'
import { loadCustomComponents } from './custom-component-storage'

beforeEach(() => {
  const storage = new Map<string, string>()
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => void storage.set(key, value),
    removeItem: (key: string) => void storage.delete(key),
  })
})

describe('custom component storage', () => {
  it('normalizes legacy custom components without source to user source', () => {
    localStorage.setItem(
      'lowcode_custom_components',
      JSON.stringify([
        {
          id: 'legacy-1',
          name: 'StatsCard',
          displayName: '统计卡片',
          description: '旧数据',
          code: 'export default function Component() { return null }',
          defaultProps: {},
          setterConfig: [],
          createdAt: 1,
          updatedAt: 1,
        },
      ]),
    )

    const components = loadCustomComponents()

    expect(components).toHaveLength(1)
    expect(components[0].source).toBe('user')
  })
})
