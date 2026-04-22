import { describe, expect, it } from 'vitest'
import { filterManagedComponents, getComponentManagerEmptyText, getComponentManagerTitle } from './component-manager-utils'
import type { CustomComponentDefinition } from '../../utils/custom-component-storage'

const components: CustomComponentDefinition[] = [
  {
    id: 'user-1',
    name: 'StatsCard',
    displayName: '统计卡片',
    description: '自定义卡片',
    code: 'export default function Component() { return null }',
    defaultProps: {},
    setterConfig: [],
    source: 'user',
    createdAt: 1,
    updatedAt: 1,
  },
  {
    id: 'market-1',
    name: 'GradientCard',
    displayName: '渐变卡片',
    description: '市场卡片',
    code: 'export default function Component() { return null }',
    defaultProps: {},
    setterConfig: [],
    source: 'market',
    createdAt: 2,
    updatedAt: 2,
  },
]

describe('component manager utils', () => {
  it('filters custom manager to user components only', () => {
    expect(filterManagedComponents(components, 'user', '')).toEqual([components[0]])
  })

  it('filters market manager to installed market components only', () => {
    expect(filterManagedComponents(components, 'market', '')).toEqual([components[1]])
  })

  it('applies search after source filtering', () => {
    expect(filterManagedComponents(components, 'market', '渐变')).toEqual([components[1]])
    expect(filterManagedComponents(components, 'market', '统计')).toEqual([])
  })

  it('returns manager labels by source', () => {
    expect(getComponentManagerTitle('user')).toBe('自定义组件管理')
    expect(getComponentManagerTitle('market')).toBe('市场组件管理')
    expect(getComponentManagerEmptyText('user')).toContain('创建')
    expect(getComponentManagerEmptyText('market')).toBe('暂无已安装的市场组件')
  })
})
