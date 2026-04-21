import { describe, expect, it } from 'vitest'
import { normalizeSelectOptions, parseSelectOptions } from './parser'

describe('select parser', () => {
  it('parses comma-separated options into select entries', () => {
    expect(parseSelectOptions('全部,进行中,已完成')).toEqual([
      { label: '全部', value: '全部' },
      { label: '进行中', value: '进行中' },
      { label: '已完成', value: '已完成' },
    ])
  })

  it('ignores empty items', () => {
    expect(parseSelectOptions('全部, ,已完成')).toEqual([
      { label: '全部', value: '全部' },
      { label: '已完成', value: '已完成' },
    ])
  })

  it('normalizes bound options arrays', () => {
    expect(normalizeSelectOptions(['全部', '进行中'])).toEqual([
      { label: '全部', value: '全部' },
      { label: '进行中', value: '进行中' },
    ])
    expect(normalizeSelectOptions([{ label: '完成', value: 'done' }])).toEqual([
      { label: '完成', value: 'done' },
    ])
  })
})
