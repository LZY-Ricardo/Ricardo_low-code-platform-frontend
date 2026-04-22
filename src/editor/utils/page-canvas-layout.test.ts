import { describe, expect, it } from 'vitest'
import {
  editAreaCanvasFrameClassName,
  editAreaCanvasScalerClassName,
  rootPageCanvasClassName,
} from './page-canvas-layout'

describe('page canvas layout', () => {
  it('uses a full-width frame for the editable canvas area', () => {
    expect(editAreaCanvasFrameClassName).toContain('w-full')
    expect(editAreaCanvasFrameClassName).toContain('min-h-full')
  })

  it('keeps the scaled canvas wrapper stretched to the full viewport', () => {
    expect(editAreaCanvasScalerClassName).toContain('w-full')
    expect(editAreaCanvasScalerClassName).toContain('min-h-full')
  })

  it('makes the root page droppable across the full canvas', () => {
    expect(rootPageCanvasClassName).toContain('w-full')
    expect(rootPageCanvasClassName).toContain('min-h-full')
  })
})
