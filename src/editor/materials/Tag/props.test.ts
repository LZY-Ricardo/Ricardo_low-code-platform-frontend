import { describe, expect, it } from 'vitest'
import { normalizeTagColor } from './props'

describe('tag props', () => {
  it('keeps non-empty color strings', () => {
    expect(normalizeTagColor('success')).toBe('success')
    expect(normalizeTagColor('#1677ff')).toBe('#1677ff')
  })

  it('falls back to default color', () => {
    expect(normalizeTagColor('')).toBe('default')
    expect(normalizeTagColor(undefined)).toBe('default')
  })
})
