import { describe, expect, it } from 'vitest';
import { getMarketTemplateDisplayMeta } from './market-template-display';

describe('market template display meta', () => {
  it('builds scene summary and tags from category and keywords', () => {
    const meta = getMarketTemplateDisplayMeta({
      id: 'tpl-order',
      name: '订单管理',
      description: '包含筛选、列表与操作栏',
      category: 'layout',
      tags: [],
      thumbnail: null,
      components: [],
      pages: [],
      dataSources: [],
      variables: {},
      sharedStyles: [],
      themeId: 'ocean',
      useCount: 18,
      isPublic: true,
      status: 'active',
      userId: 'u1',
      createdAt: '',
      updatedAt: '',
      likeCount: 2,
      reviewCount: 0,
      avgRating: 0,
    });

    expect(meta.categoryLabel).toBe('页面布局');
    expect(meta.highlightTags).toEqual(expect.arrayContaining(['筛选区', '数据列表']));
    expect(meta.qualityLabel).toBe('常用模板');
  });

  it('prefers strong quality signal when rating and reviews are high', () => {
    const meta = getMarketTemplateDisplayMeta({
      id: 'tpl-landing',
      name: 'SaaS 产品落地页',
      description: '高转化官网首页',
      category: 'landing',
      tags: ['Hero', '产品卖点'],
      thumbnail: null,
      components: [],
      pages: [],
      dataSources: [],
      variables: {},
      sharedStyles: [],
      themeId: 'sunset',
      useCount: 8,
      isPublic: true,
      status: 'active',
      userId: 'u1',
      createdAt: '',
      updatedAt: '',
      likeCount: 4,
      reviewCount: 6,
      avgRating: 4.8,
    });

    expect(meta.qualityLabel).toBe('口碑稳定');
    expect(meta.highlightTags).toContain('Hero');
  });
});
