import type { ComponentConfigMap } from '../stores/component-config'
import { getComponentById, type EditorComponent } from './component-tree'

interface OutlineDropArgs {
  components: EditorComponent[]
  componentConfig: ComponentConfigMap
  dragId: number
  dropId: number
  dropToGap: boolean
  dropPosition: number
  dropPos: string
}

interface OutlineDropTarget {
  targetParentId: number
  targetIndex?: number
}

export function getOutlineDropTarget(args: OutlineDropArgs): OutlineDropTarget | null {
  const { components, componentConfig, dragId, dropId, dropToGap, dropPosition, dropPos } = args
  const dropComponent = getComponentById(dropId, components)
  if (!dropComponent || dragId === 1) {
    return null
  }

  const dropConfig = componentConfig[dropComponent.name]

  if (!dropToGap) {
    if (!dropConfig?.allowChildren) {
      return null
    }

    return {
      targetParentId: dropId,
    }
  }

  const targetParentId = dropComponent.parentId ?? 1
  const lastPos = dropPos.split('-').pop()
  const dropIndex = lastPos ? Number(lastPos) : 0

  return {
    targetParentId,
    targetIndex: dropPosition > 0 ? dropIndex + 1 : dropIndex,
  }
}
