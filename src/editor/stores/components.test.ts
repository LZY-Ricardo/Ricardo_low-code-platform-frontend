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

  it('replaceComponents pushes history for undo', () => {
    const nextComponents: Component[] = [
      {
        id: 1,
        name: 'Page',
        props: {},
        desc: '页面',
        children: [
          {
            id: 2,
            name: 'Title',
            props: { text: 'AI 页面' },
            desc: '标题',
            parentId: 1,
          },
        ],
      },
    ]

    useComponentsStore.getState().replaceComponents(nextComponents)
    expect(useComponentsStore.getState().history.past).toHaveLength(1)

    useComponentsStore.getState().undo()
    expect(useComponentsStore.getState().components[0].children?.[0]?.name).toBe('Container')
  })

  it('resetComponents replaces history snapshot', () => {
    const nextComponents: Component[] = [
      {
        id: 1,
        name: 'Page',
        props: {},
        desc: '页面',
      },
    ]

    useComponentsStore.getState().resetComponents(nextComponents)

    const state = useComponentsStore.getState()
    expect(state.history.past).toHaveLength(0)
    expect(state.components[0].name).toBe('Page')
  })
})
