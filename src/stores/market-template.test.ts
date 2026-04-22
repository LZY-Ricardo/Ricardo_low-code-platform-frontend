import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useMarketTemplateStore } from './market-template';

const createMock = vi.fn();
const mineMock = vi.fn();
const updateMock = vi.fn();
const deleteMock = vi.fn();

vi.mock('../api/market', () => ({
  createMarketTemplate: (...args: unknown[]) => createMock(...args),
  getMyMarketTemplates: (...args: unknown[]) => mineMock(...args),
  updateMarketTemplate: (...args: unknown[]) => updateMock(...args),
  deleteMarketTemplate: (...args: unknown[]) => deleteMock(...args),
}));

describe('useMarketTemplateStore', () => {
  beforeEach(() => {
    createMock.mockReset();
    mineMock.mockReset();
    updateMock.mockReset();
    deleteMock.mockReset();
    useMarketTemplateStore.setState({
      mineTemplates: [],
      loading: false,
      submitting: false,
    });
  });

  it('refreshes mine templates after create', async () => {
    createMock.mockResolvedValue({ id: 'tpl-1', isPublic: false });
    mineMock.mockResolvedValue([
      { id: 'tpl-1', name: '模板 A', isPublic: false, category: 'general', tags: [], description: '', thumbnail: null, components: [], pages: [], dataSources: {}, variables: {}, sharedStyles: [], themeId: null, useCount: 0, status: 'active', userId: 'u1', createdAt: '', updatedAt: '' },
    ]);

    await useMarketTemplateStore.getState().createTemplate({
      name: '模板 A',
      components: [],
      isPublic: false,
    } as any);

    expect(createMock).toHaveBeenCalledTimes(1);
    expect(mineMock).toHaveBeenCalledTimes(1);
    expect(useMarketTemplateStore.getState().mineTemplates).toHaveLength(1);
    expect(useMarketTemplateStore.getState().submitting).toBe(false);
  });

  it('toggles public state through update and refreshes local item', async () => {
    useMarketTemplateStore.setState({
      mineTemplates: [
        { id: 'tpl-1', name: '模板 A', isPublic: false, category: 'general', tags: [], description: '', thumbnail: null, components: [], pages: [], dataSources: {}, variables: {}, sharedStyles: [], themeId: null, useCount: 0, status: 'active', userId: 'u1', createdAt: '', updatedAt: '' },
      ] as any,
      loading: false,
      submitting: false,
    });
    updateMock.mockResolvedValue({ id: 'tpl-1', isPublic: true });

    await useMarketTemplateStore.getState().togglePublic('tpl-1', true);

    expect(updateMock).toHaveBeenCalledWith('tpl-1', { isPublic: true });
    expect(useMarketTemplateStore.getState().mineTemplates[0]?.isPublic).toBe(true);
  });

  it('removes template from local state after delete', async () => {
    useMarketTemplateStore.setState({
      mineTemplates: [
        { id: 'tpl-1', name: '模板 A', isPublic: false, category: 'general', tags: [], description: '', thumbnail: null, components: [], pages: [], dataSources: {}, variables: {}, sharedStyles: [], themeId: null, useCount: 0, status: 'active', userId: 'u1', createdAt: '', updatedAt: '' },
        { id: 'tpl-2', name: '模板 B', isPublic: true, category: 'general', tags: [], description: '', thumbnail: null, components: [], pages: [], dataSources: {}, variables: {}, sharedStyles: [], themeId: null, useCount: 0, status: 'active', userId: 'u1', createdAt: '', updatedAt: '' },
      ] as any,
      loading: false,
      submitting: false,
    });
    deleteMock.mockResolvedValue({ id: 'tpl-1' });

    await useMarketTemplateStore.getState().deleteTemplate('tpl-1');

    expect(deleteMock).toHaveBeenCalledWith('tpl-1');
    expect(useMarketTemplateStore.getState().mineTemplates.map((item) => item.id)).toEqual(['tpl-2']);
  });
});
