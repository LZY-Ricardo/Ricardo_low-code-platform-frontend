import { describe, expect, it } from 'vitest';
import { getRecommendedSections } from './template-recommendations';

const templates = [
  {
    id: 'tpl_dashboard',
    name: '综合数据看板',
    description: '',
    category: 'dashboard',
    thumbnail: 'thumb-a',
    builtIn: true,
    useCount: 9,
    userId: null,
    createdAt: '',
    updatedAt: '',
  },
  {
    id: 'tpl_order_management',
    name: '订单管理',
    description: '',
    category: 'layout',
    thumbnail: 'thumb-b',
    builtIn: true,
    useCount: 4,
    userId: null,
    createdAt: '',
    updatedAt: '',
  },
  {
    id: 'tpl_saas_landing',
    name: 'SaaS 产品落地页',
    description: '',
    category: 'landing',
    thumbnail: 'thumb-c',
    builtIn: true,
    useCount: 15,
    userId: null,
    createdAt: '',
    updatedAt: '',
  },
  {
    id: 'custom_template',
    name: '自定义模板',
    description: '',
    category: 'general',
    thumbnail: null,
    builtIn: false,
    useCount: 99,
    userId: 'user_1',
    createdAt: '',
    updatedAt: '',
  },
] as const;

describe('template recommendations', () => {
  it('returns featured sections using built-in templates only', () => {
    const sections = getRecommendedSections(templates as any, 'all');

    expect(sections.map((section) => section.key)).toContain('featured');
    expect(sections.find((section) => section.key === 'featured')?.templates.every((item) => item.builtIn)).toBe(true);
  });

  it('supports filtering by scene', () => {
    const sections = getRecommendedSections(templates as any, 'marketing');

    expect(sections).toHaveLength(1);
    expect(sections[0].key).toBe('marketing');
    expect(sections[0].templates[0].id).toBe('tpl_saas_landing');
  });
});
