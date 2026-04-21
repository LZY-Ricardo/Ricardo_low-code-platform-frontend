import type { DataSource } from '../stores/data-source'
import type { SharedStyleDefinition } from '../stores/shared-styles'
import type { EditorPage } from './page-model'
import { isEditorSnapshot } from './project-snapshot'

export interface ProjectMeta {
  dataSources: DataSource[]
  variables: Record<string, unknown>
  pages: EditorPage[]
  activePageId: string | null
  sharedStyles: SharedStyleDefinition[]
  themeId: string | null
}

const STORAGE_PREFIX = 'lowcode_'

function getMetaKey(projectId: string): string {
  return `${STORAGE_PREFIX}project_meta_${projectId}`
}

export function loadProjectMeta(projectId: string): ProjectMeta {
  try {
    const raw = localStorage.getItem(getMetaKey(projectId))
    if (!raw) {
      return { dataSources: [], variables: {}, pages: [], activePageId: null, sharedStyles: [], themeId: null }
    }

    const parsed = JSON.parse(raw) as Partial<ProjectMeta>
    if (!isEditorSnapshot({
      pages: Array.isArray(parsed.pages) ? parsed.pages : [],
      activePageId: typeof parsed.activePageId === 'string' ? parsed.activePageId : null,
      dataSources: Array.isArray(parsed.dataSources) ? parsed.dataSources : [],
      variables: typeof parsed.variables === 'object' && parsed.variables !== null ? parsed.variables : {},
      sharedStyles: Array.isArray(parsed.sharedStyles) ? parsed.sharedStyles : [],
      themeId: typeof parsed.themeId === 'string' ? parsed.themeId : null,
    })) {
      return { dataSources: [], variables: {}, pages: [], activePageId: null, sharedStyles: [], themeId: null }
    }

    return {
      dataSources: Array.isArray(parsed.dataSources) ? parsed.dataSources : [],
      variables: typeof parsed.variables === 'object' && parsed.variables !== null ? parsed.variables : {},
      pages: Array.isArray(parsed.pages) ? parsed.pages : [],
      activePageId: typeof parsed.activePageId === 'string' ? parsed.activePageId : null,
      sharedStyles: Array.isArray(parsed.sharedStyles) ? parsed.sharedStyles : [],
      themeId: typeof parsed.themeId === 'string' ? parsed.themeId : null,
    }
  } catch {
    return { dataSources: [], variables: {}, pages: [], activePageId: null, sharedStyles: [], themeId: null }
  }
}

export function saveProjectMeta(projectId: string, meta: ProjectMeta): void {
  localStorage.setItem(getMetaKey(projectId), JSON.stringify(meta))
}
