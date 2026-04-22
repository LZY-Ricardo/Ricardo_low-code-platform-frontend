export const MATERIAL_MARKET_ENTRY_HIDDEN_STORAGE_KEY = 'lingocode.editor.material.market-entry-hidden'

export function getMaterialMarketEntryState(hidden: boolean) {
  if (hidden) {
    return {
      showBanner: false,
      toggleLabel: '市场入口',
    }
  }

  return {
    showBanner: true,
    toggleLabel: '隐藏',
  }
}

export function loadMaterialMarketEntryHidden() {
  if (typeof window === 'undefined') {
    return false
  }

  return window.localStorage.getItem(MATERIAL_MARKET_ENTRY_HIDDEN_STORAGE_KEY) === '1'
}

export function saveMaterialMarketEntryHidden(hidden: boolean) {
  if (typeof window === 'undefined') {
    return
  }

  if (hidden) {
    window.localStorage.setItem(MATERIAL_MARKET_ENTRY_HIDDEN_STORAGE_KEY, '1')
    return
  }

  window.localStorage.removeItem(MATERIAL_MARKET_ENTRY_HIDDEN_STORAGE_KEY)
}
