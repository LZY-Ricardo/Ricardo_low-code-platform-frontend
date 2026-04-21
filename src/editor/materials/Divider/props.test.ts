import { describe, expect, it } from 'vitest'
import { normalizeDividerOrientation } from './props'

describe('divider props', () => {
  it('keeps supported orientations', () => {
    expect(normalizeDividerOrientation('left')).toBe('left')
    expect(normalizeDividerOrientation('center')).toBe('center')
    expect(normalizeDividerOrientation('right')).toBe('right')
  })

  it('falls back to center for unsupported values', () => {
    expect(normalizeDividerOrientation('other')).toBe('center')
    expect(normalizeDividerOrientation(undefined)).toBe('center')
  })
})
