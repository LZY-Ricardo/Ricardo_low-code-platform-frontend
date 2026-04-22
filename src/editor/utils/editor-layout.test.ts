import { describe, expect, it } from 'vitest'
import {
  createDefaultEditorLayoutState,
  resetEditorLayoutState,
} from './editor-layout'

describe('editor layout state', () => {
  it('provides the default three-pane widths', () => {
    const state = createDefaultEditorLayoutState()

    expect(state.version).toBe(0)
    expect(state.left.preferredSize).toBe(353)
    expect(state.left.minSize).toBe(200)
    expect(state.left.maxSize).toBe(1200)
    expect(state.right.preferredSize).toBe(300)
    expect(state.right.minSize).toBe(300)
    expect(state.right.maxSize).toBe(500)
  })

  it('increments the layout version when resetting widths', () => {
    const nextState = resetEditorLayoutState({
      version: 2,
      left: {
        preferredSize: 320,
        minSize: 200,
        maxSize: 500,
      },
      right: {
        preferredSize: 360,
        minSize: 300,
        maxSize: 500,
      },
    })

    expect(nextState.version).toBe(3)
    expect(nextState.left.preferredSize).toBe(353)
    expect(nextState.right.preferredSize).toBe(300)
  })
})
