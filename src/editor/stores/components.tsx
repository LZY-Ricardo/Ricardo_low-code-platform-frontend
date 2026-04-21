import { create } from 'zustand'
import type { CSSProperties } from 'react'
import type { ComponentEvent } from '../types/event'
import {
  addComponentToTree,
  copyComponentWithMetadata,
  createEmptyEditorTree,
  deleteComponentFromTree,
  getComponentById,
  moveComponentInTree,
  type EditorComponent,
  updateComponentInTree,
} from '../utils/component-tree'
import {
  applyHistorySnapshot,
  createHistoryState,
  pushHistory,
  redoHistory,
  undoHistory,
  type ComponentHistoryState,
} from '../utils/component-history'
import { clampCanvasScale, stepCanvasScale } from '../utils/canvas-scale'

export interface Component extends EditorComponent {
  events?: {
    [eventType: string]: ComponentEvent
  }
}

export interface State {
  components: Component[]
  curComponentId?: number | null
  curComponent: Component | null
  mode: 'edit' | 'preview'
  canvasScale: number
  history: ComponentHistoryState
}

export interface Action {
  addComponent: (component: Component, parentId?: number) => void
  deleteComponent: (componentId: number) => void
  copyComponent: (componentId: number) => void
  moveComponent: (componentId: number, targetParentId: number, targetIndex?: number) => void
  updateComponentProps: (componentId: number, props: Record<string, unknown>) => void
  updateComponentBindings: (componentId: number, bindings: Record<string, string>) => void
  updateComponentSharedStyle: (componentId: number, sharedStyleId: string | undefined) => void
  setCurComponentId: (componentId: number | null) => void
  updateComponentStyles: (componentId: number, styles: CSSProperties) => void
  updateComponentEvents: (componentId: number, events: Record<string, ComponentEvent>) => void
  undo: () => void
  redo: () => void
  zoomIn: () => void
  zoomOut: () => void
  resetCanvasScale: () => void
  setCanvasScale: (scale: number) => void
  setMode: (mode: 'edit' | 'preview') => void
  replaceComponents: (components: Component[]) => void
  resetComponents: (components: Component[]) => void
  setComponents: (components: Component[]) => void
}

const initialComponents = createEmptyEditorTree() as Component[]

export const useComponentsStore = create<State & Action>((set, get) => ({
  components: initialComponents,
  curComponentId: null,
  curComponent: null,
  mode: 'edit',
  canvasScale: 1,
  history: createHistoryState(initialComponents),

  addComponent: (component, parentId) => {
    const nextComponents = addComponentToTree(get().components, component, parentId) as Component[]
    syncComponents(set, get, nextComponents)
  },

  deleteComponent: (componentId) => {
    if (!componentId || componentId === 1) {
      return
    }

    const nextComponents = deleteComponentFromTree(get().components, componentId) as Component[]
    const selectedId = get().curComponentId === componentId ? null : get().curComponentId ?? null
    syncComponents(set, get, nextComponents, selectedId)
  },

  copyComponent: (componentId) => {
    if (!componentId) {
      return
    }

    const previous = get().components
    const { components: nextComponents, copiedRootId } = copyComponentWithMetadata(previous, componentId)
    if (nextComponents === previous) {
      return
    }

    syncComponents(set, get, nextComponents as Component[], copiedRootId)
  },

  moveComponent: (componentId, targetParentId, targetIndex) => {
    const nextComponents = moveComponentInTree(get().components, componentId, targetParentId, targetIndex) as Component[]
    syncComponents(set, get, nextComponents, get().curComponentId ?? null)
  },

  updateComponentProps: (componentId, props) => {
    const nextComponents = updateComponentInTree(get().components, componentId, (component) => ({
      ...component,
      props: { ...component.props, ...props },
    })) as Component[]
    syncComponents(set, get, nextComponents)
  },

  updateComponentBindings: (componentId, bindings) => {
    const nextComponents = updateComponentInTree(get().components, componentId, (component) => ({
      ...component,
      bindings,
    })) as Component[]
    syncComponents(set, get, nextComponents)
  },

  updateComponentSharedStyle: (componentId, sharedStyleId) => {
    const nextComponents = updateComponentInTree(get().components, componentId, (component) => ({
      ...component,
      sharedStyleId,
    })) as Component[]
    syncComponents(set, get, nextComponents)
  },

  setCurComponentId: (componentId) => {
    set((state) => ({
      curComponentId: componentId,
      curComponent: getComponentById(componentId, state.components) as Component | null,
    }))
  },

  updateComponentStyles: (componentId, styles) => {
    const nextComponents = updateComponentInTree(get().components, componentId, (component) => ({
      ...component,
      styles: { ...component.styles, ...styles },
    })) as Component[]
    syncComponents(set, get, nextComponents)
  },

  updateComponentEvents: (componentId, events) => {
    const nextComponents = updateComponentInTree(get().components, componentId, (component) => ({
      ...component,
      events: { ...component.events, ...events },
    })) as Component[]
    syncComponents(set, get, nextComponents)
  },

  undo: () => {
    const { history } = get()
    if (!history.past.length) {
      return
    }

    const nextHistory = undoHistory(history)
    applyHistoryToState(set, get, nextHistory)
  },

  redo: () => {
    const { history } = get()
    if (!history.future.length) {
      return
    }

    const nextHistory = redoHistory(history)
    applyHistoryToState(set, get, nextHistory)
  },

  zoomIn: () => {
    set((state) => ({
      canvasScale: stepCanvasScale(state.canvasScale, 'in'),
    }))
  },

  zoomOut: () => {
    set((state) => ({
      canvasScale: stepCanvasScale(state.canvasScale, 'out'),
    }))
  },

  resetCanvasScale: () => {
    set({
      canvasScale: 1,
    })
  },

  setCanvasScale: (scale) => {
    set({
      canvasScale: clampCanvasScale(scale),
    })
  },

  setMode: (mode) => {
    set({
      mode,
    })
  },

  replaceComponents: (components) => {
    syncComponents(set, get, components, null)
  },

  resetComponents: (components) => {
    const nextHistory = applyHistorySnapshot(get().history, components)
    set({
      components,
      history: nextHistory,
      curComponentId: null,
      curComponent: null,
    })
  },

  setComponents: (components) => {
    get().resetComponents(components)
  },
}))

function syncComponents(
  set: (partial: Partial<State & Action> | ((state: State & Action) => Partial<State & Action>)) => void,
  get: () => State & Action,
  components: Component[],
  preferredComponentId?: number | null,
): void {
  const state = get()
  if (components === state.components) {
    return
  }

  const nextHistory = pushHistory(state.history, components)
  const nextSelectedId = resolveSelectedId(preferredComponentId ?? state.curComponentId ?? null, components)

  set({
    components,
    history: nextHistory,
    curComponentId: nextSelectedId,
    curComponent: getComponentById(nextSelectedId, components) as Component | null,
  })
}

function applyHistoryToState(
  set: (partial: Partial<State & Action>) => void,
  get: () => State & Action,
  history: ComponentHistoryState,
): void {
  const nextSelectedId = resolveSelectedId(get().curComponentId ?? null, history.present)
  set({
    history,
    components: history.present as Component[],
    curComponentId: nextSelectedId,
    curComponent: getComponentById(nextSelectedId, history.present) as Component | null,
  })
}

function resolveSelectedId(componentId: number | null, components: Component[]): number | null {
  if (!componentId) {
    return null
  }

  return getComponentById(componentId, components) ? componentId : null
}

export { getComponentById }
