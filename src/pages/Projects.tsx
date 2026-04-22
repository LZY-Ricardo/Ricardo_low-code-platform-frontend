/**
 * 项目列表页面
 */
import { useEffect, useState } from 'react';
import { Button, Card, Empty, Modal, Input, message, Dropdown } from 'antd';
import type { MenuProps } from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  FolderOpenOutlined,
  FormOutlined,
  FileSearchOutlined,
  InboxOutlined,
  EllipsisOutlined,
  SendOutlined,
  TeamOutlined,
  UserOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useProjectStore } from '../editor/stores/project';
import { loadProjectMarketTemplateSource, type MarketTemplateSource } from '../features/market-templates/utils/load-project-market-template-source';
import type { Project } from '../editor/utils/storage';
import MigrationModal from '../components/MigrationModal';
import MarketTemplateModal from '../components/MarketTemplateModal';
import WorkspaceHeader from '../components/WorkspaceHeader';

export default function Projects() {
  const navigate = useNavigate();
  const {
    projects,
    collaboratedProjects,
    loadProjects,
    createProject,
    deleteProject,
    renameProject,
    switchProject,
  } = useProjectStore();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [renameProjectId, setRenameProjectId] = useState<string | null>(null);
  const [renameProjectName, setRenameProjectName] = useState('');
  const [showMigrationModal, setShowMigrationModal] = useState(false);
  const [marketTemplateOpen, setMarketTemplateOpen] = useState(false);
  const [marketTemplateName, setMarketTemplateName] = useState('');
  const [marketTemplateSource, setMarketTemplateSource] = useState<MarketTemplateSource | null>(null);
  const [loadingMarketProjectId, setLoadingMarketProjectId] = useState<string | null>(null);

  useEffect(() => {
    void loadProjects();
    setShowMigrationModal(true);
  }, [loadProjects]);

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

  const handleSaveProjectToMarket = async (project: Project) => {
    try {
      setLoadingMarketProjectId(project.id);
      const result = await loadProjectMarketTemplateSource(project.id);
      setMarketTemplateName(`${result.project.name} 市场模板`);
      setMarketTemplateSource(result.source);
      setMarketTemplateOpen(true);
    } catch {
      message.error('项目数据加载失败');
    } finally {
      setLoadingMarketProjectId(null);
    }
  };

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

  const handleOpenRename = (project: Project) => {
    setRenameProjectId(project.id);
    setRenameProjectName(project.name);
    setIsRenameModalOpen(true);
  };

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
    <div className="app-page">
      <WorkspaceHeader active="projects" />

      <div className="app-shell">
        <div className="app-page-header">
          <div>
            <h2 className="app-page-title">我的项目</h2>
            <p className="app-page-subtitle">项目管理、发布到市场和日常维护操作集中在这里。</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              icon={<FileSearchOutlined />}
              onClick={() => navigate('/logs')}
              size="large"
            >
              操作日志
            </Button>
            <Button
              icon={<InboxOutlined />}
              onClick={() => navigate('/trash')}
              size="large"
            >
              回收站
            </Button>
            <Button
              icon={<FormOutlined />}
              onClick={() => navigate('/forms')}
              size="large"
            >
              表单数据
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setIsCreateModalOpen(true)}
              size="large"
            >
              新建项目
            </Button>
          </div>
        </div>

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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {projects.map((project) => {
              const menuItems: MenuProps['items'] = [
                {
                  key: 'open',
                  icon: <FolderOpenOutlined />,
                  label: '打开项目',
                },
                {
                  key: 'rename',
                  icon: <EditOutlined />,
                  label: '重命名',
                },
                {
                  key: 'market',
                  icon: <SendOutlined />,
                  label: '保存到市场',
                  disabled: loadingMarketProjectId === project.id,
                },
                { type: 'divider' },
                {
                  key: 'delete',
                  icon: <DeleteOutlined />,
                  label: '删除项目',
                  danger: true,
                },
              ];

              return (
                <Card
                  key={project.id}
                  hoverable
                  className="group relative cursor-pointer overflow-hidden border border-border-light bg-bg-secondary shadow-soft transition-shadow duration-200 hover:shadow-md"
                  styles={{ body: { padding: 0 } }}
                  onClick={() => handleOpenProject(project)}
                >
                  {/* 顶部彩色装饰条 */}
                  <div className="h-1.5 bg-accent" />

                  <div className="p-4">
                    {/* 头部：图标 + 更多菜单 */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: 'var(--theme-primary-soft)' }}>
                        <FolderOpenOutlined className="text-xl text-accent" />
                      </div>
                      <Dropdown
                        menu={{
                          items: menuItems,
                          onClick: ({ key, domEvent }) => {
                            domEvent.stopPropagation();
                            if (key === 'rename') handleOpenRename(project);
                            else if (key === 'market') handleSaveProjectToMarket(project);
                            else if (key === 'delete') {
                              // 删除通过 Popconfirm 不方便在 Dropdown 中使用，直接用 Modal.confirm
                              Modal.confirm({
                                title: '删除项目',
                                content: `确定要删除项目 "${project.name}" 吗？`,
                                okText: '确定',
                                cancelText: '取消',
                                okButtonProps: { danger: true },
                                onOk: () => handleDeleteProject(project.id, project.name),
                              });
                            }
                          },
                        }}
                        trigger={['click']}
                      >
                        <Button
                          type="text"
                          size="small"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          icon={<EllipsisOutlined />}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </Dropdown>
                    </div>

                    {/* 项目名 */}
                    <h3 className="mb-1 truncate text-base font-semibold text-text-primary" title={project.name}>
                      {project.name}
                    </h3>

                    {/* 时间 */}
                    <p className="text-xs text-text-secondary/70">
                      更新于 {formatDate(project.updatedAt)}
                    </p>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* 协作项目 */}
      {collaboratedProjects.length > 0 && (
        <div className="mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
          <div className="mb-4">
            <div className="flex items-center gap-2">
              <TeamOutlined className="text-lg text-accent" />
              <h2 className="text-xl font-semibold text-text-primary">协作项目</h2>
            </div>
            <p className="mt-1 text-sm text-text-secondary">其他用户分享给你的项目。</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {collaboratedProjects.map((project) => (
              <Card
                key={project.id}
                hoverable
                className="group relative cursor-pointer overflow-hidden border border-border-light bg-bg-secondary shadow-soft transition-shadow duration-200 hover:shadow-md"
                styles={{ body: { padding: 0 } }}
                onClick={() => {
                  switchProject(project.id);
                  navigate(`/editor/${project.id}`);
                }}
              >
                <div className="h-1.5 bg-accent" />

                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: 'var(--theme-primary-soft)' }}>
                      <TeamOutlined className="text-xl text-accent" />
                    </div>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                        project.role === 'editor'
                          ? 'bg-success/10 text-success'
                          : 'bg-accent/10 text-accent'
                      }`}
                    >
                      {project.role === 'editor' ? (
                        <><EditOutlined /> 编辑者</>
                      ) : (
                        <><EyeOutlined /> 查看者</>
                      )}
                    </span>
                  </div>

                  <h3 className="mb-1 truncate text-base font-semibold text-text-primary" title={project.name}>
                    {project.name}
                  </h3>

                  <p className="flex items-center gap-1 text-xs text-text-secondary/70">
                    <UserOutlined />
                    {project.owner.username}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

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
        }}
      />
    </div>
  );
}
