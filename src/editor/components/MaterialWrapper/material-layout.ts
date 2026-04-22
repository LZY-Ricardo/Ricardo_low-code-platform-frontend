import type { MaterialPanelKey } from './material-nav'

export const DEFAULT_MATERIAL_NAV_EXPANDED = false
export const MATERIAL_NAV_COLLAPSED_WIDTH = 56
export const MATERIAL_NAV_EXPANDED_WIDTH = 120

export function getMaterialNavItemPresentation(key: MaterialPanelKey, expanded: boolean) {
  if (expanded) {
    return {
      label: key,
      tooltip: null,
    }
  }

  return {
    label: null,
    tooltip: key,
  }
}
