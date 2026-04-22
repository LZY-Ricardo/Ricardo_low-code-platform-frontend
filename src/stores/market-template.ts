import { create } from 'zustand';
import {
  createMarketTemplate,
  deleteMarketTemplate,
  getMyMarketTemplates,
  updateMarketTemplate,
  type CreateMarketTemplateRequest,
  type MarketTemplateItem,
  type UpdateMarketTemplateRequest,
} from '../api/market';

interface MarketTemplateState {
  mineTemplates: MarketTemplateItem[];
  loading: boolean;
  submitting: boolean;
}

interface MarketTemplateActions {
  loadMineTemplates: () => Promise<void>;
  createTemplate: (data: CreateMarketTemplateRequest) => Promise<MarketTemplateItem>;
  updateTemplate: (id: string, data: UpdateMarketTemplateRequest) => Promise<MarketTemplateItem>;
  togglePublic: (id: string, isPublic: boolean) => Promise<MarketTemplateItem>;
  deleteTemplate: (id: string) => Promise<void>;
}

export const useMarketTemplateStore = create<MarketTemplateState & MarketTemplateActions>(
  (set, get) => ({
    mineTemplates: [],
    loading: false,
    submitting: false,

    loadMineTemplates: async () => {
      set({ loading: true });
      try {
        const templates = await getMyMarketTemplates();
        set({ mineTemplates: templates, loading: false });
      } catch (error) {
        set({ loading: false });
        throw error;
      }
    },

    createTemplate: async (data) => {
      set({ submitting: true });
      try {
        const created = await createMarketTemplate(data);
        const templates = await getMyMarketTemplates();
        set({ mineTemplates: templates, submitting: false });
        return created;
      } catch (error) {
        set({ submitting: false });
        throw error;
      }
    },

    updateTemplate: async (id, data) => {
      set({ submitting: true });
      try {
        const updated = await updateMarketTemplate(id, data);
        set((state) => ({
          mineTemplates: state.mineTemplates.map((item) =>
            item.id === id ? { ...item, ...updated } : item,
          ),
          submitting: false,
        }));
        return updated;
      } catch (error) {
        set({ submitting: false });
        throw error;
      }
    },

    togglePublic: async (id, isPublic): Promise<MarketTemplateItem> => {
      return await get().updateTemplate(id, { isPublic });
    },

    deleteTemplate: async (id) => {
      set({ submitting: true });
      try {
        await deleteMarketTemplate(id);
        set((state) => ({
          mineTemplates: state.mineTemplates.filter((item) => item.id !== id),
          submitting: false,
        }));
      } catch (error) {
        set({ submitting: false });
        throw error;
      }
    },
  }),
);
