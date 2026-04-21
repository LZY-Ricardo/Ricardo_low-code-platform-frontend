import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createBuiltInTemplates, getAllTemplates, saveTemplate } from './template-storage'

beforeEach(() => {
  const storage = new Map<string, string>()
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => void storage.set(key, value),
    removeItem: (key: string) => void storage.delete(key),
  })
})

describe('template storage', () => {
  it('includes built-in templates by default', () => {
    expect(createBuiltInTemplates().length).toBeGreaterThan(0)
  })

  it('saves and returns custom templates together with built-ins', () => {
    saveTemplate({
      id: 'custom-1',
      name: '自定义模板',
      description: '测试模板',
      components: [],
      pages: [],
      dataSources: [],
      variables: {},
      sharedStyles: [],
      themeId: 'ocean',
      builtIn: false,
    })

    const templates = getAllTemplates()
    expect(templates.some((item) => item.id === 'custom-1')).toBe(true)
    expect(templates.some((item) => item.builtIn)).toBe(true)
  })
})
