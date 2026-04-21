import { describe, expect, it } from 'vitest'
import { normalizeSwitchValue } from './props'

describe('switch props', () => {
  it('normalizes booleans directly', () => {
    expect(normalizeSwitchValue(true)).toBe(true)
    expect(normalizeSwitchValue(false)).toBe(false)
  })

  it('normalizes string flags to booleans', () => {
    expect(normalizeSwitchValue('true')).toBe(true)
    expect(normalizeSwitchValue('false')).toBe(false)
  })

  it('falls back to false for unknown values', () => {
    expect(normalizeSwitchValue(undefined)).toBe(false)
    expect(normalizeSwitchValue('other')).toBe(false)
  })
})
