import { create } from 'zustand'
import * as templatesApi from '../api/templates'
import type {
  TemplateItem,
  TemplateDetail,
  TemplateCategory,
  TemplateQueryParams,
  CreateTemplateRequest,
  UpdateTemplateRequest,
} from '../api/templates'

interface TemplateState {
  templates: TemplateItem[]
  total: number
  page: number
  pageSize: number
  totalPages: number
  loading: boolean
  filters: {
    category?: TemplateCategory
    search?: string
    builtIn?: boolean
    mine?: boolean
  }
}

interface TemplateActions {
  loadTemplates: (params?: TemplateQueryParams) => Promise<void>
  getTemplate: (id: string) => Promise<TemplateDetail>
  createTemplate: (data: CreateTemplateRequest) => Promise<TemplateDetail>
  updateTemplate: (id: string, data: UpdateTemplateRequest) => Promise<TemplateDetail>
  deleteTemplate: (id: string) => Promise<void>
  useTemplate: (id: string) => Promise<void>
  setFilter: (filters: Partial<TemplateState['filters']>) => void
  resetFilters: () => void
}

export const useTemplateStore = create<TemplateState & TemplateActions>((set, get) => ({
  templates: [],
  total: 0,
  page: 1,
  pageSize: 12,
  totalPages: 0,
  loading: false,
  filters: {},

  loadTemplates: async (params?: TemplateQueryParams) => {
    set({ loading: true })
    try {
      const { filters, page, pageSize } = get()
      const response = await templatesApi.getTemplates({
        page: params?.page ?? page,
        pageSize: params?.pageSize ?? pageSize,
        category: params?.category ?? filters.category,
        search: params?.search ?? filters.search,
        builtIn: params?.builtIn ?? filters.builtIn,
        mine: params?.mine ?? filters.mine,
      })
      set({
        templates: response.templates,
        total: response.pagination.total,
        page: response.pagination.page,
        pageSize: response.pagination.pageSize,
        totalPages: response.pagination.totalPages,
        loading: false,
      })
    } catch {
      set({ loading: false })
    }
  },

  getTemplate: async (id: string) => {
    return templatesApi.getTemplate(id)
  },

  createTemplate: async (data) => {
    const template = await templatesApi.createTemplate(data)
    // 刷新列表
    await get().loadTemplates()
    return template
  },

  updateTemplate: async (id, data) => {
    const template = await templatesApi.updateTemplate(id, data)
    // 刷新列表
    await get().loadTemplates()
    return template
  },

  deleteTemplate: async (id) => {
    await templatesApi.deleteTemplate(id)
    // 从本地列表中移除
    set((state) => ({
      templates: state.templates.filter((t) => t.id !== id),
      total: state.total - 1,
    }))
  },

  useTemplate: async (id) => {
    await templatesApi.useTemplate(id)
    // 更新本地使用计数
    set((state) => ({
      templates: state.templates.map((t) =>
        t.id === id ? { ...t, useCount: t.useCount + 1 } : t
      ),
    }))
  },

  setFilter: (filters) => {
    set({ filters: { ...get().filters, ...filters }, page: 1 })
    get().loadTemplates({ ...get().filters, page: 1 })
  },

  resetFilters: () => {
    set({ filters: {}, page: 1 })
    get().loadTemplates({ page: 1 })
  },
}))
