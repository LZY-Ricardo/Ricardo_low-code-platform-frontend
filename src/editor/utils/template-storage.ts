import type { Component } from '../stores/components'
import type { DataSource } from '../stores/data-source'
import type { SharedStyleDefinition } from '../stores/shared-styles'
import { createPage, type EditorPage } from './page-model'

export interface ProjectTemplate {
  id: string
  name: string
  description: string
  category?: string
  components: Component[]
  pages: EditorPage[]
  dataSources: DataSource[]
  variables: Record<string, unknown>
  sharedStyles: SharedStyleDefinition[]
  themeId: string | null
  builtIn: boolean
}

const STORAGE_KEY = 'lowcode_project_templates'

export function loadCustomTemplates(): ProjectTemplate[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return []
    }

    const parsed = JSON.parse(raw) as ProjectTemplate[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveTemplate(template: ProjectTemplate): void {
  const templates = loadCustomTemplates().filter((item) => item.id !== template.id)
  templates.unshift({ ...template, builtIn: false })
  localStorage.setItem(STORAGE_KEY, JSON.stringify(templates))
}

export function normalizeTemplatePages(template: Pick<ProjectTemplate, 'pages' | 'components'>): EditorPage[] {
  if (template.pages?.length) {
    return template.pages
  }

  return [createPage('页面 1', template.components)]
}
