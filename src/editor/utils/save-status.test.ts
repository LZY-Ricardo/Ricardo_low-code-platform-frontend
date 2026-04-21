import { describe, expect, it } from 'vitest'
import { formatSaveStatusText, shouldMarkDirty } from './save-status'

describe('save status utilities', () => {
  it('marks editor dirty only when current content differs from persisted snapshot', () => {
    expect(shouldMarkDirty('a', 'b')).toBe(true)
    expect(shouldMarkDirty('same', 'same')).toBe(false)
  })

  it('formats user-facing save status text', () => {
    expect(formatSaveStatusText('dirty')).toBe('未保存')
    expect(formatSaveStatusText('saving')).toBe('保存中...')
    expect(formatSaveStatusText('saved')).toBe('已保存')
    expect(formatSaveStatusText('error')).toBe('保存失败')
  })
})
