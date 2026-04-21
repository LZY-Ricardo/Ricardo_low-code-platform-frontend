import type { ActionType } from '../types/event'

export interface WorkflowActionLike {
  actionType: ActionType
  actionConfig: Record<string, unknown>
}

export function getChainedActions(actionConfig: Record<string, unknown>): WorkflowActionLike[] {
  return Array.isArray(actionConfig.actions) ? actionConfig.actions as WorkflowActionLike[] : []
}

export function buildJsActionSnippets(
  actionType: ActionType,
  actionConfig: Record<string, unknown>,
  escape: (text: string) => string,
): string[] {
  const snippets: string[] = []
  const content = typeof actionConfig.content === 'string' ? actionConfig.content : null
  const url = typeof actionConfig.url === 'string' ? actionConfig.url : null
  const pageId = typeof actionConfig.pageId === 'string' ? actionConfig.pageId : null
  const targetType = typeof actionConfig.targetType === 'string' ? actionConfig.targetType : 'url'
  const target = actionConfig.openInNewTab === true ? '_blank' : '_self'

  if (actionType === 'showMessage' && content) {
    snippets.push(`alert('${escape(content)}')`)
  } else if (actionType === 'navigate' && targetType === 'page' && pageId) {
    snippets.push(`window.location.hash = '${escape(pageId)}'`)
  } else if (actionType === 'navigate' && url) {
    snippets.push(`window.open('${escape(url)}', '${target}')`)
  } else if (actionType === 'callAPI' && url) {
    const method = typeof actionConfig.method === 'string' ? actionConfig.method : 'GET'
    snippets.push(`fetch('${escape(url)}', { method: '${escape(method)}' })`)
  }

  getChainedActions(actionConfig).forEach((action) => {
    snippets.push(...buildJsActionSnippets(action.actionType, action.actionConfig, escape))
  })

  return snippets
}
