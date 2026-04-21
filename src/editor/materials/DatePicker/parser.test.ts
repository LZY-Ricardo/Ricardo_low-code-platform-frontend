import { describe, expect, it } from 'vitest'
import { normalizeDatePickerValue } from './parser'

describe('date picker parser', () => {
  it('returns undefined for empty values', () => {
    expect(normalizeDatePickerValue('')).toBeUndefined()
    expect(normalizeDatePickerValue(undefined)).toBeUndefined()
  })

  it('keeps valid date strings', () => {
    expect(normalizeDatePickerValue('2026-04-21')).toBe('2026-04-21')
  })
})
