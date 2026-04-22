import type { Component } from '../stores/components'

export interface EditorPage {
  id: string
  name: string
  components: Component[]
}

function createPageId(): string {
  return `page_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

export function createPage(name: string, components: Component[]): EditorPage {
  return {
    id: createPageId(),
    name,
    components,
  }
}

export function getActivePage(pages: EditorPage[], activePageId: string | null): EditorPage | null {
  if (!activePageId) {
    return pages[0] ?? null
  }

  return pages.find((page) => page.id === activePageId) ?? pages[0] ?? null
}

export function replaceActivePageComponents(
  pages: EditorPage[],
  activePageId: string | null,
  components: Component[],
): EditorPage[] {
  let changed = false
  const nextPages = pages.map((page) => {
    if (page.id !== activePageId || page.components === components) {
      return page
    }

    changed = true
    return { ...page, components }
  })

  return changed ? nextPages : pages
}

export function duplicatePage(pages: EditorPage[], pageId: string): EditorPage[] {
  const source = pages.find((page) => page.id === pageId)
  if (!source) {
    return pages
  }

  return [
    ...pages,
    {
      ...source,
      id: createPageId(),
      name: `${source.name} 副本`,
      components: JSON.parse(JSON.stringify(source.components)) as Component[],
    },
  ]
}
