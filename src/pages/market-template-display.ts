import type { MarketTemplateItem } from '../api/market';

export interface MarketTemplateDisplayMeta {
  categoryLabel: string;
  sceneSummary: string;
  highlightTags: string[];
  qualityLabel: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  dashboard: '数据看板',
  form: '表单流程',
  landing: '营销落地',
  layout: '页面布局',
  general: '通用模板',
};

const CATEGORY_SUMMARY: Record<string, string> = {
  dashboard: '适合后台首页、经营复盘和趋势分析',
  form: '适合录入、审批、筛选和数据提交',
  landing: '适合官网首屏、报名转化和营销活动',
  layout: '适合列表页、详情页、设置页等业务骨架',
  general: '适合通用中心页和高频管理页面',
};

const DEFAULT_TAGS: Record<string, string[]> = {
  dashboard: ['指标卡', '趋势图', '表格'],
  form: ['表单区', '录入项', '提交动作'],
  landing: ['首屏', '卖点区', 'CTA'],
  layout: ['信息区', '操作栏', '结构页'],
  general: ['高复用', '通用场景', '易改造'],
};

const KEYWORD_TAGS: Array<{ pattern: RegExp; tags: string[] }> = [
  { pattern: /订单|列表|管理/, tags: ['筛选区', '数据列表'] },
  { pattern: /详情|个人中心/, tags: ['资料卡', '信息区'] },
  { pattern: /审批|报名|招生|表单/, tags: ['表单流', '提交按钮'] },
  { pattern: /价格|落地页|活动|课程/, tags: ['营销页', '转化导向'] },
  { pattern: /通知/, tags: ['消息流', '快捷处理'] },
];

export function getMarketTemplateDisplayMeta(template: MarketTemplateItem): MarketTemplateDisplayMeta {
  const categoryLabel = CATEGORY_LABELS[template.category] ?? '模板';
  const sceneSummary = CATEGORY_SUMMARY[template.category] ?? '适合快速创建页面骨架';

  const tagSource = Array.isArray(template.tags) ? template.tags.filter(Boolean) : [];
  const keywordTags = KEYWORD_TAGS
    .filter((item) => item.pattern.test(`${template.name} ${template.description}`))
    .flatMap((item) => item.tags);
  const fallbackTags = DEFAULT_TAGS[template.category] ?? DEFAULT_TAGS.general;
  const highlightTags = Array.from(new Set([...tagSource, ...keywordTags, ...fallbackTags])).slice(0, 3);

  let qualityLabel = '新上架';
  if ((template.avgRating ?? 0) >= 4.6 && (template.reviewCount ?? 0) >= 3) {
    qualityLabel = '口碑稳定';
  } else if (template.useCount >= 50 || (template.likeCount ?? 0) >= 10) {
    qualityLabel = '高热度';
  } else if (template.useCount >= 10) {
    qualityLabel = '常用模板';
  }

  return {
    categoryLabel,
    sceneSummary,
    highlightTags,
    qualityLabel,
  };
}
