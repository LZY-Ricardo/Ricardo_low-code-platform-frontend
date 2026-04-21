import { beforeEach, describe, expect, it } from 'vitest'
import { useSharedStylesStore } from './shared-styles'

beforeEach(() => {
  useSharedStylesStore.setState({
    sharedStyles: [],
    activeSharedStyleId: null,
  })
})

describe('shared styles store', () => {
  it('adds a shared style and marks it active', () => {
    useSharedStylesStore.getState().addSharedStyle('卡片风格', { borderRadius: 12 })
    const state = useSharedStylesStore.getState()
    expect(state.sharedStyles).toHaveLength(1)
    expect(state.activeSharedStyleId).toBe(state.sharedStyles[0].id)
  })

  it('updates an existing shared style', () => {
    useSharedStylesStore.getState().addSharedStyle('卡片风格', { borderRadius: 12 })
    const id = useSharedStylesStore.getState().sharedStyles[0].id
    useSharedStylesStore.getState().updateSharedStyle(id, { borderRadius: 16 })
    expect(useSharedStylesStore.getState().sharedStyles[0].styles).toEqual({ borderRadius: 16 })
  })
})
