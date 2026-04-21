import { create } from 'zustand'

interface RuntimeState {
  variables: Record<string, unknown>
  requestResults: Record<string, unknown>
}

interface RuntimeStateActions {
  setVariable: (key: string, value: unknown) => void
  removeVariable: (key: string) => void
  setVariables: (variables: Record<string, unknown>) => void
  setRequestResult: (key: string, value: unknown) => void
  clear: () => void
}

export const useRuntimeStateStore = create<RuntimeState & RuntimeStateActions>((set) => ({
  variables: {},
  requestResults: {},

  setVariable: (key, value) => {
    set((state) => ({
      variables: {
        ...state.variables,
        [key]: value,
      },
    }))
  },

  removeVariable: (key) => {
    set((state) => {
      const nextVariables = { ...state.variables }
      delete nextVariables[key]
      return { variables: nextVariables }
    })
  },

  setVariables: (variables) => {
    set({ variables })
  },

  setRequestResult: (key, value) => {
    set((state) => ({
      requestResults: {
        ...state.requestResults,
        [key]: value,
      },
    }))
  },

  clear: () => {
    set({
      variables: {},
      requestResults: {},
    })
  },
}))
