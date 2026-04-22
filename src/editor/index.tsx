import { Allotment } from "allotment";
import "allotment/dist/style.css";
import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { message } from 'antd'
import Header from './components/Header'
import MaterialWrapper from './components/MaterialWrapper'
import EditArea from './components/EditArea'
import Setting from './components/Setting'
import Preview from "./components/Preview";
import { useComponentsStore } from './stores/components'
import { useProjectStore } from './stores/project'
import { useDataSourceStore } from './stores/data-source'
import { useRuntimeStateStore } from './stores/runtime-state'
import { getEditorShortcutAction, isEditableEventTarget, shouldHandleEditorShortcut } from './utils/editor-shortcuts'
import { loadProjectMeta, saveProjectMeta } from './utils/project-meta'
import { createDirtySnapshot, deserializeProjectSnapshot } from './utils/project-snapshot'
import { useSharedStylesStore } from './stores/shared-styles'
import { useThemeStore } from '../stores/theme'
import { createDefaultEditorLayoutState, resetEditorLayoutState } from './utils/editor-layout'
import { useCustomComponentStore } from './stores/custom-component'

export default function LowcodeEditor() {
  const { projectId } = useParams<{ projectId?: string }>()
  const currentProjectId = useProjectStore((state) => state.currentProject?.id ?? null)
  const mode = useComponentsStore((state) => state.mode)
  const components = useComponentsStore((state) => state.components)
  const copyComponent = useComponentsStore((state) => state.copyComponent)
  const curComponentId = useComponentsStore((state) => state.curComponentId)
  const deleteComponent = useComponentsStore((state) => state.deleteComponent)
  const redo = useComponentsStore((state) => state.redo)
  const setComponents = useComponentsStore((state) => state.setComponents)
  const setCurComponentId = useComponentsStore((state) => state.setCurComponentId)
  const undo = useComponentsStore((state) => state.undo)
  const dataSources = useDataSourceStore((state) => state.dataSources)
  const setDataSources = useDataSourceStore((state) => state.setDataSources)
  const clearDataSources = useDataSourceStore((state) => state.clear)
  const clearRuntimeState = useRuntimeStateStore((state) => state.clear)
  const setVariables = useRuntimeStateStore((state) => state.setVariables)
  const variables = useRuntimeStateStore((state) => state.variables)
  const clearSharedStyles = useSharedStylesStore((state) => state.clear)
  const setSharedStyles = useSharedStylesStore((state) => state.setSharedStyles)
  const sharedStyles = useSharedStylesStore((state) => state.sharedStyles)
  const currentThemeId = useThemeStore((state) => state.currentThemeId)
  const hydrateTheme = useThemeStore((state) => state.hydrateTheme)
  const activePageId = useProjectStore((state) => state.activePageId)
  const initializePages = useProjectStore((state) => state.initializePages)
  const loadProjects = useProjectStore((state) => state.loadProjects)
  const pages = useProjectStore((state) => state.pages)
  const currentProject = useProjectStore((state) => state.currentProject)
  const saveCurrentProject = useProjectStore((state) => state.saveCurrentProject)
  const saveStatus = useProjectStore((state) => state.saveStatus)
  const markDirty = useProjectStore((state) => state.markDirty)
  const switchProject = useProjectStore((state) => state.switchProject)
  const syncActivePageComponents = useProjectStore((state) => state.syncActivePageComponents)
  const saveTimerRef = useRef<number | null>(null)
  const canvasShortcutScopeRef = useRef(false)
  const [layoutState, setLayoutState] = useState(() => createDefaultEditorLayoutState())

  useEffect(() => {
    loadProjects()
  }, [loadProjects])

  // 加载自定义组件并注册到编辑器
  useEffect(() => {
    useCustomComponentStore.getState().loadFromStorage()
    useCustomComponentStore.getState().registerAllIntoEditor()
  }, [])

  // 当 URL 中的 projectId 改变时，切换到对应项目
  useEffect(() => {
    const handleSwitchProject = async () => {
      if (projectId && currentProjectId !== projectId) {
        const project = await switchProject(projectId)
        if (project) {
          message.success(`已切换到项目：${project.name}`)
        }
      }
    }
    handleSwitchProject()
  }, [currentProjectId, projectId, switchProject])

  // 当 currentProject 改变时，同步组件
  // 注意：不要依赖 updatedAt，否则保存操作会触发组件重新加载导致闪烁
  useEffect(() => {
    const project = useProjectStore.getState().currentProject
    if (project?.components) {
      initializePages(project)
      const embeddedSnapshot = deserializeProjectSnapshot(project.components)
      const meta = embeddedSnapshot ?? loadProjectMeta(project.id)
      const activePage = meta.pages.find((page) => page.id === meta.activePageId) ?? meta.pages[0]
      setComponents(activePage?.components ?? project.components)
      setDataSources(meta.dataSources)
      setSharedStyles(meta.sharedStyles)
      hydrateTheme(meta.themeId)
      clearRuntimeState()
      setVariables(meta.variables)
    }
  }, [clearRuntimeState, currentProjectId, hydrateTheme, initializePages, setComponents, setDataSources, setSharedStyles, setVariables])

  useEffect(() => {
    if (!currentProject) {
      clearDataSources()
      clearRuntimeState()
      clearSharedStyles()
      return
    }

    saveProjectMeta(currentProject.id, {
      dataSources,
      variables,
      pages,
      activePageId,
      sharedStyles,
      themeId: currentThemeId,
    })
  }, [activePageId, clearDataSources, clearRuntimeState, clearSharedStyles, currentProject, currentThemeId, dataSources, pages, sharedStyles, variables])

  useEffect(() => {
    if (!currentProject || !activePageId) {
      return
    }

    syncActivePageComponents(components)
  }, [activePageId, components, currentProject, syncActivePageComponents])

  useEffect(() => {
    if (!currentProject) {
      return
    }

    const snapshot = createDirtySnapshot({
      pages,
      activePageId,
      dataSources,
      variables,
      sharedStyles,
      themeId: currentThemeId,
    })
    markDirty(snapshot)

    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current)
    }

    if (saveStatus === 'dirty') {
      saveTimerRef.current = window.setTimeout(() => {
        saveCurrentProject(components)
      }, 3000)
    }

    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current)
      }
    }
  }, [activePageId, components, currentProject, currentThemeId, dataSources, markDirty, pages, saveCurrentProject, saveStatus, sharedStyles, variables])

  useEffect(() => {
    if (mode !== 'edit') {
      return
    }

    const handlePointerdown = (event: PointerEvent) => {
      const target = event.target as HTMLElement | null
      canvasShortcutScopeRef.current = Boolean(target?.closest('.edit-area'))
    }

    const handleKeydown = (event: KeyboardEvent) => {
      if (isEditableEventTarget(event.target)) {
        return
      }

      if (!shouldHandleEditorShortcut(event.target, canvasShortcutScopeRef.current)) {
        return
      }

      const action = getEditorShortcutAction(event)
      if (!action) {
        return
      }

      if ((action === 'copy' || action === 'delete') && (!curComponentId || curComponentId === 1)) {
        return
      }

      event.preventDefault()

      switch (action) {
        case 'copy':
          copyComponent(curComponentId!)
          break
        case 'delete':
          deleteComponent(curComponentId!)
          setCurComponentId(null)
          break
        case 'undo':
          undo()
          break
        case 'redo':
          redo()
          break
      }
    }

    window.addEventListener('pointerdown', handlePointerdown)
    window.addEventListener('keydown', handleKeydown)
    return () => {
      window.removeEventListener('pointerdown', handlePointerdown)
      window.removeEventListener('keydown', handleKeydown)
    }
  }, [copyComponent, curComponentId, deleteComponent, mode, redo, setCurComponentId, undo])

  return (
    <div className="h-[100vh] flex flex-col bg-bg-primary">
      <div className="h-[64px] flex items-center border-b border-border-light bg-bg-secondary shadow-soft">
        <Header onResetLayout={() => setLayoutState((current) => resetEditorLayoutState(current))}></Header>
      </div>
      {
        mode === 'edit' ? (
          <Allotment key={layoutState.version} className="flex-1">
            <Allotment.Pane
              preferredSize={layoutState.left.preferredSize}
              maxSize={layoutState.left.maxSize}
              minSize={layoutState.left.minSize}
              className="bg-bg-secondary border-r border-border-light"
            >
              <MaterialWrapper />
            </Allotment.Pane>
            <Allotment.Pane className="bg-bg-primary">
              <EditArea></EditArea>
            </Allotment.Pane>
            <Allotment.Pane
              preferredSize={layoutState.right.preferredSize}
              maxSize={layoutState.right.maxSize}
              minSize={layoutState.right.minSize}
              className="bg-bg-secondary border-l border-border-light"
            >
              <Setting></Setting>
            </Allotment.Pane>
          </Allotment>
        ) : (
          <Preview></Preview>
        )
      }

    </div>
  )
}
