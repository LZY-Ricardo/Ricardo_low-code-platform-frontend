import { describe, expect, it } from 'vitest'
import type { EditorComponent } from './component-tree'
import {
  addComponentToTree,
  copyComponentWithMetadata,
  copyComponentInTree,
  createEmptyEditorTree,
  deleteComponentFromTree,
  moveComponentInTree,
  updateComponentInTree,
} from './component-tree'

function createButton(id: number, text: string, parentId?: number): EditorComponent {
  return {
    id,
    name: 'Button',
    props: { text },
    desc: '按钮',
    styles: {},
    parentId,
  }
}

describe('component tree utilities', () => {
  it('adds a component under the target parent and sets parentId', () => {
    const tree = createEmptyEditorTree()

    const next = addComponentToTree(tree, createButton(2, '新增按钮'), 1)

    expect(next[0].children).toHaveLength(1)
    expect(next[0].children?.[0]).toMatchObject({
      id: 2,
      parentId: 1,
      props: { text: '新增按钮' },
    })
  })

  it('updates a nested component without mutating siblings', () => {
    const tree = addComponentToTree(createEmptyEditorTree(), createButton(2, '旧文案'), 1)

    const next = updateComponentInTree(tree, 2, (component) => ({
      ...component,
      props: { ...component.props, text: '新文案' },
    }))

    expect(next[0].children?.[0].props.text).toBe('新文案')
    expect(tree[0].children?.[0].props.text).toBe('旧文案')
  })

  it('deletes a nested component by id', () => {
    const tree = addComponentToTree(createEmptyEditorTree(), createButton(2, '待删除'), 1)

    const next = deleteComponentFromTree(tree, 2)

    expect(next[0].children ?? []).toHaveLength(0)
  })

  it('copies a component subtree and assigns fresh ids', () => {
    const withContainer = addComponentToTree(
      createEmptyEditorTree(),
      {
        id: 2,
        name: 'Container',
        props: {},
        desc: '容器',
        styles: {},
        parentId: 1,
        children: [createButton(3, '原按钮', 2)],
      },
      1,
    )

    const copied = copyComponentInTree(withContainer, 2)

    const pageChildren = copied[0].children ?? []
    expect(pageChildren).toHaveLength(2)
    expect(pageChildren[1].id).not.toBe(2)
    expect(pageChildren[1].parentId).toBe(1)
    expect(pageChildren[1].children?.[0].id).not.toBe(3)
    expect(pageChildren[1].children?.[0].parentId).toBe(pageChildren[1].id)
  })

  it('moves a component to a new parent and keeps ordering', () => {
    const tree = addComponentToTree(
      addComponentToTree(
        addComponentToTree(createEmptyEditorTree(), {
          id: 2,
          name: 'Container',
          props: {},
          desc: '容器A',
          styles: {},
          parentId: 1,
        }, 1),
        {
          id: 3,
          name: 'Container',
          props: {},
          desc: '容器B',
          styles: {},
          parentId: 1,
        },
        1,
      ),
      createButton(4, '可移动按钮', 2),
      2,
    )

    const moved = moveComponentInTree(tree, 4, 3, 0)

    expect(moved[0].children?.[0].children ?? []).toHaveLength(0)
    expect(moved[0].children?.[1].children?.[0]).toMatchObject({
      id: 4,
      parentId: 3,
    })
  })

  it('reorders correctly when moving within the same parent downward', () => {
    const tree = addComponentToTree(
      addComponentToTree(
        addComponentToTree(createEmptyEditorTree(), createButton(2, '按钮A', 1), 1),
        createButton(3, '按钮B', 1),
        1,
      ),
      createButton(4, '按钮C', 1),
      1,
    )

    const moved = moveComponentInTree(tree, 2, 1, 2)

    expect(moved[0].children?.map((item) => item.id)).toEqual([3, 2, 4])
  })

  it('returns copied root id instead of a descendant id', () => {
    const withContainer = addComponentToTree(
      createEmptyEditorTree(),
      {
        id: 2,
        name: 'Container',
        props: {},
        desc: '容器',
        styles: {},
        parentId: 1,
        children: [createButton(3, '原按钮', 2)],
      },
      1,
    )

    const copied = copyComponentWithMetadata(withContainer, 2)

    expect(copied.copiedRootId).not.toBeNull()
    const copiedRoot = copied.components[0].children?.find((item) => item.id === copied.copiedRootId)
    expect(copiedRoot?.name).toBe('Container')
    expect(copiedRoot?.children?.[0].parentId).toBe(copiedRoot?.id)
  })
})
