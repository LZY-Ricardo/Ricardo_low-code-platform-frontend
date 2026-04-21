import { describe, expect, it } from 'vitest'
import { normalizeGridSpan } from './props'

describe('grid props', () => {
  it('clamps span into 1..24', () => {
    expect(normalizeGridSpan(8)).toBe(8)
    expect(normalizeGridSpan(0)).toBe(1)
    expect(normalizeGridSpan(40)).toBe(24)
  })

  it('falls back to 24 for invalid values', () => {
    expect(normalizeGridSpan(undefined)).toBe(24)
    expect(normalizeGridSpan('other')).toBe(24)
  })
})
