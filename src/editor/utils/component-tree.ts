import type { CSSProperties } from 'react'
import type { ComponentEvent } from '../types/event'

export interface EditorComponent {
  id: number
  name: string
  props: Record<string, unknown>
  bindings?: Record<string, string>
  sharedStyleId?: string
  styles?: CSSProperties
  events?: Record<string, ComponentEvent>
  desc: string
  children?: EditorComponent[]
  parentId?: number
}

export function createEmptyEditorTree(): EditorComponent[] {
  return [
    {
      id: 1,
      name: 'Page',
      props: {},
      desc: '页面',
    },
  ]
}

export function getComponentById(id: number | null, components: EditorComponent[]): EditorComponent | null {
  if (!id) {
    return null
  }

  for (const component of components) {
    if (component.id === id) {
      return component
    }

    if (component.children?.length) {
      const child = getComponentById(id, component.children)
      if (child) {
        return child
      }
    }
  }

  return null
}

export function addComponentToTree(
  components: EditorComponent[],
  component: EditorComponent,
  parentId?: number,
): EditorComponent[] {
  const nextComponent = cloneComponent(component)

  if (!parentId) {
    return [...components, nextComponent]
  }

  return updateComponentInTree(components, parentId, (parent) => ({
    ...parent,
    children: [...(parent.children ?? []), { ...nextComponent, parentId }],
  }))
}

export function updateComponentInTree(
  components: EditorComponent[],
  componentId: number,
  updater: (component: EditorComponent) => EditorComponent,
): EditorComponent[] {
  return components.map((component) => {
    if (component.id === componentId) {
      return updater(cloneComponent(component))
    }

    if (!component.children?.length) {
      return component
    }

    return {
      ...component,
      children: updateComponentInTree(component.children, componentId, updater),
    }
  })
}

export function deleteComponentFromTree(components: EditorComponent[], componentId: number): EditorComponent[] {
  return components
    .filter((component) => component.id !== componentId)
    .map((component) => ({
      ...component,
      children: component.children?.length ? deleteComponentFromTree(component.children, componentId) : component.children,
    }))
}

export function copyComponentInTree(components: EditorComponent[], componentId: number): EditorComponent[] {
  return copyComponentWithMetadata(components, componentId).components
}

export function copyComponentWithMetadata(
  components: EditorComponent[],
  componentId: number,
): { components: EditorComponent[]; copiedRootId: number | null } {
  const source = getComponentById(componentId, components)
  if (!source) {
    return { components, copiedRootId: null }
  }

  const idFactory = createIdFactory(components)
  const parentId = source.parentId
  const copied = cloneComponentTree(source, idFactory, parentId)

  return {
    components: addComponentToTree(components, copied, parentId),
    copiedRootId: copied.id,
  }
}

export function moveComponentInTree(
  components: EditorComponent[],
  componentId: number,
  targetParentId: number,
  targetIndex?: number,
): EditorComponent[] {
  const component = getComponentById(componentId, components)
  if (!component || componentId === 1) {
    return components
  }

  if (componentId === targetParentId || isDescendant(component, targetParentId)) {
    return components
  }

  const normalizedTargetIndex = adjustTargetIndexForSameParent(components, component, targetParentId, targetIndex)
  const removed = deleteComponentFromTree(components, componentId)
  return insertIntoParent(removed, { ...cloneComponent(component), parentId: targetParentId }, targetParentId, normalizedTargetIndex)
}

function insertIntoParent(
  components: EditorComponent[],
  component: EditorComponent,
  targetParentId: number,
  targetIndex?: number,
): EditorComponent[] {
  return components.map((node) => {
    if (node.id === targetParentId) {
      const nextChildren = [...(node.children ?? [])]
      const insertIndex = normalizeInsertIndex(nextChildren.length, targetIndex)
      nextChildren.splice(insertIndex, 0, component)

      return {
        ...node,
        children: nextChildren,
      }
    }

    if (!node.children?.length) {
      return node
    }

    return {
      ...node,
      children: insertIntoParent(node.children, component, targetParentId, targetIndex),
    }
  })
}

function normalizeInsertIndex(length: number, targetIndex?: number): number {
  if (targetIndex === undefined || Number.isNaN(targetIndex)) {
    return length
  }

  return Math.min(Math.max(targetIndex, 0), length)
}

function adjustTargetIndexForSameParent(
  components: EditorComponent[],
  component: EditorComponent,
  targetParentId: number,
  targetIndex?: number,
): number | undefined {
  if (targetIndex === undefined || component.parentId !== targetParentId) {
    return targetIndex
  }

  const siblings = getChildrenByParentId(components, targetParentId)
  const currentIndex = siblings.findIndex((item) => item.id === component.id)

  if (currentIndex === -1 || currentIndex >= targetIndex) {
    return targetIndex
  }

  return targetIndex - 1
}

function getChildrenByParentId(components: EditorComponent[], parentId: number): EditorComponent[] {
  const parent = getComponentById(parentId, components)
  return parent?.children ?? []
}

function isDescendant(component: EditorComponent, targetId: number): boolean {
  if (!component.children?.length) {
    return false
  }

  return component.children.some((child) => child.id === targetId || isDescendant(child, targetId))
}

function cloneComponent(component: EditorComponent): EditorComponent {
  return {
    ...component,
    props: { ...component.props },
    bindings: component.bindings ? { ...component.bindings } : component.bindings,
    sharedStyleId: component.sharedStyleId,
    styles: component.styles ? { ...component.styles } : component.styles,
    events: component.events ? { ...component.events } : component.events,
    children: component.children?.map(cloneComponent),
  }
}

function cloneComponentTree(
  component: EditorComponent,
  nextId: () => number,
  parentId?: number,
): EditorComponent {
  const newId = nextId()

  return {
    ...component,
    id: newId,
    parentId,
    props: { ...component.props },
    bindings: component.bindings ? { ...component.bindings } : component.bindings,
    sharedStyleId: component.sharedStyleId,
    styles: component.styles ? { ...component.styles } : component.styles,
    events: component.events ? { ...component.events } : component.events,
    children: component.children?.map((child) => cloneComponentTree(child, nextId, newId)),
  }
}

function createIdFactory(components: EditorComponent[]): () => number {
  let current = findMaxId(components)
  return () => {
    current += 1
    return current
  }
}

function findMaxId(components: EditorComponent[]): number {
  return components.reduce((maxId, component) => {
    const childMax = component.children?.length ? findMaxId(component.children) : 0
    return Math.max(maxId, component.id, childMax)
  }, 0)
}
