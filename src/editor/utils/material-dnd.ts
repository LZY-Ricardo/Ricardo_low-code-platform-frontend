export const MATERIAL_DND_TYPE = 'EDITOR_MATERIAL'

export interface MaterialDragItem {
  type: typeof MATERIAL_DND_TYPE
  componentName: string
}

export function createMaterialDragItem(componentName: string): MaterialDragItem {
  return {
    type: MATERIAL_DND_TYPE,
    componentName,
  }
}

export function isMaterialDragItem(value: unknown): value is MaterialDragItem {
  if (!value || typeof value !== 'object') {
    return false
  }

  const candidate = value as Partial<MaterialDragItem>
  return candidate.type === MATERIAL_DND_TYPE && typeof candidate.componentName === 'string' && candidate.componentName.length > 0
}
