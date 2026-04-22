import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  getMaterialMarketEntryState,
  loadMaterialMarketEntryHidden,
  MATERIAL_MARKET_ENTRY_HIDDEN_STORAGE_KEY,
  saveMaterialMarketEntryHidden,
} from './market-entry'

describe('material market entry state', () => {
  beforeEach(() => {
    vi.unstubAllGlobals()
  })

  it('shows the full market entry by default', () => {
    expect(getMaterialMarketEntryState(false)).toEqual({
      showBanner: true,
      toggleLabel: '隐藏',
    })
  })

  it('falls back to a restore action after hiding', () => {
    expect(getMaterialMarketEntryState(true)).toEqual({
      showBanner: false,
      toggleLabel: '市场入口',
    })
  })

  it('loads and saves hidden preference from localStorage', () => {
    const getItem = vi.fn(() => '1')
    const setItem = vi.fn()
    const removeItem = vi.fn()

    vi.stubGlobal('window', {
      localStorage: {
        getItem,
        setItem,
        removeItem,
      },
    })

    expect(loadMaterialMarketEntryHidden()).toBe(true)

    saveMaterialMarketEntryHidden(true)
    expect(setItem).toHaveBeenCalledWith(MATERIAL_MARKET_ENTRY_HIDDEN_STORAGE_KEY, '1')

    saveMaterialMarketEntryHidden(false)
    expect(removeItem).toHaveBeenCalledWith(MATERIAL_MARKET_ENTRY_HIDDEN_STORAGE_KEY)
  })
})
