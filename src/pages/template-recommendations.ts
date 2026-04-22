import type { TemplateItem } from '../api/templates';

export type TemplateScene = 'featured' | 'business' | 'marketing' | 'utility';

export interface RecommendedTemplateSection {
  key: TemplateScene;
  title: string;
  description: string;
  templates: TemplateItem[];
}

const FEATURED_TEMPLATE_IDS = [
  'tpl_dashboard',
  'tpl_order_management',
  'tpl_saas_landing',
  'tpl_profile_center',
] as const;

const BUSINESS_TEMPLATE_IDS = [
  'tpl_dashboard',
  'tpl_sales_dashboard',
  'tpl_order_management',
  'tpl_user_detail',
  'tpl_approval_form',
  'tpl_system_settings',
] as const;

const MARKETING_TEMPLATE_IDS = [
  'tpl_saas_landing',
  'tpl_form',
  'tpl_pricing',
  'tpl_course_enrollment',
] as const;

const UTILITY_TEMPLATE_IDS = [
  'tpl_profile_center',
  'tpl_notification_center',
] as const;

const SECTION_CONFIG: Record<TemplateScene, { title: string; description: string; ids: readonly string[] }> = {
  featured: {
    title: '优先推荐',
    description: '适合快速起步的高复用模板',
    ids: FEATURED_TEMPLATE_IDS,
  },
  business: {
    title: '后台业务',
    description: '看板、列表、详情、审批、设置',
    ids: BUSINESS_TEMPLATE_IDS,
  },
  marketing: {
    title: '营销转化',
    description: '官网、报名、价格、招生',
    ids: MARKETING_TEMPLATE_IDS,
  },
  utility: {
    title: '通用管理',
    description: '个人中心、通知等高频页面',
    ids: UTILITY_TEMPLATE_IDS,
  },
};

function scoreTemplate(template: TemplateItem, order: number): number {
  const usageScore = Math.min(template.useCount, 50);
  const builtInScore = template.builtIn ? 100 : 0;
  const freshnessScore = Math.max(20 - order, 0);
  return builtInScore + usageScore + freshnessScore;
}

export function getRecommendedSections(
  templates: TemplateItem[],
  scene: TemplateScene | 'all',
): RecommendedTemplateSection[] {
  const builtInTemplates = templates.filter((template) => template.builtIn);
  const sections = (Object.keys(SECTION_CONFIG) as TemplateScene[])
    .filter((key) => scene === 'all' || key === scene)
    .map((key) => {
      const config = SECTION_CONFIG[key];
      const ordered = config.ids
        .map((id, index) => {
          const template = builtInTemplates.find((item) => item.id === id);
          return template ? { template, index } : null;
        })
        .filter((item): item is { template: TemplateItem; index: number } => item !== null)
        .sort((left, right) => scoreTemplate(right.template, right.index) - scoreTemplate(left.template, left.index))
        .map((item) => item.template);

      return {
        key,
        title: config.title,
        description: config.description,
        templates: ordered,
      };
    })
    .filter((section) => section.templates.length > 0);

  return sections;
}
