import { useCustomComponentStore } from '../editor/stores/custom-component'
import type { CustomComponentMarketItem } from '../api/market'

export function installMarketComponentIntoEditor(component: CustomComponentMarketItem) {
  useCustomComponentStore.getState().installFromMarket({
    name: component.name,
    displayName: component.displayName,
    description: component.description || '',
    code: component.code,
    defaultProps: component.defaultProps || {},
    setterConfig: component.setterConfig || [],
  })
}
