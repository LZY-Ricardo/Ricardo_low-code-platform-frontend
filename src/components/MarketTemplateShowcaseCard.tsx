import { Button, Card, Tag } from 'antd';
import type { ReactNode } from 'react';
import type { MarketTemplateItem } from '../api/market';
import { getMarketTemplateDisplayMeta } from '../pages/market-template-display';

interface MarketTemplateShowcaseCardProps {
  template: MarketTemplateItem;
  onOpen?: (template: MarketTemplateItem) => void;
  primaryActionLabel: string;
  onPrimaryAction: (template: MarketTemplateItem) => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: (template: MarketTemplateItem) => void;
  statusSlot?: ReactNode;
  extraActionsSlot?: ReactNode;
}

function createFallbackPreview(template: MarketTemplateItem) {
  const meta = getMarketTemplateDisplayMeta(template);
  const accentStyle =
    template.category === 'form'
      ? { backgroundImage: 'linear-gradient(135deg, var(--theme-success-soft), rgb(var(--bg-secondary)))' }
      : template.category === 'landing'
        ? { backgroundImage: 'linear-gradient(135deg, var(--theme-primary-muted), rgb(var(--bg-secondary)))' }
        : { backgroundImage: 'var(--surface-muted)' };

  return (
    <div className="flex h-full min-h-[220px] flex-col justify-between rounded-3xl p-5" style={accentStyle}>
      <div className="space-y-3">
        <div className="h-4 w-24 rounded-full bg-bg-secondary/70" />
        <div className="h-24 rounded-2xl bg-bg-secondary/90 shadow-soft ring-1 ring-bg-secondary/70" />
      </div>
      <div className="space-y-2">
        <div className="text-base font-semibold text-text-primary">{template.name}</div>
        <div className="text-xs text-text-secondary">{meta.highlightTags.join(' · ')}</div>
      </div>
    </div>
  );
}

export default function MarketTemplateShowcaseCard({
  template,
  onOpen,
  primaryActionLabel,
  onPrimaryAction,
  secondaryActionLabel,
  onSecondaryAction,
  statusSlot,
  extraActionsSlot,
}: MarketTemplateShowcaseCardProps) {
  const meta = getMarketTemplateDisplayMeta(template);
  const stats = [
    { label: '使用', value: template.useCount },
    { label: '评分', value: (template.avgRating ?? 0).toFixed(1) },
    { label: '评论', value: template.reviewCount ?? 0 },
  ];

  return (
    <Card
      hoverable
      className="overflow-hidden rounded-[28px] border border-border-light bg-bg-secondary shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
      styles={{ body: { padding: 0 } }}
      onClick={() => onOpen?.(template)}
    >
      <div className="grid grid-cols-1 gap-0 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="relative border-b border-border-light bg-bg-primary lg:border-b-0 lg:border-r">
          {template.thumbnail ? (
            <img
              src={template.thumbnail}
              alt={template.name}
              className="h-full min-h-[220px] w-full object-cover"
            />
          ) : (
            createFallbackPreview(template)
          )}
          <div className="absolute left-4 top-4 flex flex-wrap gap-2">
            <Tag className="rounded-full border-0 bg-bg-secondary/90 px-3 py-1 text-xs font-medium text-text-primary shadow-soft">
              {meta.categoryLabel}
            </Tag>
            <Tag className="rounded-full border-0 px-3 py-1 text-xs font-medium text-white shadow-soft" style={{ backgroundColor: 'rgb(var(--text-primary))' }}>
              {meta.qualityLabel}
            </Tag>
          </div>
        </div>

        <div className="flex min-h-[220px] flex-col justify-between p-5 lg:p-6">
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="truncate text-xl font-semibold text-text-primary">{template.name}</div>
                <div className="mt-1 text-sm font-medium text-text-secondary">{meta.sceneSummary}</div>
              </div>
              {statusSlot}
            </div>

            <p className="line-clamp-3 text-sm leading-6 text-text-secondary">
              {template.description || '适合快速起步的模板骨架，可直接进入详情页查看完整内容。'}
            </p>

            <div className="flex flex-wrap gap-2">
              {meta.highlightTags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-border-light bg-bg-primary px-3 py-1 text-xs font-medium text-text-secondary"
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-3 rounded-2xl bg-bg-primary p-3">
              {stats.map((item) => (
                <div key={item.label} className="rounded-xl bg-bg-secondary px-3 py-2 shadow-soft">
                  <div className="text-xs text-text-secondary/70">{item.label}</div>
                  <div className="mt-1 text-base font-semibold text-text-primary">{item.value}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs text-text-secondary/70">
              更新于 {new Date(template.updatedAt).toLocaleDateString('zh-CN')}
            </div>
            <div className="flex flex-wrap gap-2" onClick={(event) => event.stopPropagation()}>
              {secondaryActionLabel && onSecondaryAction ? (
                <Button onClick={() => onSecondaryAction(template)}>
                  {secondaryActionLabel}
                </Button>
              ) : null}
              <Button type="primary" onClick={() => onPrimaryAction(template)}>
                {primaryActionLabel}
              </Button>
              {extraActionsSlot}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
