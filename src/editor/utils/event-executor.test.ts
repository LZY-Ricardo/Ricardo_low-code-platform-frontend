import { beforeEach, describe, expect, it, vi } from 'vitest'
import { eventExecutor } from './event-executor'
import { useDataSourceStore } from '../stores/data-source'
import { useRuntimeStateStore } from '../stores/runtime-state'
import { useProjectStore } from '../stores/project'
import { useComponentsStore } from '../stores/components'
import type { ComponentEvent, EventContext } from '../types/event'

beforeEach(() => {
  useDataSourceStore.setState({
    dataSources: [],
    activeDataSourceId: null,
  })
  useRuntimeStateStore.setState({
    variables: {},
    requestResults: {},
  })
  useProjectStore.setState({
    currentProject: null,
    projects: [],
    pages: [],
    activePageId: null,
    loading: false,
    saveStatus: 'idle',
    lastSavedAt: null,
    lastPersistedSnapshot: '',
  })
  useComponentsStore.setState({
    components: [],
    curComponentId: null,
    curComponent: null,
    mode: 'preview',
    canvasScale: 1,
    history: { past: [], present: [], future: [] },
  })
})

const context: EventContext = {
  componentId: 1,
  eventType: 'onClick',
  eventData: undefined,
  components: [],
  variables: {},
  requestResults: {},
  getComponentById: () => null,
  updateComponentProps: () => undefined,
}

describe('event executor callAPI', () => {
  it('stores inline request results into runtime state', async () => {
    const fetchMock = vi.fn(async () => ({
      ok: true,
      json: async () => [{ id: 1, name: '张三' }],
    }))
    vi.stubGlobal('fetch', fetchMock)

    const event: ComponentEvent = {
      eventType: 'onClick',
      actionType: 'callAPI',
      actionConfig: {
        url: '/api/users',
        method: 'GET',
        resultKey: 'userList',
      },
    }

    await eventExecutor.executeAction(event, context)

    expect(useRuntimeStateStore.getState().requestResults.userList).toEqual([{ id: 1, name: '张三' }])
  })

  it('uses configured data source and its result key', async () => {
    useDataSourceStore.setState({
      dataSources: [{
        id: 'ds_users',
        name: '用户列表',
        resultKey: 'users',
        method: 'GET',
        url: '/api/users',
      }],
      activeDataSourceId: 'ds_users',
    })

    const fetchMock = vi.fn(async () => ({
      ok: true,
      json: async () => [{ id: 2, name: '李四' }],
    }))
    vi.stubGlobal('fetch', fetchMock)

    const event: ComponentEvent = {
      eventType: 'onClick',
      actionType: 'callAPI',
      actionConfig: {
        dataSourceId: 'ds_users',
        url: '',
        method: 'GET',
      },
    }

    await eventExecutor.executeAction(event, context)

    expect(useRuntimeStateStore.getState().requestResults.users).toEqual([{ id: 2, name: '李四' }])
  })

  it('navigates to an internal page when page target is configured', async () => {
    useProjectStore.setState({
      pages: [
        { id: 'page_1', name: '页面 1', components: [{ id: 1, name: 'Page', props: {}, desc: '页面' }] },
        { id: 'page_2', name: '页面 2', components: [{ id: 1, name: 'Page', props: { title: 'B' }, desc: '页面' }] },
      ],
      activePageId: 'page_1',
    })
    useComponentsStore.setState({
      components: [{ id: 1, name: 'Page', props: {}, desc: '页面' }],
      curComponentId: null,
      curComponent: null,
      mode: 'preview',
      canvasScale: 1,
      history: { past: [], present: [], future: [] },
    })

    await eventExecutor.executeAction({
      eventType: 'onClick',
      actionType: 'navigate',
      actionConfig: {
        targetType: 'page',
        pageId: 'page_2',
        url: '',
      },
    }, context)

    expect(useProjectStore.getState().activePageId).toBe('page_2')
    expect(useComponentsStore.getState().components[0].props).toEqual({ title: 'B' })
  })

  it('executes chained actions in order', async () => {
    const fetchMock = vi.fn(async () => ({
      ok: true,
      json: async () => [{ id: 3, name: '王五' }],
    }))
    vi.stubGlobal('fetch', fetchMock)

    const updateComponentProps = vi.fn()
    const chainedContext: EventContext = {
      ...context,
      updateComponentProps,
    }

    const event: ComponentEvent = {
      eventType: 'onClick',
      actionType: 'callAPI',
      actionConfig: {
        url: '/api/users',
        method: 'GET',
        resultKey: 'users',
        actions: [
          {
            actionType: 'setState',
            actionConfig: {
              componentId: 99,
              props: { text: '已完成' },
            },
          },
        ],
      },
    }

    await eventExecutor.executeAction(event, chainedContext)

    expect(useRuntimeStateStore.getState().requestResults.users).toEqual([{ id: 3, name: '王五' }])
    expect(updateComponentProps).toHaveBeenCalledWith(99, { text: '已完成' })
  })
})
