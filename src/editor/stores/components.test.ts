import { beforeEach, describe, expect, it } from 'vitest'
import { useComponentsStore, type Component } from './components'
import { createHistoryState } from '../utils/component-history'

function createContainerTree(): Component[] {
  return [
    {
      id: 1,
      name: 'Page',
      props: {},
      desc: '页面',
      children: [
        {
          id: 2,
          name: 'Container',
          props: {},
          desc: '容器',
          parentId: 1,
          children: [
            {
              id: 3,
              name: 'Button',
              props: { text: '按钮' },
              desc: '按钮',
              parentId: 2,
            },
          ],
        },
      ],
    },
  ]
}

beforeEach(() => {
  const components = createContainerTree()
  useComponentsStore.setState({
    components,
    curComponentId: 2,
    curComponent: components[0].children?.[0] ?? null,
    mode: 'edit',
    canvasScale: 1,
    history: createHistoryState(components),
  })
})

describe('components store copy selection', () => {
  it('selects the copied root component instead of a copied descendant', () => {
    useComponentsStore.getState().copyComponent(2)

    const state = useComponentsStore.getState()
    expect(state.curComponentId).not.toBe(3)

    const selected = state.components[0].children?.find((item) => item.id === state.curComponentId)
    expect(selected?.name).toBe('Container')
  })
})
