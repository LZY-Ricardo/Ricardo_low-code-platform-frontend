import { describe, expect, it } from 'vitest'
import { MATERIAL_NAV_GROUPS, MATERIAL_NAV_ITEMS } from './material-nav'

describe('material navigation metadata', () => {
  it('keeps editor panels in the expected grouped order', () => {
    expect(MATERIAL_NAV_ITEMS.map((item) => item.key)).toEqual([
      '物料',
      '资源',
      '大纲',
      '源码',
      '智能',
    ])

    expect(MATERIAL_NAV_GROUPS).toEqual([
      {
        title: '高频',
        keys: ['物料', '大纲', '智能'],
      },
      {
        title: '扩展',
        keys: ['资源', '源码'],
      },
    ])
  })
})
