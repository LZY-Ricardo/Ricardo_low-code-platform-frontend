import { describe, expect, it } from 'vitest';
import { buildMarketTemplatePayload } from './build-market-template-payload';

describe('buildMarketTemplatePayload', () => {
  it('builds payload from editor source and forces private visibility', () => {
    const result = buildMarketTemplatePayload({
      name: '运营后台模板',
      description: '带图表和表格',
      category: 'dashboard',
      tags: ['后台', '图表'],
      thumbnail: 'data:image/png;base64,xxx',
      source: {
        components: [{ id: 1, name: 'Page', props: {}, desc: '页面' }],
        pages: [{ id: 'page-1', name: '页面 1', components: [] }],
        dataSources: [{ id: 'ds-1', name: 'users', type: 'rest', config: {} }],
        variables: { tenant: 'acme' },
        sharedStyles: [{ id: 'style-1', name: '标题', rules: {} }],
        themeId: 'ocean',
      },
    });

    expect(result).toMatchObject({
      name: '运营后台模板',
      description: '带图表和表格',
      category: 'dashboard',
      tags: ['后台', '图表'],
      thumbnail: 'data:image/png;base64,xxx',
      themeId: 'ocean',
      isPublic: false,
    });
    expect(result.components).toHaveLength(1);
    expect(result.pages).toHaveLength(1);
    expect(result.dataSources).toHaveLength(1);
    expect(result.sharedStyles).toHaveLength(1);
    expect(result.variables).toEqual({ tenant: 'acme' });
  });

  it('falls back to defaults for optional fields', () => {
    const result = buildMarketTemplatePayload({
      name: '空白模板',
      source: {
        components: [],
      },
    });

    expect(result).toMatchObject({
      name: '空白模板',
      description: '',
      category: 'general',
      tags: [],
      pages: [],
      dataSources: [],
      variables: {},
      sharedStyles: [],
      themeId: null,
      isPublic: false,
    });
  });
});
