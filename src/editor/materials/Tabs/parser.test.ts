import { describe, expect, it } from 'vitest'
import { parseTabsItems } from './parser'

describe('tabs parser', () => {
  it('parses comma-separated labels into tabs items', () => {
    expect(parseTabsItems('概览,趋势,明细')).toEqual([
      { key: 'tab_0', label: '概览', children: '概览内容' },
      { key: 'tab_1', label: '趋势', children: '趋势内容' },
      { key: 'tab_2', label: '明细', children: '明细内容' },
    ])
  })

  it('ignores empty labels', () => {
    expect(parseTabsItems('概览, ,明细')).toEqual([
      { key: 'tab_0', label: '概览', children: '概览内容' },
      { key: 'tab_1', label: '明细', children: '明细内容' },
    ])
  })
})
