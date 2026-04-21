import { describe, expect, it } from 'vitest'
import type { EditorComponent } from './component-tree'
import type { ComponentConfigMap } from '../stores/component-config'
import { getOutlineDropTarget } from './outline-drop'

const componentConfig = {
  Page: {
    name: 'Page',
    desc: '页面',
    defaultProps: {},
    allowChildren: true,
    dev: (() => null) as never,
    prod: (() => null) as never,
  },
  Container: {
    name: 'Container',
    desc: '容器',
    defaultProps: {},
    allowChildren: true,
    dev: (() => null) as never,
    prod: (() => null) as never,
  },
  Button: {
    name: 'Button',
    desc: '按钮',
    defaultProps: {},
    dev: (() => null) as never,
    prod: (() => null) as never,
  },
} as ComponentConfigMap

const tree: EditorComponent[] = [
  {
    id: 1,
    name: 'Page',
    desc: '页面',
    props: {},
    children: [
      {
        id: 2,
        name: 'Container',
        desc: '容器',
        props: {},
        parentId: 1,
        children: [
          {
            id: 3,
            name: 'Button',
            desc: '按钮A',
            props: {},
            parentId: 2,
          },
        ],
      },
      {
        id: 4,
        name: 'Button',
        desc: '按钮B',
        props: {},
        parentId: 1,
      },
    ],
  },
]

describe('outline drop target', () => {
  it('allows dropping directly into container components', () => {
    const target = getOutlineDropTarget({
      components: tree,
      componentConfig,
      dragId: 4,
      dropId: 2,
      dropToGap: false,
      dropPosition: 0,
      dropPos: '0-0',
    })

    expect(target).toEqual({
      targetParentId: 2,
      targetIndex: undefined,
    })
  })

  it('falls back to parent insertion when dropping onto non-container gaps', () => {
    const target = getOutlineDropTarget({
      components: tree,
      componentConfig,
      dragId: 3,
      dropId: 4,
      dropToGap: true,
      dropPosition: 1,
      dropPos: '0-1',
    })

    expect(target).toEqual({
      targetParentId: 1,
      targetIndex: 2,
    })
  })

  it('rejects dropping into a non-container node', () => {
    const target = getOutlineDropTarget({
      components: tree,
      componentConfig,
      dragId: 2,
      dropId: 4,
      dropToGap: false,
      dropPosition: 0,
      dropPos: '0-1',
    })

    expect(target).toBeNull()
  })

  it('drops before the current sibling when gap position is above', () => {
    const target = getOutlineDropTarget({
      components: tree,
      componentConfig,
      dragId: 4,
      dropId: 2,
      dropToGap: true,
      dropPosition: -1,
      dropPos: '0-0',
    })

    expect(target).toEqual({
      targetParentId: 1,
      targetIndex: 0,
    })
  })
})
