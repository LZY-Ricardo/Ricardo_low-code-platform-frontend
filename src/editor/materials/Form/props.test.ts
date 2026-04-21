import { describe, expect, it } from 'vitest'
import { normalizeFormLayout } from './props'

describe('form props', () => {
  it('keeps supported layouts', () => {
    expect(normalizeFormLayout('horizontal')).toBe('horizontal')
    expect(normalizeFormLayout('vertical')).toBe('vertical')
    expect(normalizeFormLayout('inline')).toBe('inline')
  })

  it('falls back to vertical for unsupported values', () => {
    expect(normalizeFormLayout('other')).toBe('vertical')
    expect(normalizeFormLayout(undefined)).toBe('vertical')
  })
})
