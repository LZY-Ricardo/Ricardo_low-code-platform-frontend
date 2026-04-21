import { create } from 'zustand'
import type { CSSProperties } from 'react'

export interface SharedStyleDefinition {
  id: string
  name: string
  styles: CSSProperties
}

interface SharedStylesState {
  sharedStyles: SharedStyleDefinition[]
  activeSharedStyleId: string | null
}

interface SharedStylesActions {
  addSharedStyle: (name: string, styles: CSSProperties) => SharedStyleDefinition
  updateSharedStyle: (id: string, styles: CSSProperties) => void
  removeSharedStyle: (id: string) => void
  setSharedStyles: (styles: SharedStyleDefinition[]) => void
  clear: () => void
}

function createId(): string {
  return `style_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

export const useSharedStylesStore = create<SharedStylesState & SharedStylesActions>((set) => ({
  sharedStyles: [],
  activeSharedStyleId: null,

  addSharedStyle: (name, styles) => {
    const definition: SharedStyleDefinition = {
      id: createId(),
      name,
      styles,
    }

    set((state) => ({
      sharedStyles: [...state.sharedStyles, definition],
      activeSharedStyleId: definition.id,
    }))
    return definition
  },

  updateSharedStyle: (id, styles) => {
    set((state) => ({
      sharedStyles: state.sharedStyles.map((item) => (
        item.id === id ? { ...item, styles } : item
      )),
    }))
  },

  removeSharedStyle: (id) => {
    set((state) => {
      const next = state.sharedStyles.filter((item) => item.id !== id)
      return {
        sharedStyles: next,
        activeSharedStyleId: state.activeSharedStyleId === id ? (next[0]?.id ?? null) : state.activeSharedStyleId,
      }
    })
  },

  setSharedStyles: (sharedStyles) => {
    set({
      sharedStyles,
      activeSharedStyleId: sharedStyles[0]?.id ?? null,
    })
  },

  clear: () => {
    set({
      sharedStyles: [],
      activeSharedStyleId: null,
    })
  },
}))
