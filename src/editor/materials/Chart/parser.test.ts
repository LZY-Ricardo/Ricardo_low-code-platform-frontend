import { describe, expect, it } from 'vitest'
import { parseChartData, normalizeChartType } from './parser'

describe('chart parser', () => {
  it('parses chart rows into name/value pairs', () => {
    expect(parseChartData('访问量,120\n注册数,80')).toEqual([
      { name: '访问量', value: 120 },
      { name: '注册数', value: 80 },
    ])
  })

  it('ignores malformed rows and non-number values', () => {
    expect(parseChartData('访问量,120\n错误行\n注册数,abc\n留存,45')).toEqual([
      { name: '访问量', value: 120 },
      { name: '留存', value: 45 },
    ])
  })

  it('normalizes chart type with a safe fallback', () => {
    expect(normalizeChartType('bar')).toBe('bar')
    expect(normalizeChartType('line')).toBe('line')
    expect(normalizeChartType('pie')).toBe('pie')
    expect(normalizeChartType('other')).toBe('bar')
    expect(normalizeChartType(undefined)).toBe('bar')
  })
})
