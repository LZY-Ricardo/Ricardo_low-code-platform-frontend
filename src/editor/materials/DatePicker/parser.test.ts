import { describe, expect, it } from 'vitest'
import { getDatePickerNextValue, normalizeDatePickerValue } from './parser'

describe('date picker parser', () => {
  it('returns undefined for empty values', () => {
    expect(normalizeDatePickerValue('')).toBeUndefined()
    expect(normalizeDatePickerValue(undefined)).toBeUndefined()
  })

  it('keeps valid date strings', () => {
    expect(normalizeDatePickerValue('2026-04-21')).toBe('2026-04-21')
  })

  it('extracts the next controlled value from picker changes', () => {
    expect(getDatePickerNextValue('2026-04-23')).toBe('2026-04-23')
    expect(getDatePickerNextValue(['2026-04-24', '2026-04-25'])).toBe('2026-04-24')
    expect(getDatePickerNextValue('')).toBeUndefined()
  })
})
