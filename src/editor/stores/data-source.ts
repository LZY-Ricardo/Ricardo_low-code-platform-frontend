import { create } from 'zustand'

export type DataSourceMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'

export interface DataSource {
  id: string
  name: string
  resultKey: string
  method: DataSourceMethod
  url: string
  headersText?: string
  paramsText?: string
}

interface DataSourceState {
  dataSources: DataSource[]
  activeDataSourceId: string | null
}

interface DataSourceActions {
  addDataSource: (input: Omit<DataSource, 'id'>) => void
  updateDataSource: (id: string, patch: Partial<Omit<DataSource, 'id'>>) => void
  removeDataSource: (id: string) => void
  setActiveDataSourceId: (id: string | null) => void
  setDataSources: (dataSources: DataSource[]) => void
  clear: () => void
}

function createId(): string {
  return `ds_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

export const useDataSourceStore = create<DataSourceState & DataSourceActions>((set) => ({
  dataSources: [],
  activeDataSourceId: null,

  addDataSource: (input) => {
    const dataSource: DataSource = {
      id: createId(),
      ...input,
    }

    set((state) => ({
      dataSources: [...state.dataSources, dataSource],
      activeDataSourceId: dataSource.id,
    }))
  },

  updateDataSource: (id, patch) => {
    set((state) => ({
      dataSources: state.dataSources.map((item) => (
        item.id === id
          ? { ...item, ...patch }
          : item
      )),
    }))
  },

  removeDataSource: (id) => {
    set((state) => {
      const next = state.dataSources.filter((item) => item.id !== id)
      return {
        dataSources: next,
        activeDataSourceId: state.activeDataSourceId === id ? (next[0]?.id ?? null) : state.activeDataSourceId,
      }
    })
  },

  setActiveDataSourceId: (id) => {
    set({ activeDataSourceId: id })
  },

  setDataSources: (dataSources) => {
    set({
      dataSources,
      activeDataSourceId: dataSources[0]?.id ?? null,
    })
  },

  clear: () => {
    set({
      dataSources: [],
      activeDataSourceId: null,
    })
  },
}))
