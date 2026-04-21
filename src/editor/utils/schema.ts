import type { Component } from '../stores/components'
import type { DataSource } from '../stores/data-source'
import type { SharedStyleDefinition } from '../stores/shared-styles'
import type { EditorPage } from './page-model'
import type { ComponentEvent, WorkflowAction } from '../types/event'

export interface EditorSchema {
  meta: {
    name: string
    version: string
    exportTime: string
  }
  themeId: string | null
  pages: EditorPage[]
  activePageId: string | null
  dataSources: DataSource[]
  variables: Record<string, unknown>
  sharedStyles: SharedStyleDefinition[]
}

export function createEditorSchema(input: {
  name: string
  pages: EditorPage[]
  activePageId: string | null
  dataSources: DataSource[]
  variables: Record<string, unknown>
  sharedStyles: SharedStyleDefinition[]
  themeId: string | null
}): EditorSchema {
  return {
    meta: {
      name: input.name,
      version: '1.0.0',
      exportTime: new Date().toISOString(),
    },
    themeId: input.themeId,
    pages: input.pages,
    activePageId: input.activePageId,
    dataSources: input.dataSources,
    variables: input.variables,
    sharedStyles: input.sharedStyles,
  }
}

export function isEditorSchema(value: unknown): value is EditorSchema {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const schema = value as Partial<EditorSchema>
  const hasMeta = typeof schema.meta === 'object' && schema.meta !== null
  const hasPages = Array.isArray(schema.pages) && schema.pages.length > 0
  const hasDataSources = Array.isArray(schema.dataSources) && schema.dataSources.every((item) => (
    typeof item === 'object'
    && item !== null
    && typeof (item as { id?: unknown }).id === 'string'
    && typeof (item as { name?: unknown }).name === 'string'
    && typeof (item as { resultKey?: unknown }).resultKey === 'string'
    && typeof (item as { method?: unknown }).method === 'string'
    && typeof (item as { url?: unknown }).url === 'string'
  ))
  const hasSharedStyles = Array.isArray(schema.sharedStyles) && schema.sharedStyles.every((item) => (
    typeof item === 'object'
    && item !== null
    && typeof (item as { id?: unknown }).id === 'string'
    && typeof (item as { name?: unknown }).name === 'string'
    && typeof (item as { styles?: unknown }).styles === 'object'
    && (item as { styles?: unknown }).styles !== null
  ))
  const hasVariables = isPlainObject(schema.variables)
  const hasThemeId = schema.themeId === null || typeof schema.themeId === 'string'
  const hasActivePageId = schema.activePageId === null || typeof schema.activePageId === 'string'
  const pagesAreValid = hasPages && schema.pages?.every((page) => (
    typeof page === 'object'
    && page !== null
    && typeof page.id === 'string'
    && typeof page.name === 'string'
    && Array.isArray(page.components)
    && page.components.every((component) => isComponentLike(component))
  )) === true
  const pageIds = schema.pages?.map((page) => page.id) ?? []
  const hasUniquePageIds = new Set(pageIds).size === pageIds.length
  const activePageExists = schema.activePageId === null || schema.pages?.some((page) => page.id === schema.activePageId)

  return hasMeta && hasPages && pagesAreValid && hasUniquePageIds && hasDataSources && hasSharedStyles && hasVariables && hasThemeId && hasActivePageId && Boolean(activePageExists)
}

export function createFallbackPages(components: Component[]): EditorPage[] {
  return [{
    id: 'page_fallback',
    name: '页面 1',
    components,
  }]
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isComponentLike(value: unknown): value is Component {
  return (
    typeof value === 'object'
    && value !== null
    && typeof (value as { id?: unknown }).id === 'number'
    && typeof (value as { name?: unknown }).name === 'string'
    && typeof (value as { desc?: unknown }).desc === 'string'
    && isPlainObject((value as { props?: unknown }).props)
    && isOptionalPlainObject((value as { styles?: unknown }).styles)
    && isOptionalBindings((value as { bindings?: unknown }).bindings)
    && isOptionalEvents((value as { events?: unknown }).events)
    && isOptionalChildren((value as { children?: unknown }).children)
  )
}

function isOptionalPlainObject(value: unknown): boolean {
  return value === undefined || isPlainObject(value)
}

function isOptionalBindings(value: unknown): boolean {
  return value === undefined || (
    isPlainObject(value)
    && Object.values(value).every((entry) => typeof entry === 'string')
  )
}

function isOptionalChildren(value: unknown): boolean {
  return value === undefined || (
    Array.isArray(value)
    && value.every((child) => isComponentLike(child))
  )
}

function isOptionalEvents(value: unknown): boolean {
  return value === undefined || (
    isPlainObject(value)
    && Object.values(value).every((event) => isComponentEventLike(event))
  )
}

function isComponentEventLike(value: unknown): value is ComponentEvent {
  return (
    isPlainObject(value)
    && typeof value.eventType === 'string'
    && typeof value.actionType === 'string'
    && isPlainObject(value.actionConfig)
    && isValidActionConfig(value.actionConfig)
  )
}

function isValidActionConfig(config: Record<string, unknown>): boolean {
  const actions = config.actions
  return actions === undefined || (
    Array.isArray(actions)
    && actions.every((action) => isWorkflowActionLike(action))
  )
}

function isWorkflowActionLike(value: unknown): value is WorkflowAction {
  return (
    isPlainObject(value)
    && typeof value.actionType === 'string'
    && isPlainObject(value.actionConfig)
    && isValidActionConfig(value.actionConfig)
  )
}
