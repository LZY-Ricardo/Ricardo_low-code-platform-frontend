import type { Component } from '../stores/components'

export function buildTemplatePageFromSubtree(component: Component): Component[] {
  const counter = { current: 1 }
  const child = normalizeSubtree(component, 2, 1, counter)
  return [{
    id: 1,
    name: 'Page',
    props: {},
    desc: '页面',
    children: [child],
  }]
}

function normalizeSubtree(
  component: Component,
  id: number,
  parentId: number | undefined,
  counter: { current: number },
): Component {
  const next: Component = {
    ...component,
    id,
    parentId,
    children: undefined,
  }

  if (component.children?.length) {
    next.children = component.children.map((child) => {
      counter.current += 1
      return normalizeSubtree(child, counter.current, id, counter)
    })
  }

  return next
}
