import type { Component } from '../stores/components'

export interface ReusableStructure {
  signature: string
  occurrenceIds: number[]
  sample: Component
}

export function findReusableStructures(components: Component[]): ReusableStructure[] {
  const map = new Map<string, { ids: number[]; sample: Component }>()

  traverse(components, (component) => {
    const signature = buildSignature(component)
    const item = map.get(signature)
    if (item) {
      item.ids.push(component.id)
    } else {
      map.set(signature, { ids: [component.id], sample: component })
    }
  })

  return [...map.entries()]
    .filter(([, value]) => value.ids.length > 1 && isMeaningfulStructure(value.sample))
    .map(([signature, value]) => ({
      signature,
      occurrenceIds: value.ids,
      sample: value.sample,
    }))
}

function buildSignature(component: Component): string {
  return JSON.stringify({
    name: component.name,
    props: component.props,
    children: component.children?.map(buildSignature) ?? [],
  })
}

function traverse(components: Component[], visitor: (component: Component) => void): void {
  components.forEach((component) => {
    visitor(component)
    if (component.children) {
      traverse(component.children, visitor)
    }
  })
}

function isMeaningfulStructure(component: Component): boolean {
  const childCount = component.children?.length ?? 0
  return childCount > 0 || ['Card', 'Container', 'Form', 'Row', 'Col', 'Modal'].includes(component.name)
}
