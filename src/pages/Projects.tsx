/**
 * 项目列表页面
 */
import { useEffect, useState } from 'react';
import { Button, Card, Empty, Modal, Input, message, Popconfirm } from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  FolderOpenOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useProjectStore } from '../editor/stores/project';
import { useAuthStore } from '../stores/auth';
import type { Project } from '../editor/utils/storage';
import MigrationModal from '../components/MigrationModal';
import { getAllTemplates, normalizeTemplatePages, type ProjectTemplate } from '../editor/utils/template-storage';
import { saveProjectMeta } from '../editor/utils/project-meta';
import { THEME_PRESETS, useThemeStore } from '../stores/theme';

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

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [renameProjectId, setRenameProjectId] = useState<string | null>(null);
  const [renameProjectName, setRenameProjectName] = useState('');
  const [showMigrationModal, setShowMigrationModal] = useState(false);
  const [templates, setTemplates] = useState<ProjectTemplate[]>([]);

  // 页面加载时加载项目列表
  useEffect(() => {
    loadProjects();
    // 显示迁移提示
    setShowMigrationModal(true);
    setTemplates(getAllTemplates());
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

  const handleCreateFromTemplate = async (template: ProjectTemplate) => {
    try {
      const project = await createProject(`${template.name}_${Date.now()}`, template.components);
      const pages = normalizeTemplatePages(template);
      saveProjectMeta(project.id, {
        dataSources: template.dataSources,
        variables: template.variables,
        pages,
        activePageId: pages[0]?.id ?? null,
        sharedStyles: template.sharedStyles,
        themeId: template.themeId,
      });
      message.success(`已从模板 "${template.name}" 创建项目`);
      navigate(`/editor/${project.id}`);
    } catch {
      message.error('模板创建失败');
    }
  };

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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <Card key={template.id} hoverable>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-base font-semibold text-gray-900">{template.name}</h4>
                    {template.builtIn ? (
                      <span className="rounded-full bg-blue-50 px-2 py-1 text-xs text-blue-600">内置</span>
                    ) : (
                      <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs text-emerald-600">自定义</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">{template.description}</p>
                  <Button type="primary" onClick={() => handleCreateFromTemplate(template)}>
                    从模板创建
                  </Button>
                </div>
              </Card>
            ))}
          </div>
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
    </div>
  );
}
