import { create } from 'zustand'
import type { ActionType, EventContext } from '../types/event'
import {
  buildCallAPISnippets,
  buildCustomScriptSnippets,
  buildNavigateSnippets,
  buildSetStateSnippets,
  buildShowMessageSnippets,
  executeCallAPI,
  executeCustomScript,
  executeNavigate,
  executeSetState,
  executeShowMessage,
} from '../utils/action-handlers'

export interface ActionFieldDefinition {
  name: string
  label: string
  type: 'input' | 'textarea' | 'number' | 'select'
  options?: Array<{ label: string; value: string | number | boolean }>
}

export interface ActionDefinition {
  value: string
  label: string
  defaultConfig: Record<string, unknown>
  fields: ActionFieldDefinition[]
  executorKey: string
  execute?: (config: Record<string, unknown>, context: EventContext) => Promise<void>
  buildJsSnippets?: (config: Record<string, unknown>, escape: (text: string) => string) => string[]
}

export const DEFAULT_ACTION_DEFINITIONS: ActionDefinition[] = [
  {
    value: 'showMessage',
    label: '显示消息',
    defaultConfig: { type: 'success', content: '操作成功', duration: 3 },
    fields: [
      {
        name: 'type',
        label: '消息类型',
        type: 'select',
        options: [
          { label: '成功', value: 'success' },
          { label: '错误', value: 'error' },
          { label: '警告', value: 'warning' },
          { label: '信息', value: 'info' },
        ],
      },
      { name: 'content', label: '消息内容', type: 'input' },
      { name: 'duration', label: '显示时长(秒)', type: 'number' },
    ],
    executorKey: 'showMessage',
    execute: (config) => executeShowMessage(config as never),
    buildJsSnippets: buildShowMessageSnippets,
  },
  {
    value: 'navigate',
    label: '页面跳转',
    defaultConfig: { targetType: 'url', pageId: '', url: '', openInNewTab: false, actions: [] },
    fields: [],
    executorKey: 'navigate',
    execute: (config) => executeNavigate(config as never),
    buildJsSnippets: buildNavigateSnippets,
  },
  {
    value: 'setState',
    label: '更新组件状态',
    defaultConfig: { componentId: '', props: {} },
    fields: [
      { name: 'componentId', label: '目标组件ID', type: 'number' },
      { name: 'props', label: '属性配置(JSON)', type: 'textarea' },
    ],
    executorKey: 'setState',
    execute: (config, context) => executeSetState(config as never, context),
    buildJsSnippets: buildSetStateSnippets,
  },
  {
    value: 'callAPI',
    label: '调用 API',
    defaultConfig: { dataSourceId: '', resultKey: '', url: '', method: 'GET', params: {}, actions: [] },
    fields: [],
    executorKey: 'callAPI',
    execute: (config) => executeCallAPI(config as never),
    buildJsSnippets: buildCallAPISnippets,
  },
  {
    value: 'customScript',
    label: '自定义脚本',
    defaultConfig: { script: '' },
    fields: [
      { name: 'script', label: '自定义脚本', type: 'textarea' },
    ],
    executorKey: 'customScript',
    execute: (config, context) => executeCustomScript(config as never, context),
    buildJsSnippets: buildCustomScriptSnippets,
  },
]

export type ActionExecutorMap = Record<ActionType, (config: Record<string, unknown>, context: EventContext) => Promise<void>>

interface ActionRegistryState {
  actions: ActionDefinition[]
}

interface ActionRegistryActions {
  registerAction: (action: ActionDefinition) => void
  getAction: (type: string) => ActionDefinition | undefined
}

export const useActionRegistryStore = create<ActionRegistryState & ActionRegistryActions>((set, get) => ({
  actions: DEFAULT_ACTION_DEFINITIONS,

  registerAction: (action) => {
    set((state) => ({
      actions: [...state.actions.filter((item) => item.value !== action.value), action],
    }))
  },

  getAction: (type) => get().actions.find((item) => item.value === type),
}))
