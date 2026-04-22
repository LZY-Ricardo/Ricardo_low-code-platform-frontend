import { beforeEach, describe, expect, it, vi } from 'vitest'
import { loadCustomTemplates, normalizeTemplatePages, saveTemplate } from './template-storage'

beforeEach(() => {
  const storage = new Map<string, string>()
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => void storage.set(key, value),
    removeItem: (key: string) => void storage.delete(key),
  })
})

describe('template storage', () => {
  it('saves and returns custom templates from local storage', () => {
    saveTemplate({
      id: 'custom-1',
      name: '自定义模板',
      description: '测试模板',
      category: 'general',
      components: [],
      pages: [],
      dataSources: [],
      variables: {},
      sharedStyles: [],
      themeId: 'ocean',
      builtIn: false,
    })

    const templates = loadCustomTemplates()
    expect(templates).toHaveLength(1)
    expect(templates[0].id).toBe('custom-1')
    expect(templates[0].builtIn).toBe(false)
  })

  it('creates default page when template pages are missing', () => {
    const pages = normalizeTemplatePages({
      components: [{ id: 1, name: 'Page', props: {}, desc: '页面' }],
      pages: [],
    } as any)

    expect(pages).toHaveLength(1)
    expect(pages[0].components[0].name).toBe('Page')
  })
})
