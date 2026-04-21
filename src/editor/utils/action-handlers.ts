import type {
  CallAPIConfig,
  CustomScriptConfig,
  EventContext,
  NavigateConfig,
  SetStateConfig,
  ShowMessageConfig,
} from '../types/event'
import { executeDataSourceRequest } from './request'
import { useDataSourceStore } from '../stores/data-source'
import { useRuntimeStateStore } from '../stores/runtime-state'
import { useProjectStore } from '../stores/project'
import { useComponentsStore } from '../stores/components'

export type EscapeFn = (text: string) => string

export async function executeShowMessage(config: ShowMessageConfig): Promise<void> {
  const { message } = await import('antd')
  message[config.type](config.content, config.duration || 3)
}

export async function executeNavigate(config: NavigateConfig): Promise<void> {
  if (config.targetType === 'page' && config.pageId) {
    const nextComponents = useProjectStore.getState().switchPage(config.pageId, useComponentsStore.getState().components)
    if (nextComponents) {
      useComponentsStore.getState().setComponents(nextComponents)
    }
    return
  }

  if (config.openInNewTab) {
    window.open(config.url, '_blank')
  } else {
    window.location.href = config.url
  }
}

export async function executeSetState(config: SetStateConfig, context: EventContext): Promise<void> {
  const props: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(config.props || {})) {
    props[key] = value
  }
  context.updateComponentProps(config.componentId, props)
}

export async function executeCallAPI(config: CallAPIConfig): Promise<void> {
  const selectedDataSource = config.dataSourceId
    ? useDataSourceStore.getState().dataSources.find((item) => item.id === config.dataSourceId)
    : null

  const data = selectedDataSource
    ? await executeDataSourceRequest(selectedDataSource)
    : await executeDataSourceRequest({
      method: config.method,
      url: config.url,
      headersText: config.headers ? JSON.stringify(config.headers) : '',
      paramsText: config.params ? JSON.stringify(config.params) : '',
    })

  const resultKey = config.resultKey || selectedDataSource?.resultKey || config.dataSourceId || 'lastResult'
  useRuntimeStateStore.getState().setRequestResult(resultKey, data)
}

export async function executeCustomScript(config: CustomScriptConfig, context: EventContext): Promise<void> {
  const func = new Function('context', config.script)
  func(context)
}

export function buildShowMessageSnippets(config: Record<string, unknown>, escape: EscapeFn): string[] {
  const content = typeof config.content === 'string' ? config.content : null
  return content ? [`alert('${escape(content)}')`] : []
}

export function buildNavigateSnippets(config: Record<string, unknown>, escape: EscapeFn): string[] {
  const targetType = typeof config.targetType === 'string' ? config.targetType : 'url'
  const pageId = typeof config.pageId === 'string' ? config.pageId : null
  const url = typeof config.url === 'string' ? config.url : null
  const target = config.openInNewTab === true ? '_blank' : '_self'

  if (targetType === 'page' && pageId) {
    return [`window.location.hash = '${escape(pageId)}'`]
  }

  return url ? [`window.open('${escape(url)}', '${target}')`] : []
}

export function buildCallAPISnippets(config: Record<string, unknown>, escape: EscapeFn): string[] {
  const url = typeof config.url === 'string' ? config.url : null
  const method = typeof config.method === 'string' ? config.method : 'GET'
  return url ? [`fetch('${escape(url)}', { method: '${escape(method)}' })`] : []
}

export function buildSetStateSnippets(): string[] {
  return [`console.warn('setState action requires runtime wiring')`]
}

export function buildCustomScriptSnippets(config: Record<string, unknown>): string[] {
  return typeof config.script === 'string' && config.script.trim() ? [config.script] : []
}
