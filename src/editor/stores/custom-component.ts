import { create } from 'zustand'
import MarketRuntimeDev from '../materials/MarketRuntime/dev'
import MarketRuntimeProd from '../materials/MarketRuntime/prod'
import { useComponentConfigStore } from './component-config'
import type { ComponentSetter } from './component-config'
import {
  loadCustomComponents,
  saveCustomComponents,
  type CustomComponentDefinition,
} from '../utils/custom-component-storage'

function normalizeSetterType(type: unknown): ComponentSetter['type'] {
  const value = typeof type === 'string' ? type : 'input'
  if (['input', 'textarea', 'select', 'inputNumber'].includes(value)) {
    return value as ComponentSetter['type']
  }
  return 'input'
}

function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

/** Generate a unique name by appending _copy, _copy2, _copy3, etc. */
function generateUniqueName(baseName: string, existingNames: Set<string>): string {
  let candidate = `${baseName}_copy`
  if (!existingNames.has(candidate)) return candidate
  let i = 2
  while (existingNames.has(`${baseName}_copy${i}`)) i++
  return `${baseName}_copy${i}`
}

interface CustomComponentState {
  components: CustomComponentDefinition[]
}

interface CustomComponentActions {
  loadFromStorage: () => void
  create: (def: Omit<CustomComponentDefinition, 'id' | 'createdAt' | 'updatedAt' | 'source'>) => CustomComponentDefinition | null
  installFromMarket: (marketComp: { name: string; displayName: string; description: string; code: string; defaultProps: Record<string, unknown>; setterConfig: Array<Record<string, unknown>> }) => boolean
  update: (id: string, partial: Partial<Omit<CustomComponentDefinition, 'id' | 'createdAt' | 'name' | 'source'>>) => CustomComponentDefinition | null
  promoteMarketToUser: (id: string, partial: Omit<CustomComponentDefinition, 'id' | 'createdAt' | 'updatedAt' | 'name' | 'source'>) => CustomComponentDefinition | null
  remove: (id: string) => boolean
  duplicate: (id: string) => CustomComponentDefinition | null
  getById: (id: string) => CustomComponentDefinition | undefined
  getByName: (name: string) => CustomComponentDefinition | undefined
  registerAllIntoEditor: () => void
  registerOne: (def: CustomComponentDefinition) => void
  unregisterOne: (configName: string) => void
}

/** Get the config prefix based on source */
function getConfigPrefix(source: 'user' | 'market'): string {
  return source === 'market' ? 'Market_' : 'Custom_'
}

export const useCustomComponentStore = create<CustomComponentState & CustomComponentActions>(
  (set, get) => ({
    components: [],

    loadFromStorage: () => {
      const components = loadCustomComponents()
      set({ components })
    },

    create: (def) => {
      const now = Date.now()
      const newDef: CustomComponentDefinition = {
        ...def,
        id: generateId(),
        source: 'user',
        createdAt: now,
        updatedAt: now,
      }
      const components = [...get().components, newDef]
      if (!saveCustomComponents(components)) return null
      set({ components })
      get().registerOne(newDef)
      return newDef
    },

    installFromMarket: (marketComp) => {
      // Check if already installed
      const existing = get().components.find(c => c.source === 'market' && c.name === marketComp.name)
      if (existing) {
        // Already installed, just re-register
        get().registerOne(existing)
        return true
      }

      const now = Date.now()
      const newDef: CustomComponentDefinition = {
        id: generateId(),
        name: marketComp.name,
        displayName: marketComp.displayName,
        description: marketComp.description,
        code: marketComp.code,
        defaultProps: marketComp.defaultProps,
        setterConfig: marketComp.setterConfig,
        source: 'market',
        createdAt: now,
        updatedAt: now,
      }
      const components = [...get().components, newDef]
      if (!saveCustomComponents(components)) return false
      set({ components })
      get().registerOne(newDef)
      return true
    },

    update: (id, partial) => {
      const components = get().components
      const index = components.findIndex((c) => c.id === id)
      if (index === -1) return null

      const old = components[index]
      const updated: CustomComponentDefinition = {
        ...old,
        ...partial,
        updatedAt: Date.now(),
      }

      const newComponents = [...components]
      newComponents[index] = updated
      if (!saveCustomComponents(newComponents)) return null
      set({ components: newComponents })

      // Re-register with updated config
      const prefix = getConfigPrefix(old.source)
      get().unregisterOne(`${prefix}${old.name}`)
      get().registerOne(updated)
      return updated
    },

    promoteMarketToUser: (id, partial) => {
      const components = get().components
      const source = components.find((component) => component.id === id)
      if (!source || source.source !== 'market') return null

      const now = Date.now()
      const promoted: CustomComponentDefinition = {
        ...source,
        ...partial,
        id: generateId(),
        source: 'user',
        createdAt: now,
        updatedAt: now,
      }

      const nextComponents = components
        .filter((component) => component.id !== id)
        .concat(promoted)
      if (!saveCustomComponents(nextComponents)) return null

      get().unregisterOne(`${getConfigPrefix(source.source)}${source.name}`)
      set({ components: nextComponents })
      get().registerOne(promoted)
      return promoted
    },

    remove: (id) => {
      const components = get().components
      const target = components.find((c) => c.id === id)
      if (!target) return false

      const prefix = getConfigPrefix(target.source)
      get().unregisterOne(`${prefix}${target.name}`)
      const filtered = components.filter((c) => c.id !== id)
      saveCustomComponents(filtered)
      set({ components: filtered })
      return true
    },

    duplicate: (id) => {
      const source = get().components.find((c) => c.id === id)
      if (!source) return null

      const existingNames = new Set(get().components.map((c) => c.name))
      const uniqueName = generateUniqueName(source.name, existingNames)

      const now = Date.now()
      const dup: CustomComponentDefinition = {
        ...source,
        id: generateId(),
        name: uniqueName,
        displayName: `${source.displayName} (副本)`,
        source: source.source,
        createdAt: now,
        updatedAt: now,
      }

      const components = [...get().components, dup]
      if (!saveCustomComponents(components)) return null
      set({ components })
      get().registerOne(dup)
      return dup
    },

    getById: (id) => get().components.find((c) => c.id === id),
    getByName: (name) => get().components.find((c) => c.name === name),

    registerAllIntoEditor: () => {
      get().components.forEach((def) => {
        get().registerOne(def)
      })
    },

    registerOne: (def) => {
      const prefix = getConfigPrefix(def.source)
      const configName = `${prefix}${def.name}`
      useComponentConfigStore.getState().registerComponent(configName, {
        name: configName,
        desc: def.description || def.displayName,
        tooltip: def.source === 'market'
          ? `市场组件 · ${def.displayName}`
          : `自定义组件 · ${def.displayName}`,
        defaultProps: {
          __marketCode: def.code,
          ...(def.defaultProps || {}),
        },
        setter: (def.setterConfig || []).map((item) => ({
          name: typeof item.name === 'string' ? item.name : 'prop',
          label: typeof item.label === 'string' ? item.label : '属性',
          type: normalizeSetterType(item.type),
          options: Array.isArray(item.options) ? item.options : undefined,
        })),
        dev: MarketRuntimeDev,
        prod: MarketRuntimeProd,
      })
    },

    unregisterOne: (configName: string) => {
      useComponentConfigStore.getState().unregisterComponent(configName)
    },
  }),
)
