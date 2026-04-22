import { describe, expect, it } from 'vitest'
import {
  DEFAULT_MATERIAL_NAV_EXPANDED,
  MATERIAL_NAV_COLLAPSED_WIDTH,
  MATERIAL_NAV_EXPANDED_WIDTH,
  getMaterialNavItemPresentation,
} from './material-layout'

describe('material wrapper layout helpers', () => {
  it('defaults the navigation to collapsed mode', () => {
    expect(DEFAULT_MATERIAL_NAV_EXPANDED).toBe(false)
  })

  it('uses narrow width and tooltip-only labels when collapsed', () => {
    expect(MATERIAL_NAV_COLLAPSED_WIDTH).toBe(56)

    expect(getMaterialNavItemPresentation('物料', false)).toEqual({
      label: null,
      tooltip: '物料',
    })
  })

  it('uses wider width and visible labels when expanded', () => {
    expect(MATERIAL_NAV_EXPANDED_WIDTH).toBe(120)

    expect(getMaterialNavItemPresentation('源码', true)).toEqual({
      label: '源码',
      tooltip: null,
    })
  })
})
