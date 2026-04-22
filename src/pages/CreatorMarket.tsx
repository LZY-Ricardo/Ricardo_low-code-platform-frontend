import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Card, Empty, Input, Popconfirm, Select, Segmented, Space, Tag, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import {
  getMarketComponents,
  getMarketTemplates,
  useMarketTemplate as markMarketTemplateUsed,
} from '../api/market';
import { getProjects, type ProjectData } from '../api/projects';
import { useMarketTemplateStore } from '../stores/market-template';
import { loadProjectMarketTemplateSource, type MarketTemplateSource } from '../features/market-templates/utils/load-project-market-template-source';
import MarketTemplateModal from '../components/MarketTemplateModal';
import type { CustomComponentMarketItem, MarketTemplateItem } from '../api/market';
import WorkspaceHeader from '../components/WorkspaceHeader';
import ComponentCardPreview from '../editor/components/CustomComponent/ComponentCardPreview';
import MarketTemplateShowcaseCard from '../components/MarketTemplateShowcaseCard';
import { createProject } from '../api/projects';
import { saveProjectMeta } from '../editor/utils/project-meta';
import type { Component } from '../editor/stores/components';
import type { DataSource } from '../editor/stores/data-source';
import type { SharedStyleDefinition } from '../editor/stores/shared-styles';
import type { EditorPage } from '../editor/utils/page-model';

type MarketTab = 'components' | 'templates' | 'mine';

export default function CreatorMarket() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<MarketTab>('components');
  const [search, setSearch] = useState('');
  const [components, setComponents] = useState<CustomComponentMarketItem[]>([]);
  const [templates, setTemplates] = useState<MarketTemplateItem[]>([]);
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>();
  const [marketTemplateOpen, setMarketTemplateOpen] = useState(false);
  const [marketTemplateName, setMarketTemplateName] = useState('');
  const [marketTemplateSource, setMarketTemplateSource] = useState<MarketTemplateSource | null>(null);
  const [editTemplateOpen, setEditTemplateOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<MarketTemplateItem | null>(null);
  const [loadingProject, setLoadingProject] = useState(false);
  const {
    mineTemplates,
    loadMineTemplates,
    togglePublic,
    deleteTemplate,
  } = useMarketTemplateStore();

  const load = useCallback(async () => {
    if (tab === 'components') {
      const result = await getMarketComponents({ search });
      setComponents(result.components);
    } else if (tab === 'templates') {
      const result = await getMarketTemplates({ search });
      setTemplates(result.templates);
    } else {
      await loadMineTemplates();
    }
  }, [loadMineTemplates, search, tab]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    void getProjects(1, 100).then((result) => {
      setProjects(result.projects);
      setSelectedProjectId((current) => current ?? result.projects[0]?.id);
    });
  }, []);

  const cards: Array<CustomComponentMarketItem | MarketTemplateItem> = useMemo(() => {
    if (tab === 'components') {
      return components;
    }
    if (tab === 'templates') {
      return templates;
    }
    return mineTemplates;
  }, [components, mineTemplates, tab, templates]);

  const handleSaveToMarket = async () => {
    if (!selectedProjectId) {
      message.warning('请先选择项目');
      return;
    }

    try {
      setLoadingProject(true);
      const result = await loadProjectMarketTemplateSource(selectedProjectId);
      setMarketTemplateName(`${result.project.name} 市场模板`);
      setMarketTemplateSource(result.source);
      setMarketTemplateOpen(true);
    } catch {
      message.error('项目数据加载失败');
    } finally {
      setLoadingProject(false);
    }
  };

  const handleEditTemplate = (template: MarketTemplateItem) => {
    setEditingTemplate(template);
    setEditTemplateOpen(true);
  };

  const handleOpenTemplate = (template: MarketTemplateItem) => {
    navigate(`/market/template/${template.id}`);
  };

  const handleUseTemplate = async (template: MarketTemplateItem) => {
    try {
      const project = await createProject({
        name: `${template.name}_${Date.now()}`,
        components: template.components as Component[],
      });
      saveProjectMeta(project.id, {
        dataSources: template.dataSources as unknown as DataSource[],
        variables: template.variables,
        pages: template.pages as EditorPage[],
        activePageId: (template.pages as EditorPage[])?.[0]?.id ?? null,
        sharedStyles: template.sharedStyles as SharedStyleDefinition[],
        themeId: template.themeId,
      });
      await markMarketTemplateUsed(template.id);
      message.success('已从市场模板创建项目');
      navigate(`/editor/${project.id}`);
    } catch {
      message.error('使用模板失败');
    }
  };

  return (
    <div className="app-page">
      <WorkspaceHeader active="market" />
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-8">
        <div className="app-page-header">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">创作者市场</h1>
            <p className="text-sm text-text-secondary">浏览组件、模板和社区互动</p>
          </div>
          <Space>
            <Button type="primary" onClick={() => navigate('/market/publish/component')}>
              发布组件
            </Button>
          </Space>
        </div>

        <Card className="border border-border-light bg-bg-secondary shadow-soft">
          <Space wrap>
            <Segmented
              value={tab}
              options={[
                { label: '组件', value: 'components' },
                { label: '模板', value: 'templates' },
                { label: '我的模板', value: 'mine' },
              ]}
              onChange={(value) => setTab(value as MarketTab)}
            />
            <Input.Search
              placeholder="搜索市场内容"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onSearch={() => void load()}
              style={{ width: 280 }}
            />
            <Select
              value={selectedProjectId}
              onChange={setSelectedProjectId}
              style={{ width: 220 }}
              placeholder="选择项目"
              options={projects.map((project) => ({
                value: project.id,
                label: project.name,
              }))}
            />
            <Button onClick={() => void handleSaveToMarket()} loading={loadingProject}>
              保存到市场
            </Button>
          </Space>
        </Card>

        {cards.length === 0 ? (
          <Card className="border border-border-light bg-bg-secondary shadow-soft">
            <Empty description={tab === 'mine' ? '暂无我的模板' : '暂无市场内容'} />
          </Card>
        ) : tab === 'components' ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {cards.map((item: CustomComponentMarketItem | MarketTemplateItem) => (
              <Card
                key={item.id}
                hoverable
                className="border border-border-light bg-bg-secondary shadow-soft"
                onClick={() => {
                  navigate(`/market/component/${item.id}`);
                }}
              >
                <div className="flex flex-col gap-3">
                  <ComponentCardPreview
                    code={(item as CustomComponentMarketItem).code || ''}
                    defaultProps={(item as CustomComponentMarketItem).defaultProps || {}}
                  />
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-lg font-semibold text-text-primary">
                        {'displayName' in item ? item.displayName : item.name}
                      </div>
                      <div className="text-sm text-text-secondary">{item.description || '无描述'}</div>
                    </div>
                    <Tag>{item.category}</Tag>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-text-secondary">
                    <span>{'downloads' in item ? `下载 ${item.downloads}` : `使用 ${item.useCount}`}</span>
                    <span>{`评分 ${item.avgRating ?? 0}`}</span>
                    <span>{`评论 ${item.reviewCount ?? 0}`}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-5">
            {(cards as MarketTemplateItem[]).map((template) => (
              <MarketTemplateShowcaseCard
                key={template.id}
                template={template}
                onOpen={tab === 'mine' ? undefined : handleOpenTemplate}
                primaryActionLabel={tab === 'mine' ? '编辑模板' : '查看详情'}
                onPrimaryAction={tab === 'mine' ? handleEditTemplate : handleOpenTemplate}
                secondaryActionLabel={tab === 'mine' ? '立即使用' : '直接使用'}
                onSecondaryAction={handleUseTemplate}
                statusSlot={(
                  <Tag color={tab === 'mine' ? (template.isPublic ? 'green' : 'default') : 'blue'}>
                    {tab === 'mine' ? (template.isPublic ? '已公开' : '未公开') : '市场模板'}
                  </Tag>
                )}
                extraActionsSlot={tab === 'mine' ? (
                  <>
                    <Button
                      onClick={async () => {
                        try {
                          await togglePublic(template.id, !template.isPublic);
                          message.success(template.isPublic ? '已取消公开' : '已公开到市场');
                        } catch {
                          message.error(template.isPublic ? '取消公开失败' : '公开失败');
                        }
                      }}
                    >
                      {template.isPublic ? '取消公开' : '公开'}
                    </Button>
                    <Popconfirm
                      title="删除市场模板"
                      description={`确定删除“${template.name}”吗？`}
                      okText="删除"
                      cancelText="取消"
                      okButtonProps={{ danger: true }}
                      onConfirm={async () => {
                        try {
                          await deleteTemplate(template.id);
                          message.success('市场模板已删除');
                        } catch {
                          message.error('删除市场模板失败');
                        }
                      }}
                    >
                      <Button danger>删除</Button>
                    </Popconfirm>
                  </>
                ) : undefined}
              />
            ))}
          </div>
        )}
      </div>

      <MarketTemplateModal
        open={marketTemplateOpen}
        defaultName={marketTemplateName}
        source={marketTemplateSource}
        onCancel={() => {
          setMarketTemplateOpen(false);
          setMarketTemplateSource(null);
        }}
        onSuccess={() => {
          setMarketTemplateOpen(false);
          setMarketTemplateSource(null);
          setTab('mine');
          void loadMineTemplates();
        }}
      />

      <MarketTemplateModal
        open={editTemplateOpen}
        mode="edit"
        template={editingTemplate}
        defaultName={editingTemplate?.name ?? ''}
        thumbnail={editingTemplate?.thumbnail ?? null}
        source={null}
        onCancel={() => {
          setEditTemplateOpen(false);
          setEditingTemplate(null);
        }}
        onSuccess={() => {
          setEditTemplateOpen(false);
          setEditingTemplate(null);
        }}
      />
    </div>
  );
}
