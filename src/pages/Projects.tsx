/**
 * 项目列表页面
 */
import { useEffect, useState, useCallback } from 'react';
import { Button, Card, Empty, Modal, Input, message, Popconfirm, Spin, Select } from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  FolderOpenOutlined,
  LogoutOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useProjectStore } from '../editor/stores/project';
import { useAuthStore } from '../stores/auth';
import { useTemplateStore } from '../stores/template';
import type { Project } from '../editor/utils/storage';
import MigrationModal from '../components/MigrationModal';
import { normalizeTemplatePages } from '../editor/utils/template-storage';
import { saveProjectMeta } from '../editor/utils/project-meta';
import { THEME_PRESETS, useThemeStore } from '../stores/theme';
import TemplateCard from '../editor/components/TemplateCard';
import EditTemplateModal from '../editor/components/EditTemplateModal';
import type { TemplateItem, TemplateCategory } from '../api/templates';
import { CATEGORY_LABELS } from '../api/templates';

export default function Projects() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { currentThemeId, setTheme } = useThemeStore();
  const {
    projects,
    loadProjects,
    createProject,
    deleteProject,
    renameProject,
    switchProject,
  } = useProjectStore();
  const {
    templates,
    page: templatePage,
    totalPages: templateTotalPages,
    loading: templateLoading,
    loadTemplates,
    setFilter,
    deleteTemplate: deleteTemplateFromStore,
  } = useTemplateStore();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [renameProjectId, setRenameProjectId] = useState<string | null>(null);
  const [renameProjectName, setRenameProjectName] = useState('');
  const [showMigrationModal, setShowMigrationModal] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'builtIn' | 'mine'>('all');
  const [editTemplate, setEditTemplate] = useState<TemplateItem | null>(null);

  // 页面加载时加载项目列表和模板列表
  useEffect(() => {
    loadProjects();
    setShowMigrationModal(true);
    loadTemplates();
  }, [loadProjects, loadTemplates]);

  // 创建新项目
  const handleCreateProject = async () => {
    if (!newProjectName.trim()) {
      message.warning('请输入项目名称');
      return;
    }

    try {
      const project = await createProject(newProjectName.trim());
      setIsCreateModalOpen(false);
      setNewProjectName('');
      message.success('项目创建成功');

      // 跳转到编辑器
      navigate(`/editor/${project.id}`);
    } catch {
      message.error('创建项目失败');
    }
  };

  // 打开项目
  const handleOpenProject = (project: Project) => {
    switchProject(project.id);
    navigate(`/editor/${project.id}`);
  };

  const handleCreateFromTemplate = async (template: TemplateItem) => {
    try {
      // 从 API 获取完整模板数据
      const detail = await useTemplateStore.getState().getTemplate(template.id);
      const project = await createProject(`${detail.name}_${Date.now()}`, detail.components);
      const pages = normalizeTemplatePages({
        pages: detail.pages,
        components: detail.components,
      } as any);
      saveProjectMeta(project.id, {
        dataSources: detail.dataSources,
        variables: detail.variables,
        pages,
        activePageId: pages[0]?.id ?? null,
        sharedStyles: detail.sharedStyles,
        themeId: detail.themeId,
      });
      // 应用模板的主题作为全局偏好
      if (detail.themeId) {
        setTheme(detail.themeId);
      }
      // 增加使用计数
      await useTemplateStore.getState().useTemplate(template.id);
      message.success(`已从模板 "${template.name}" 创建项目`);
      navigate(`/editor/${project.id}`);
    } catch {
      message.error('模板创建失败');
    }
  };

  // 模板搜索
  const handleSearch = useCallback((value: string) => {
    setSearchText(value);
    setFilter({ search: value || undefined });
  }, [setFilter]);

  // 模板分类筛选
  const handleCategoryChange = useCallback((value: string | undefined) => {
    setFilter({ category: value as TemplateCategory | undefined });
  }, [setFilter]);

  // 模板来源筛选
  const handleFilterChange = useCallback((filter: 'all' | 'builtIn' | 'mine') => {
    setActiveFilter(filter);
    if (filter === 'all') {
      setFilter({ builtIn: undefined, mine: undefined });
    } else if (filter === 'builtIn') {
      setFilter({ builtIn: true, mine: undefined });
    } else {
      setFilter({ builtIn: undefined, mine: true });
    }
  }, [setFilter]);

  // 删除模板
  const handleDeleteTemplate = async (template: TemplateItem) => {
    try {
      await deleteTemplateFromStore(template.id);
      message.success(`模板 "${template.name}" 已删除`);
    } catch {
      message.error('删除模板失败');
    }
  };

  // 编辑模板
  const handleEditTemplate = (template: TemplateItem) => {
    setEditTemplate(template);
  };

  // 分页
  const handleTemplatePageChange = useCallback((newPage: number) => {
    loadTemplates({ page: newPage });
  }, [loadTemplates]);

  // 删除项目
  const handleDeleteProject = async (projectId: string, projectName: string) => {
    try {
      const success = await deleteProject(projectId);
      if (success) {
        message.success(`项目 "${projectName}" 已删除`);
      } else {
        message.error('删除失败');
      }
    } catch {
      message.error('删除项目失败');
    }
  };

  // 打开重命名对话框
  const handleOpenRename = (project: Project) => {
    setRenameProjectId(project.id);
    setRenameProjectName(project.name);
    setIsRenameModalOpen(true);
  };

  // 重命名项目
  const handleRenameProject = async () => {
    if (!renameProjectName.trim()) {
      message.warning('请输入项目名称');
      return;
    }

    if (!renameProjectId) return;

    try {
      const success = await renameProject(renameProjectId, renameProjectName.trim());
      if (success) {
        message.success('重命名成功');
        setIsRenameModalOpen(false);
        setRenameProjectId(null);
        setRenameProjectName('');
      } else {
        message.error('重命名失败');
      }
    } catch {
      message.error('重命名项目失败');
    }
  };

  // 退出登录
  const handleLogout = () => {
    logout();
    message.success('已退出登录');
    navigate('/login');
  };

  // 格式化时间
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航栏 */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-gray-900">低代码编辑器</h1>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                {THEME_PRESETS.map((theme) => (
                  <Button
                    key={theme.id}
                    size="small"
                    type={currentThemeId === theme.id ? 'primary' : 'default'}
                    onClick={() => setTheme(theme.id)}
                  >
                    {theme.name}
                  </Button>
                ))}
              </div>
              <span className="text-gray-700">欢迎，{user?.username}</span>
              <Button
                icon={<LogoutOutlined />}
                onClick={handleLogout}
                type="text"
              >
                退出登录
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 主内容区 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">我的项目</h2>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsCreateModalOpen(true)}
            size="large"
          >
            新建项目
          </Button>
        </div>

        <div className="mb-10">
          <h3 className="mb-4 text-lg font-semibold text-gray-800">模板中心</h3>

          {/* 搜索和筛选栏 */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
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

          {/* 模板列表 */}
          <Spin spinning={templateLoading}>
            {templates.length === 0 && !templateLoading ? (
              <Empty
                description="暂无模板"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {templates.map((template) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    onUse={handleCreateFromTemplate}
                    onEdit={handleEditTemplate}
                    onDelete={handleDeleteTemplate}
                  />
                ))}
              </div>
            )}

            {/* 分页 */}
            {templateTotalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-4">
                <Button
                  size="small"
                  disabled={templatePage <= 1}
                  onClick={() => handleTemplatePageChange(templatePage - 1)}
                >
                  上一页
                </Button>
                <span className="text-sm text-gray-500">
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

        {/* 项目列表 */}
        {projects.length === 0 ? (
          <Empty
            description="还没有项目，创建一个开始吧！"
            className="mt-20"
          >
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setIsCreateModalOpen(true)}
            >
              创建项目
            </Button>
          </Empty>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {projects.map((project) => (
              <Card
                key={project.id}
                hoverable
                className="cursor-pointer"
                onClick={() => handleOpenProject(project)}
              >
                <div className="flex flex-col h-full">
                  <div className="flex items-start justify-between mb-4">
                    <FolderOpenOutlined className="text-4xl text-blue-500" />
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 mb-2 truncate">
                    {project.name}
                  </h3>

                  <p className="text-sm text-gray-500 mb-4">
                    更新于 {formatDate(project.updatedAt)}
                  </p>

                  <div className="flex gap-2 mt-auto" onClick={(e) => e.stopPropagation()}>
                    <Button
                      icon={<EditOutlined />}
                      onClick={() => handleOpenRename(project)}
                      size="small"
                    >
                      重命名
                    </Button>
                    <Popconfirm
                      title="删除项目"
                      description={`确定要删除项目 "${project.name}" 吗？`}
                      onConfirm={() => handleDeleteProject(project.id, project.name)}
                      okText="确定"
                      cancelText="取消"
                    >
                      <Button
                        danger
                        icon={<DeleteOutlined />}
                        size="small"
                      >
                        删除
                      </Button>
                    </Popconfirm>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* 创建项目对话框 */}
      <Modal
        title="创建新项目"
        open={isCreateModalOpen}
        onOk={handleCreateProject}
        onCancel={() => {
          setIsCreateModalOpen(false);
          setNewProjectName('');
        }}
        okText="创建"
        cancelText="取消"
      >
        <Input
          placeholder="请输入项目名称"
          value={newProjectName}
          onChange={(e) => setNewProjectName(e.target.value)}
          onPressEnter={handleCreateProject}
          autoFocus
        />
      </Modal>

      {/* 重命名项目对话框 */}
      <Modal
        title="重命名项目"
        open={isRenameModalOpen}
        onOk={handleRenameProject}
        onCancel={() => {
          setIsRenameModalOpen(false);
          setRenameProjectId(null);
          setRenameProjectName('');
        }}
        okText="确定"
        cancelText="取消"
      >
        <Input
          placeholder="请输入新的项目名称"
          value={renameProjectName}
          onChange={(e) => setRenameProjectName(e.target.value)}
          onPressEnter={handleRenameProject}
          autoFocus
        />
      </Modal>

      {/* 数据迁移提示 */}
      <MigrationModal
        visible={showMigrationModal}
        onClose={() => setShowMigrationModal(false)}
        onSuccess={() => {
          // 迁移成功后重新加载项目列表
          loadProjects();
        }}
      />

      {/* 编辑模板对话框 */}
      <EditTemplateModal
        open={!!editTemplate}
        template={editTemplate}
        onCancel={() => setEditTemplate(null)}
        onSuccess={() => setEditTemplate(null)}
      />
    </div>
  );
}
