import type { CustomComponentDefinition } from '../../utils/custom-component-storage'

export type ComponentManagerSource = 'user' | 'market'

export function filterManagedComponents(
  components: CustomComponentDefinition[],
  source: ComponentManagerSource,
  search: string,
): CustomComponentDefinition[] {
  const keyword = search.trim().toLowerCase()

  return components.filter((component) => {
    if (component.source !== source) {
      return false
    }

    if (!keyword) {
      return true
    }

    return (
      component.name.toLowerCase().includes(keyword) ||
      component.displayName.toLowerCase().includes(keyword)
    )
  })
}

export function getComponentManagerTitle(source: ComponentManagerSource): string {
  return source === 'market' ? '市场组件管理' : '自定义组件管理'
}

export function getComponentManagerEmptyText(source: ComponentManagerSource): string {
  return source === 'market'
    ? '暂无已安装的市场组件'
    : '暂无自定义组件，点击上方按钮创建'
}
