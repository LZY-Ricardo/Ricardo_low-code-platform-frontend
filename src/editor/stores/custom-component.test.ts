import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useCustomComponentStore } from './custom-component'
import { useComponentConfigStore } from './component-config'

function createStorageMock() {
  const store = new Map<string, string>()

  return {
    getItem: vi.fn((key: string) => store.get(key) ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store.set(key, value)
    }),
    removeItem: vi.fn((key: string) => {
      store.delete(key)
    }),
    clear: vi.fn(() => {
      store.clear()
    }),
  }
}

beforeEach(() => {
  vi.stubGlobal('localStorage', createStorageMock())
  useCustomComponentStore.setState({ components: [] })
  useComponentConfigStore.setState({ componentConfig: {} })
})

describe('custom component store market promotion', () => {
  it('promotes edited market component into a user component', () => {
    const installed = useCustomComponentStore.getState().installFromMarket({
      name: 'GradientCard',
      displayName: '渐变卡片',
      description: '市场组件',
      code: 'export default function Component() { return <div>market</div> }',
      defaultProps: { title: '原始标题' },
      setterConfig: [],
    })

    expect(installed).toBe(true)

    const marketComponent = useCustomComponentStore.getState().components[0]
    const promoted = useCustomComponentStore.getState().promoteMarketToUser(marketComponent.id, {
      displayName: '渐变卡片 Pro',
      description: '已转为自定义组件',
      code: 'export default function Component() { return <div>custom</div> }',
      defaultProps: { title: '新标题' },
      setterConfig: [{ name: 'title', label: '标题', type: 'input' }],
    })

    expect(promoted).not.toBeNull()
    expect(promoted?.source).toBe('user')
    expect(promoted?.displayName).toBe('渐变卡片 Pro')

    const state = useCustomComponentStore.getState()
    expect(state.components).toHaveLength(1)
    expect(state.components[0].source).toBe('user')
    expect(state.components[0].id).not.toBe(marketComponent.id)
    expect(useComponentConfigStore.getState().componentConfig.Market_GradientCard).toBeUndefined()
    expect(useComponentConfigStore.getState().componentConfig.Custom_GradientCard).toBeDefined()
  })
})
