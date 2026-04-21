import { Space, Button, Dropdown, Modal, Input, Tooltip, message } from 'antd'
import {
  SaveOutlined,
  FolderOpenOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  LeftOutlined,
  ExportOutlined,
  UndoOutlined,
  RedoOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
  AppstoreAddOutlined,
  CopyOutlined,
  FileTextOutlined,
  MoreOutlined,
} from '@ant-design/icons'
import { useComponentsStore } from '../../stores/components'
import { useProjectStore } from '../../stores/project'
import { useDataSourceStore } from '../../stores/data-source'
import { useRuntimeStateStore } from '../../stores/runtime-state'
import { useSharedStylesStore } from '../../stores/shared-styles'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { MenuProps } from 'antd'
import ExportModal from '../ExportModal'
import { formatSaveStatusText } from '../../utils/save-status'
import { getNextCanvasScaleLabel } from '../../utils/canvas-scale'
import { saveTemplate } from '../../utils/template-storage'
import { useThemeStore } from '../../../stores/theme'
import { buildPageMenuItems } from './page-menu'

export default function Header() {
  const navigate = useNavigate()
  const { mode, setMode, components, history, undo, redo, canvasScale, zoomIn, zoomOut, resetCanvasScale } = useComponentsStore()
  const { dataSources } = useDataSourceStore()
  const { variables } = useRuntimeStateStore()
  const { sharedStyles } = useSharedStylesStore()
  const { currentThemeId } = useThemeStore()
  const { 
    activePageId,
    addPage,
    currentProject, 
    duplicateActivePage,
    pages,
    projects, 
    renamePage,
    saveStatus,
    saveCurrentProject, 
    createProject,
    renameProject,
    deleteProject,
    lastSavedAt,
    switchPage,
  } = useProjectStore()
  
  const [renameModalVisible, setRenameModalVisible] = useState(false)
  const [newProjectName, setNewProjectName] = useState('')
  const [renamingProjectId, setRenamingProjectId] = useState<string | null>(null)
  const [exportModalVisible, setExportModalVisible] = useState(false)
  const [renamePageModalVisible, setRenamePageModalVisible] = useState(false)
  const [renamePageName, setRenamePageName] = useState('')
  const activePageName = pages.find((item) => item.id === activePageId)?.name ?? '页面'

  const handleSave = async () => {
    const success = await saveCurrentProject(components)
    if (success) {
      message.success('项目保存成功')
    } else {
      message.error('项目保存失败')
    }
  }

  const handleSaveTemplate = () => {
    if (!currentProject) {
      message.warning('当前没有可保存的项目')
      return
    }

    saveTemplate({
      id: `tpl_${Date.now()}`,
      name: `${currentProject.name} 模板`,
      description: '从当前项目生成',
      components,
      pages,
      dataSources,
      variables,
      sharedStyles,
      themeId: currentThemeId,
      builtIn: false,
    })
    message.success('已保存为模板')
  }

  const handleAddPage = () => {
    const page = addPage()
    useComponentsStore.getState().setCurComponentId(null)
    useComponentsStore.getState().setComponents(page.components)
    message.success(`已新增${page.name}`)
  }

  const handleDuplicatePage = () => {
    const page = duplicateActivePage(components)
    if (page) {
      message.success(`已复制为${page.name}`)
    }
  }

  const handleSwitchPage = (pageId: string) => {
    const nextComponents = switchPage(pageId, components)
    if (nextComponents) {
      useComponentsStore.getState().setComponents(nextComponents)
    }
  }

  const handleOpenRenamePage = () => {
    const page = pages.find((item) => item.id === activePageId)
    if (!page) {
      return
    }
    setRenamePageName(page.name)
    setRenamePageModalVisible(true)
  }

  const handleRenamePage = () => {
    if (!activePageId || !renamePageName.trim()) {
      message.warning('请输入页面名称')
      return
    }
    renamePage(activePageId, renamePageName.trim())
    setRenamePageModalVisible(false)
    message.success('页面已重命名')
  }

  const handleBackToProjects = async () => {
    await saveCurrentProject(components)
    navigate('/projects')
  }

  const handleNewProject = async () => {
    await saveCurrentProject(components)
    const newProj = await createProject()
    if (newProj) {
      // 导航到新项目的 URL
      navigate(`/editor/${newProj.id}`)
      message.success(`已创建项目：${newProj.name}`)
    }
  }

  const handleSwitchProject = async (projectId: string) => {
    // 如果切换到当前项目，不做任何操作
    if (currentProject?.id === projectId) {
      return
    }

    await saveCurrentProject(components)
    // 通过导航到新的 URL 来触发项目切换
    // 实际的切换逻辑由 editor/index.tsx 的 useEffect 处理
    navigate(`/editor/${projectId}`)
  }

  const handleRenameClick = (projectId: string, currentName: string) => {
    setRenamingProjectId(projectId)
    setNewProjectName(currentName)
    setRenameModalVisible(true)
  }

  const handleRenameConfirm = async () => {
    if (!renamingProjectId || !newProjectName.trim()) {
      message.warning('请输入项目名称')
      return
    }

    const success = await renameProject(renamingProjectId, newProjectName.trim())
    if (success) {
      message.success('重命名成功')
      setRenameModalVisible(false)
      setRenamingProjectId(null)
      setNewProjectName('')
    } else {
      message.error('重命名失败')
    }
  }

  const handleDeleteProject = (projectId: string, projectName: string) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除项目"${projectName}"吗？此操作不可恢复。`,
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        const success = await deleteProject(projectId)
        if (success) {
          message.success('项目已删除')
          // 如果删除的是当前项目，deleteProject 会自动切换到其他项目
          // 需要导航到新的当前项目
          const { currentProject: newCurrentProject } = useProjectStore.getState()
          if (newCurrentProject) {
            navigate(`/editor/${newCurrentProject.id}`)
          } else {
            // 如果没有项目了，返回项目列表
            navigate('/projects')
          }
        } else {
          message.error('删除失败')
        }
      }
    })
  }

  const projectMenuItems: MenuProps['items'] = projects.map(project => ({
    key: project.id,
    label: (
      <div className="flex items-center justify-between w-full">
        <span 
          className="flex-1"
          onClick={() => handleSwitchProject(project.id)}
        >
          {project.name}
          {currentProject?.id === project.id && ' (当前)'}
        </span>
        <Space size="small" onClick={(e) => e.stopPropagation()}>
          <EditOutlined 
            className="text-blue-500 hover:text-blue-700"
            onClick={(e) => {
              e.stopPropagation()
              handleRenameClick(project.id, project.name)
            }}
          />
          <DeleteOutlined 
            className="text-red-500 hover:text-red-700"
            onClick={(e) => {
              e.stopPropagation()
              handleDeleteProject(project.id, project.name)
            }}
          />
        </Space>
      </div>
    )
  }))

  const pageMenuItems = buildPageMenuItems({
    pages,
    activePageId,
    onSwitchPage: handleSwitchPage,
  })

  const moreMenuItems: MenuProps['items'] = [
    {
      key: 'projects',
      label: `项目列表 (${projects.length})`,
      icon: <FolderOpenOutlined />,
      onClick: () => void 0,
      children: projectMenuItems,
    },
    {
      key: 'export',
      label: '导出',
      icon: <ExportOutlined />,
      onClick: () => setExportModalVisible(true),
    },
    {
      key: 'save-template',
      label: '保存为模板',
      icon: <AppstoreAddOutlined />,
      onClick: handleSaveTemplate,
    },
    {
      key: 'add-page',
      label: '新增页面',
      icon: <PlusOutlined />,
      onClick: handleAddPage,
    },
    {
      key: 'duplicate-page',
      label: '复制页面',
      icon: <CopyOutlined />,
      disabled: !activePageId,
      onClick: handleDuplicatePage,
    },
    {
      key: 'rename-page',
      label: '重命名页面',
      icon: <EditOutlined />,
      disabled: !activePageId,
      onClick: handleOpenRenamePage,
    },
  ]

  return (
    <div className='w-[100%] h-[100%]'>
      <div className='flex h-[64px] items-center gap-4 overflow-hidden px-6'>
        <div className='flex min-w-0 flex-1 items-center gap-3 overflow-hidden'>
          <div className='flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-accent-hover shadow-soft'>
            <span className='text-white text-sm font-bold'>低</span>
          </div>
          <div className='flex min-w-0 items-center gap-2 overflow-hidden whitespace-nowrap'>
            <Tooltip title="返回项目列表">
              <Button 
                type="text" 
                icon={<LeftOutlined />}
                onClick={handleBackToProjects}
                className='flex-shrink-0 text-gray-600 hover:text-accent'
                aria-label='返回项目列表'
              />
            </Tooltip>
            {currentProject && (
              <>
                <span className='flex-shrink-0 text-gray-400'>/</span>
                <Tooltip title={currentProject.name}>
                  <span className='inline-block min-w-[72px] max-w-[180px] truncate text-base font-medium text-text-primary'>
                    {currentProject.name}
                  </span>
                </Tooltip>
                {pages.length > 0 && (
                  <>
                    <span className='flex-shrink-0 text-gray-400'>/</span>
                    <Tooltip title={activePageName}>
                      <Dropdown menu={{ items: pageMenuItems }} trigger={['click']}>
                        <Button
                          type="text"
                          icon={<FileTextOutlined />}
                          className='flex min-w-[88px] max-w-[180px] items-center text-base font-medium text-text-primary'
                        >
                          <span className='min-w-0 flex-1 truncate text-left'>
                            {activePageName}
                          </span>
                        </Button>
                      </Dropdown>
                    </Tooltip>
                  </>
                )}
              </>
            )}
          </div>
        </div>
        <div className='flex flex-shrink-0 items-center gap-2 overflow-x-auto whitespace-nowrap pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'>
          {currentProject && (
            <div className='hidden min-w-[132px] flex-shrink-0 rounded-md border border-border-light bg-bg-primary px-3 py-1 text-xs text-text-secondary md:block'>
              <div>{formatSaveStatusText(saveStatus)}</div>
              <div className='text-[11px] text-text-muted'>
                {lastSavedAt ? new Date(lastSavedAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '--:--:--'}
              </div>
            </div>
          )}
          {mode === 'edit' && (
            <div className='hidden flex-shrink-0 text-xs text-text-muted 2xl:block'>
              快捷键：复制 `Ctrl/Cmd+C` 撤销 `Ctrl/Cmd+Z`
            </div>
          )}
          {mode === 'edit' && (
            <>
              <Button
                icon={<ZoomOutOutlined />}
                onClick={zoomOut}
                disabled={canvasScale <= 0.5}
              />
              <Button onClick={resetCanvasScale}>
                {getNextCanvasScaleLabel(canvasScale)}
              </Button>
              <Button
                icon={<ZoomInOutlined />}
                onClick={zoomIn}
                disabled={canvasScale >= 2}
              />
              <Button
                icon={<UndoOutlined />}
                onClick={undo}
                disabled={history.past.length === 0}
              >
                撤销
              </Button>
              <Button
                icon={<RedoOutlined />}
                onClick={redo}
                disabled={history.future.length === 0}
              >
                重做
              </Button>
              <Button 
                icon={<SaveOutlined />}
                onClick={handleSave}
              >
                保存
              </Button>
              <Button 
                icon={<PlusOutlined />}
                onClick={handleNewProject}
              >
                新建项目
              </Button>
              <Dropdown
                menu={{ items: moreMenuItems }}
                trigger={['click']}
              >
                <Button icon={<MoreOutlined />}>
                  更多
                </Button>
              </Dropdown>
              <Button
                type="primary"
                onClick={() => setMode('preview')}
                className='shadow-soft'
              >
                预览
              </Button>
            </>
          )}
          {mode === 'preview' && (
            <Button 
              type="primary" 
              onClick={() => setMode('edit')}
              className='shadow-soft'
            >
              退出预览
            </Button>
          )}
        </div>
      </div>

      <Modal
        title="重命名页面"
        open={renamePageModalVisible}
        onOk={handleRenamePage}
        onCancel={() => {
          setRenamePageModalVisible(false)
          setRenamePageName('')
        }}
        okText="确认"
        cancelText="取消"
      >
        <Input
          value={renamePageName}
          onChange={(e) => setRenamePageName(e.target.value)}
          placeholder="请输入新的页面名称"
          onPressEnter={handleRenamePage}
        />
      </Modal>

      <Modal
        title="重命名项目"
        open={renameModalVisible}
        onOk={handleRenameConfirm}
        onCancel={() => {
          setRenameModalVisible(false)
          setRenamingProjectId(null)
          setNewProjectName('')
        }}
        okText="确认"
        cancelText="取消"
      >
        <Input
          value={newProjectName}
          onChange={(e) => setNewProjectName(e.target.value)}
          placeholder="请输入新的项目名称"
          onPressEnter={handleRenameConfirm}
        />
      </Modal>

      <ExportModal
        visible={exportModalVisible}
        onClose={() => setExportModalVisible(false)}
      />
    </div>
  )
}
