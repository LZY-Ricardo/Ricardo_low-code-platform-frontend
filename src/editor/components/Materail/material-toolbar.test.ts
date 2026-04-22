import { describe, expect, it } from 'vitest'
import { getMaterialToolbarActions, shouldShowMaterialToolbarMenu } from './material-toolbar'

describe('material toolbar actions', () => {
  it('shows market and hide actions when market entry is visible', () => {
    expect(getMaterialToolbarActions(false)).toEqual(['market', 'hide'])
  })

  it('shows restore action when market entry is hidden', () => {
    expect(getMaterialToolbarActions(true)).toEqual(['restore'])
  })

  it('removes the visible more-menu trigger after hiding', () => {
    expect(shouldShowMaterialToolbarMenu(false)).toBe(true)
    expect(shouldShowMaterialToolbarMenu(true)).toBe(false)
  })
})
