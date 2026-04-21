import { beforeEach, describe, expect, it } from 'vitest'
import { DEFAULT_ACTION_DEFINITIONS, useActionRegistryStore } from './action-registry'

beforeEach(() => {
  useActionRegistryStore.setState({
    actions: DEFAULT_ACTION_DEFINITIONS,
  })
})

describe('action registry store', () => {
  it('returns default actions', () => {
    expect(useActionRegistryStore.getState().actions.some((item) => item.value === 'navigate')).toBe(true)
  })

  it('registers custom actions', () => {
    useActionRegistryStore.getState().registerAction({
      value: 'customScript',
      label: '自定义脚本',
      defaultConfig: { script: '' },
      fields: [],
      executorKey: 'customScript',
    })

    expect(useActionRegistryStore.getState().actions.some((item) => item.value === 'customScript')).toBe(true)
  })
})
