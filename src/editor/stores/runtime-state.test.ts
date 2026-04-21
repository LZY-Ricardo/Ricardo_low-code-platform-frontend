import { beforeEach, describe, expect, it } from 'vitest'
import { useRuntimeStateStore } from './runtime-state'

beforeEach(() => {
  useRuntimeStateStore.setState({
    variables: {},
    requestResults: {},
  })
})

describe('runtime state store', () => {
  it('sets variables by key', () => {
    useRuntimeStateStore.getState().setVariable('keyword', 'react')
    expect(useRuntimeStateStore.getState().variables.keyword).toBe('react')
  })

  it('stores request results by data source id', () => {
    useRuntimeStateStore.getState().setRequestResult('ds_users', [{ id: 1, name: '张三' }])
    expect(useRuntimeStateStore.getState().requestResults.ds_users).toEqual([{ id: 1, name: '张三' }])
  })

  it('sets and removes variables in batch', () => {
    const store = useRuntimeStateStore.getState()
    store.setVariables({ keyword: 'react', status: 'done' })
    expect(useRuntimeStateStore.getState().variables.keyword).toBe('react')
    store.removeVariable('keyword')
    expect(useRuntimeStateStore.getState().variables.keyword).toBeUndefined()
  })

  it('clears runtime state', () => {
    const store = useRuntimeStateStore.getState()
    store.setVariable('keyword', 'react')
    store.setRequestResult('ds_users', [{ id: 1 }])
    store.clear()

    expect(useRuntimeStateStore.getState().variables).toEqual({})
    expect(useRuntimeStateStore.getState().requestResults).toEqual({})
  })

  it('clears request results before rehydrating project variables', () => {
    const store = useRuntimeStateStore.getState()
    store.setRequestResult('userList', [{ id: 1 }])
    store.clear()
    store.setVariables({ keyword: 'react' })

    expect(useRuntimeStateStore.getState().variables).toEqual({ keyword: 'react' })
    expect(useRuntimeStateStore.getState().requestResults).toEqual({})
  })
})
