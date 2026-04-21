import type { Component } from '../stores/components'
import type { DataSource } from '../stores/data-source'
import type { SharedStyleDefinition } from '../stores/shared-styles'
import type { EditorPage } from './page-model'

export interface EditorSnapshot {
  pages: EditorPage[]
  activePageId: string | null
  dataSources: DataSource[]
  variables: Record<string, unknown>
  sharedStyles: SharedStyleDefinition[]
  themeId: string | null
}

interface MetaPayload {
  __editorMeta?: EditorSnapshot
  [key: string]: unknown
}

export function serializeProjectSnapshot(snapshot: EditorSnapshot): Component[] {
  const activePage = snapshot.pages.find((page) => page.id === snapshot.activePageId) ?? snapshot.pages[0]
  const components = activePage?.components ?? []

  if (components.length === 0) {
    return [{
      id: 1,
      name: 'Page',
      props: {
        __editorMeta: snapshot,
      },
      desc: '页面',
    }]
  }

  const [root, ...rest] = components
  return [
    {
      ...root,
      props: {
        ...root.props,
        __editorMeta: snapshot,
      },
    },
    ...rest,
  ]
}

export function createDirtySnapshot(snapshot: EditorSnapshot): string {
  return JSON.stringify(snapshot)
}

export function createPersistedSnapshot(snapshot: EditorSnapshot): string {
  return createDirtySnapshot(snapshot)
}

export function deserializeProjectSnapshot(components: Component[]): EditorSnapshot | null {
  const root = components[0]
  const meta = (root?.props as MetaPayload | undefined)?.__editorMeta

  if (!meta || !isEditorSnapshot(meta)) {
    return null
  }

  return meta
}

export function isEditorSnapshot(value: unknown): value is EditorSnapshot {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const snapshot = value as Partial<EditorSnapshot>
  const hasPages = Array.isArray(snapshot.pages) && snapshot.pages.length > 0 && snapshot.pages.every((page) => (
    typeof page === 'object'
    && page !== null
    && typeof page.id === 'string'
    && typeof page.name === 'string'
    && Array.isArray(page.components)
  ))
  const pageIds = snapshot.pages?.map((page) => page.id) ?? []
  const uniquePageIds = new Set(pageIds).size === pageIds.length
  const hasDataSources = Array.isArray(snapshot.dataSources) && snapshot.dataSources.every((item) => (
    typeof item === 'object'
    && item !== null
    && typeof (item as { id?: unknown }).id === 'string'
    && typeof (item as { name?: unknown }).name === 'string'
    && typeof (item as { resultKey?: unknown }).resultKey === 'string'
    && typeof (item as { method?: unknown }).method === 'string'
    && typeof (item as { url?: unknown }).url === 'string'
  ))
  const hasSharedStyles = Array.isArray(snapshot.sharedStyles) && snapshot.sharedStyles.every((item) => (
    typeof item === 'object'
    && item !== null
    && typeof (item as { id?: unknown }).id === 'string'
    && typeof (item as { name?: unknown }).name === 'string'
    && typeof (item as { styles?: unknown }).styles === 'object'
    && (item as { styles?: unknown }).styles !== null
  ))
  const hasVariables = typeof snapshot.variables === 'object' && snapshot.variables !== null && !Array.isArray(snapshot.variables)
  const hasThemeId = snapshot.themeId === null || typeof snapshot.themeId === 'string'
  const hasActivePageId = snapshot.activePageId === null || typeof snapshot.activePageId === 'string'
  const activePageExists = snapshot.activePageId === null || snapshot.pages?.some((page) => page.id === snapshot.activePageId)

  return hasPages && uniquePageIds && hasDataSources && hasSharedStyles && hasVariables && hasThemeId && hasActivePageId && Boolean(activePageExists)
}

export function stripSnapshotMeta(components: Component[]): Component[] {
  if (!components[0]) {
    return components
  }

  const [root, ...rest] = components
  const restProps = { ...((root.props as MetaPayload) ?? {}) }
  delete restProps.__editorMeta

  return [
    {
      ...root,
      props: restProps,
    },
    ...rest,
  ]
}
