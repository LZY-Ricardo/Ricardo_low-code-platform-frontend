import { useCallback, useEffect, useState } from 'react';
import { Button, Empty, Input, Select, Spin } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import WorkspaceHeader from '../components/WorkspaceHeader';
import { useTemplateStore } from '../stores/template';
import { useProjectStore } from '../editor/stores/project';
import type { ProjectTemplate } from '../editor/utils/template-storage';
import { normalizeTemplatePages } from '../editor/utils/template-storage';
import { saveProjectMeta } from '../editor/utils/project-meta';
import { useThemeStore } from '../stores/theme';
import TemplateCard from '../editor/components/TemplateCard';
import EditTemplateModal from '../editor/components/EditTemplateModal';
import type { TemplateItem, TemplateCategory } from '../api/templates';
import { CATEGORY_LABELS } from '../api/templates';
import { getRecommendedSections, type TemplateScene } from './template-recommendations';

export default function Templates() {
  const navigate = useNavigate();
  const { createProject } = useProjectStore();
  const { setTheme } = useThemeStore();
  const {
    templates,
    page: templatePage,
    totalPages: templateTotalPages,
    loading: templateLoading,
    loadTemplates,
    setFilter,
    deleteTemplate: deleteTemplateFromStore,
  } = useTemplateStore();

  const [searchText, setSearchText] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'builtIn' | 'mine'>('all');
  const [activeScene, setActiveScene] = useState<TemplateScene | 'all'>('all');
  const [editTemplate, setEditTemplate] = useState<TemplateItem | null>(null);

  useEffect(() => {
    void loadTemplates();
  }, [loadTemplates]);

  const handleCreateFromTemplate = async (template: TemplateItem) => {
    try {
      const detail = await useTemplateStore.getState().getTemplate(template.id);
      const project = await createProject(`${detail.name}_${Date.now()}`, detail.components);
      const pages = normalizeTemplatePages({
        pages: detail.pages,
        components: detail.components,
      } satisfies Pick<ProjectTemplate, 'pages' | 'components'>);
      saveProjectMeta(project.id, {
        dataSources: detail.dataSources,
        variables: detail.variables,
        pages,
        activePageId: pages[0]?.id ?? null,
        sharedStyles: detail.sharedStyles,
        themeId: detail.themeId,
      });
      if (detail.themeId) {
        setTheme(detail.themeId);
      }
      await useTemplateStore.getState().useTemplate(template.id);
      navigate(`/editor/${project.id}`);
    } catch {
      // axios 全局错误已提示
    }
  };

  const handleSearch = useCallback((value: string) => {
    setSearchText(value);
    setActiveScene('all');
    setFilter({ search: value || undefined });
  }, [setFilter]);

  const handleCategoryChange = useCallback((value: string | undefined) => {
    setActiveScene('all');
    setFilter({ category: value as TemplateCategory | undefined });
  }, [setFilter]);

  const handleFilterChange = useCallback((filter: 'all' | 'builtIn' | 'mine') => {
    setActiveFilter(filter);
    setActiveScene('all');
    if (filter === 'all') {
      setFilter({ builtIn: undefined, mine: undefined });
    } else if (filter === 'builtIn') {
      setFilter({ builtIn: true, mine: undefined });
    } else {
      setFilter({ builtIn: undefined, mine: true });
    }
  }, [setFilter]);

  const handleDeleteTemplate = async (template: TemplateItem) => {
    await deleteTemplateFromStore(template.id);
  };

  const handleTemplatePageChange = useCallback((newPage: number) => {
    loadTemplates({ page: newPage });
  }, [loadTemplates]);

  const showRecommendationSections =
    activeFilter !== 'mine' && !searchText.trim();

  const recommendedSections = getRecommendedSections(templates, activeScene);

  return (
    <div className="app-page">
      <WorkspaceHeader active="templates" />

      <div className="app-shell">
        <div className="app-page-header">
          <div>
            <h2 className="app-page-title">模板中心</h2>
            <p className="app-page-subtitle">内置模板与个人模板分开展示，便于快速创建项目。</p>
          </div>
          <Button onClick={() => navigate('/market')}>
            前往市场
          </Button>
        </div>

        <div className="mb-4 flex flex-wrap items-center gap-3">
          <Input
            placeholder="搜索模板..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => handleSearch(e.target.value)}
            allowClear
            className="max-w-xs"
          />
          <Select
            placeholder="全部分类"
            allowClear
            style={{ width: 120 }}
            onChange={handleCategoryChange}
            options={Object.entries(CATEGORY_LABELS).map(([value, label]) => ({
              value,
              label,
            }))}
          />
          <div className="flex gap-1">
            {([
              { key: 'all', label: '全部' },
              { key: 'builtIn', label: '内置' },
              { key: 'mine', label: '我的模板' },
            ] as const).map((item) => (
              <Button
                key={item.key}
                size="small"
                type={activeFilter === item.key ? 'primary' : 'default'}
                onClick={() => handleFilterChange(item.key)}
              >
                {item.label}
              </Button>
            ))}
          </div>
        </div>

        {showRecommendationSections && (
          <div className="mb-6 rounded-2xl border border-border-light bg-bg-secondary p-4 shadow-soft">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-text-primary">模板推荐</h3>
                <p className="mt-1 text-xs text-text-secondary">按高频场景快速筛到更合适的起步模板。</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {([
                  { key: 'all', label: '全部推荐' },
                  { key: 'business', label: '后台业务' },
                  { key: 'marketing', label: '营销转化' },
                  { key: 'utility', label: '通用管理' },
                ] as const).map((item) => (
                  <Button
                    key={item.key}
                    size="small"
                    type={activeScene === item.key ? 'primary' : 'default'}
                    onClick={() => setActiveScene(item.key)}
                  >
                    {item.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              {recommendedSections.map((section) => (
                <section key={section.key} className="space-y-3">
                  <div className="flex items-end justify-between gap-3">
                    <div>
                      <h4 className="text-sm font-semibold text-text-primary">{section.title}</h4>
                      <p className="text-xs text-text-secondary">{section.description}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {section.templates.map((template) => (
                      <TemplateCard
                        key={`${section.key}-${template.id}`}
                        template={template}
                        onUse={handleCreateFromTemplate}
                        onEdit={setEditTemplate}
                        onDelete={handleDeleteTemplate}
                        badgeText={section.key === 'featured' ? '推荐' : undefined}
                      />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </div>
        )}

        <Spin spinning={templateLoading}>
          {templates.length === 0 && !templateLoading ? (
            <Empty description="暂无模板" image={Empty.PRESENTED_IMAGE_SIMPLE} />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {templates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onUse={handleCreateFromTemplate}
                  onEdit={setEditTemplate}
                  onDelete={handleDeleteTemplate}
                />
              ))}
            </div>
          )}

          {templateTotalPages > 1 && (
            <div className="mt-4 flex items-center justify-center gap-2">
              <Button
                size="small"
                disabled={templatePage <= 1}
                onClick={() => handleTemplatePageChange(templatePage - 1)}
              >
                上一页
              </Button>
              <span className="text-sm text-text-secondary">
                {templatePage} / {templateTotalPages}
              </span>
              <Button
                size="small"
                disabled={templatePage >= templateTotalPages}
                onClick={() => handleTemplatePageChange(templatePage + 1)}
              >
                下一页
              </Button>
            </div>
          )}
        </Spin>
      </div>

      <EditTemplateModal
        open={!!editTemplate}
        template={editTemplate}
        onCancel={() => setEditTemplate(null)}
        onSuccess={() => setEditTemplate(null)}
      />
    </div>
  );
}
