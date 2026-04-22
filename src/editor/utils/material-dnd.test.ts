import { describe, expect, it } from 'vitest'
import {
  MATERIAL_DND_TYPE,
  createMaterialDragItem,
  isMaterialDragItem,
} from './material-dnd'

describe('material dnd helpers', () => {
  it('creates drag items under a shared material drag type', () => {
    expect(createMaterialDragItem('Custom_StatsCard')).toEqual({
      type: MATERIAL_DND_TYPE,
      componentName: 'Custom_StatsCard',
    })
  })

  it('recognizes valid material drag items', () => {
    expect(isMaterialDragItem({
      type: MATERIAL_DND_TYPE,
      componentName: 'Market_GradientCard',
    })).toBe(true)
  })

  it('rejects invalid material drag items', () => {
    expect(isMaterialDragItem({
      type: 'Button',
      componentName: 'Button',
    })).toBe(false)
  })
})
