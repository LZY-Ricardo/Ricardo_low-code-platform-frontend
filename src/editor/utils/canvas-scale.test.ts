import { describe, expect, it } from 'vitest'
import { clampCanvasScale, getNextCanvasScaleLabel, stepCanvasScale } from './canvas-scale'

describe('canvas scale utilities', () => {
  it('clamps scale into the supported range', () => {
    expect(clampCanvasScale(0.1)).toBe(0.5)
    expect(clampCanvasScale(1.25)).toBe(1.25)
    expect(clampCanvasScale(3)).toBe(2)
  })

  it('steps scale up and down with fixed increments', () => {
    expect(stepCanvasScale(1, 'in')).toBe(1.1)
    expect(stepCanvasScale(1, 'out')).toBe(0.9)
  })

  it('formats scale label as percentage', () => {
    expect(getNextCanvasScaleLabel(1)).toBe('100%')
    expect(getNextCanvasScaleLabel(0.85)).toBe('85%')
  })
})
