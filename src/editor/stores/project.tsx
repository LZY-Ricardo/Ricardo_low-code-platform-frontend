import { create } from 'zustand'
import type { Component } from './components'
import { StorageManager, type Project } from '../utils/storage'
import * as projectsApi from '../../api/projects'
import type { ProjectData } from '../../api/projects'
import { getMyCollaborations, type CollaboratedProject } from '../../api/share'
import { message } from 'antd'
import type { SaveStatus } from '../utils/save-status'
import { shouldMarkDirty } from '../utils/save-status'
import { createPage, duplicatePage, getActivePage, replaceActivePageComponents, type EditorPage } from '../utils/page-model'
import { loadProjectMeta } from '../utils/project-meta'
import { useDataSourceStore } from './data-source'
import { useRuntimeStateStore } from './runtime-state'
import { useSharedStylesStore } from './shared-styles'
import { createPersistedSnapshot, deserializeProjectSnapshot, serializeProjectSnapshot, stripSnapshotMeta } from '../utils/project-snapshot'
import { useThemeStore } from '../../stores/theme'

interface ProjectState {
    currentProject: Project | null
    projects: Project[]
    collaboratedProjects: CollaboratedProject[]
    pages: EditorPage[]
    activePageId: string | null
    loading: boolean
    saveStatus: SaveStatus
    lastSavedAt: number | null
    lastPersistedSnapshot: string
}

interface ProjectActions {
    loadProjects: () => Promise<void>
    createProject: (name?: string, components?: Component[]) => Promise<Project>
    saveCurrentProject: (components: Component[]) => Promise<boolean>
    persistProjectComponents: (projectId: string, components: Component[]) => Promise<boolean>
    switchProject: (projectId: string) => Promise<Project | null>
    deleteProject: (projectId: string) => Promise<boolean>
    renameProject: (projectId: string, newName: string) => Promise<boolean>
    setCurrentProject: (project: Project | null) => void
    markDirty: (snapshot: string) => void
    initializePages: (project: Project | null) => void
    syncActivePageComponents: (components: Component[]) => void
    switchPage: (pageId: string, currentComponents: Component[]) => Component[] | null
    addPage: () => EditorPage
    duplicateActivePage: (currentComponents: Component[]) => EditorPage | null
    renamePage: (pageId: string, name: string) => void
    setProjectPublishUrl: (projectId: string, publishUrl: string | null) => void
}

const DEFAULT_COMPONENTS: Component[] = [
    {
        id: 1,
        name: 'Page',
        props: {},
        desc: '页面'
    }
]

/**
 * 将后端项目数据转换为前端 Project 类型
 */
function convertToProject(data: ProjectData): Project {
    return {
        id: data.id,
        name: data.name,
        components: data.components,
        publishUrl: data.publishUrl ?? null,
        deletedAt: data.deletedAt ? new Date(data.deletedAt).getTime() : null,
        createdAt: new Date(data.createdAt).getTime(),
        updatedAt: new Date(data.updatedAt).getTime(),
    }
}

/**
 * 检查是否已登录
 */
function isAuthenticated(): boolean {
    return !!localStorage.getItem('lowcode_token')
}

function getStoredSnapshot(project: Project): string {
    const embeddedSnapshot = deserializeProjectSnapshot(project.components)
    if (embeddedSnapshot) {
        return createPersistedSnapshot(embeddedSnapshot)
    }

    return JSON.stringify({
        pages: [createPage('页面 1', project.components)],
        dataSources: [],
        variables: {},
        sharedStyles: [],
        themeId: 'ocean',
    })
}

export const useProjectStore = create<ProjectState & ProjectActions>((set, get) => ({
    currentProject: null,
    projects: [],
    collaboratedProjects: [],
    pages: [],
    activePageId: null,
    loading: false,
    saveStatus: 'idle',
    lastSavedAt: null,
    lastPersistedSnapshot: '',

    /**
     * 加载项目列表（优先从云端加载）
     */
    loadProjects: async () => {
        set({ loading: true })
        
        try {
            // 如果已登录，从云端加载
            if (isAuthenticated()) {
                const response = await projectsApi.getProjects(1, 100)
                const cloudProjects = response.projects.map(convertToProject)

                // 加载协作项目
                let collaboratedProjects: CollaboratedProject[] = []
                try {
                    collaboratedProjects = await getMyCollaborations()
                } catch {
                    console.warn('Failed to load collaborated projects')
                }

                // 同步到 LocalStorage 缓存
                cloudProjects.forEach(project => {
                    StorageManager.saveProject(project)
                })
                
                set({ projects: cloudProjects, collaboratedProjects, loading: false })
                
                // 设置当前项目
                if (cloudProjects.length > 0) {
                    const lastProjectId = StorageManager.getLastProjectId()
                    const lastProject = lastProjectId 
                        ? cloudProjects.find(p => p.id === lastProjectId) 
                        : cloudProjects[0]
                    const activeProject = lastProject || cloudProjects[0]
                    set({
                        currentProject: activeProject,
                        saveStatus: 'saved',
                        lastSavedAt: activeProject.updatedAt,
                        lastPersistedSnapshot: getStoredSnapshot(activeProject),
                    })
                } else {
                    // 如果没有项目，创建默认项目
                    const defaultProject = await get().createProject('默认项目', DEFAULT_COMPONENTS)
                    set({ currentProject: defaultProject })
                }
            } else {
                // 未登录，从 LocalStorage 加载
                const localProjects = StorageManager.getAllProjects()
                set({ projects: localProjects, collaboratedProjects: [], loading: false })
                
                if (localProjects.length === 0) {
                    const defaultProject = await get().createProject('默认项目', DEFAULT_COMPONENTS)
                    set({ currentProject: defaultProject })
                } else {
                    const lastProjectId = StorageManager.getLastProjectId()
                    const lastProject = lastProjectId 
                        ? localProjects.find(p => p.id === lastProjectId) 
                        : localProjects[0]
                    const activeProject = lastProject || localProjects[0]
                    set({
                        currentProject: activeProject,
                        saveStatus: 'saved',
                        lastSavedAt: activeProject.updatedAt,
                        lastPersistedSnapshot: getStoredSnapshot(activeProject),
                    })
                }
            }
        } catch (error) {
            console.error('Failed to load projects from cloud, fallback to local:', error)
            // 云端加载失败，降级到 LocalStorage
            const localProjects = StorageManager.getAllProjects()
            set({ projects: localProjects, collaboratedProjects: [], loading: false })
            
            if (localProjects.length === 0) {
                const defaultProject = await get().createProject('默认项目', DEFAULT_COMPONENTS)
                set({ currentProject: defaultProject })
            } else {
                const lastProjectId = StorageManager.getLastProjectId()
                const lastProject = lastProjectId 
                    ? localProjects.find(p => p.id === lastProjectId) 
                    : localProjects[0]
                const activeProject = lastProject || localProjects[0]
                set({
                    currentProject: activeProject,
                    saveStatus: 'saved',
                    lastSavedAt: activeProject.updatedAt,
                    lastPersistedSnapshot: getStoredSnapshot(activeProject),
                })
            }
        }
    },

    /**
     * 创建项目（同步到云端和本地）
     */
    createProject: async (name, components) => {
        const projectName = name || `未命名项目_${Date.now()}`
        const projectComponents = components || DEFAULT_COMPONENTS
        
        try {
            // 如果已登录，创建到云端
            if (isAuthenticated()) {
                const cloudProject = await projectsApi.createProject({
                    name: projectName,
                    components: projectComponents,
                })
                
                const newProject = convertToProject(cloudProject)
                
                // 同步到 LocalStorage
                StorageManager.saveProject(newProject)
                
                const projects = [...get().projects, newProject]
                set({ 
                    projects,
                    currentProject: newProject,
                    saveStatus: 'saved',
                    lastSavedAt: newProject.updatedAt,
                    lastPersistedSnapshot: getStoredSnapshot(newProject),
                })
                
                return newProject
            } else {
                // 未登录，只保存到 LocalStorage
                const newProject = StorageManager.createProject(projectName, projectComponents)
                StorageManager.saveProject(newProject)
                
                const projects = StorageManager.getAllProjects()
                set({ 
                    projects,
                    currentProject: newProject,
                    saveStatus: 'saved',
                    lastSavedAt: newProject.updatedAt,
                    lastPersistedSnapshot: getStoredSnapshot(newProject),
                })
                
                return newProject
            }
        } catch (error) {
            console.error('Failed to create project to cloud, fallback to local:', error)
            message.error('创建项目失败，已保存到本地')
            
            // 降级到 LocalStorage
            const newProject = StorageManager.createProject(projectName, projectComponents)
            StorageManager.saveProject(newProject)
            
            const projects = StorageManager.getAllProjects()
            set({ 
                projects,
                currentProject: newProject,
                saveStatus: 'saved',
                lastSavedAt: newProject.updatedAt,
                lastPersistedSnapshot: getStoredSnapshot(newProject),
            })
            
            return newProject
        }
    },

    /**
     * 保存当前项目（同步到云端和本地）
     */
    saveCurrentProject: async (components) => {
        const { currentProject } = get()
        if (!currentProject) {
            console.warn('No current project to save')
            return false
        }

        const { dataSources } = useDataSourceStore.getState()
        const { variables } = useRuntimeStateStore.getState()
        const { sharedStyles } = useSharedStylesStore.getState()
        const { currentThemeId } = useThemeStore.getState()
        const pages = replaceActivePageComponents(get().pages, get().activePageId, components)
        const serializedComponents = serializeProjectSnapshot({
            pages,
            activePageId: get().activePageId,
            dataSources,
            variables,
            sharedStyles,
            themeId: currentThemeId,
        })

        const updatedProject: Project = {
            ...currentProject,
            components: serializedComponents,
            updatedAt: Date.now()
        }

        set({ saveStatus: 'saving' })

        try {
            // 如果已登录，保存到云端
            if (isAuthenticated()) {
                await projectsApi.updateProject(currentProject.id, {
                    components: serializedComponents,
                })
                
                // 同步到 LocalStorage
                StorageManager.saveProject(updatedProject)
                
                const projects = get().projects.map(p => 
                    p.id === updatedProject.id ? updatedProject : p
                )
                
                set({ 
                    currentProject: updatedProject,
                    projects,
                    saveStatus: 'saved',
                    lastSavedAt: updatedProject.updatedAt,
                    lastPersistedSnapshot: createPersistedSnapshot({
                        pages,
                        activePageId: get().activePageId,
                        dataSources,
                        variables,
                        sharedStyles,
                        themeId: currentThemeId,
                    }),
                })
                
                return true
            } else {
                // 未登录，只保存到 LocalStorage
                const success = StorageManager.saveProject(updatedProject)
                
                if (success) {
                    const projects = StorageManager.getAllProjects()
                    set({ 
                        currentProject: updatedProject,
                        projects,
                        saveStatus: 'saved',
                        lastSavedAt: updatedProject.updatedAt,
                        lastPersistedSnapshot: createPersistedSnapshot({
                            pages,
                            activePageId: get().activePageId,
                            dataSources,
                            variables,
                            sharedStyles,
                            themeId: currentThemeId,
                        }),
                    })
                }
                else {
                    set({ saveStatus: 'error' })
                }
                
                return success
            }
        } catch (error) {
            console.error('Failed to save project to cloud, saved to local:', error)
            
            // 降级到 LocalStorage
            const success = StorageManager.saveProject(updatedProject)
            
            if (success) {
                const projects = StorageManager.getAllProjects()
                set({ 
                    currentProject: updatedProject,
                    projects,
                    saveStatus: 'saved',
                    lastSavedAt: updatedProject.updatedAt,
                    lastPersistedSnapshot: createPersistedSnapshot({
                        pages,
                        activePageId: get().activePageId,
                        dataSources,
                        variables,
                        sharedStyles,
                        themeId: currentThemeId,
                    }),
                })
            }
            else {
                set({ saveStatus: 'error' })
            }
            
            return success
        }
    },

    persistProjectComponents: async (projectId, components) => {
        const existingProject = get().projects.find((project) => project.id === projectId)
            ?? (get().currentProject?.id === projectId ? get().currentProject : null)
            ?? StorageManager.getProject(projectId)

        if (!existingProject) {
            console.warn(`Project ${projectId} not found`)
            return false
        }

        const updatedProject: Project = {
            ...existingProject,
            components,
            updatedAt: Date.now(),
        }

        const applyLocalState = () => {
            StorageManager.saveProject(updatedProject)

            const nextProjects = get().projects.map((project) => (
                project.id === projectId ? updatedProject : project
            ))
            const nextCurrentProject = get().currentProject?.id === projectId
                ? updatedProject
                : get().currentProject

            set({
                projects: nextProjects,
                currentProject: nextCurrentProject,
                ...(nextCurrentProject?.id === projectId ? {
                    saveStatus: 'saved' as const,
                    lastSavedAt: updatedProject.updatedAt,
                    lastPersistedSnapshot: getStoredSnapshot(updatedProject),
                } : {}),
            })
        }

        try {
            if (isAuthenticated()) {
                await projectsApi.updateProject(projectId, { components })
            }

            applyLocalState()
            return true
        } catch (error) {
            console.error('Failed to persist project components to cloud, fallback to local:', error)
            applyLocalState()
            return true
        }
    },

    /**
     * 切换项目
     */
    switchProject: async (projectId) => {
        try {
            // 如果已登录，从云端获取最新数据
            if (isAuthenticated()) {
                const cloudProject = await projectsApi.getProject(projectId)
                const project = convertToProject(cloudProject)
                
                // 同步到 LocalStorage
                StorageManager.saveProject(project)
                StorageManager.setLastProjectId(projectId)
                
                set({
                    currentProject: project,
                    saveStatus: 'saved',
                    lastSavedAt: project.updatedAt,
                    lastPersistedSnapshot: getStoredSnapshot(project),
                })
                return project
            } else {
                // 未登录，从 LocalStorage 获取
                const project = StorageManager.getProject(projectId)
                
                if (!project) {
                    console.warn(`Project ${projectId} not found`)
                    return null
                }

                StorageManager.setLastProjectId(projectId)
                set({
                    currentProject: project,
                    saveStatus: 'saved',
                    lastSavedAt: project.updatedAt,
                    lastPersistedSnapshot: getStoredSnapshot(project),
                })
                
                return project
            }
        } catch (error) {
            console.error('Failed to switch project from cloud, fallback to local:', error)
            
            // 降级到 LocalStorage
            const project = StorageManager.getProject(projectId)
            
            if (!project) {
                console.warn(`Project ${projectId} not found`)
                return null
            }

            StorageManager.setLastProjectId(projectId)
            set({
                currentProject: project,
                saveStatus: 'saved',
                lastSavedAt: project.updatedAt,
                lastPersistedSnapshot: getStoredSnapshot(project),
            })
            
            return project
        }
    },

    /**
     * 删除项目（同步到云端和本地）
     */
    deleteProject: async (projectId) => {
        const { currentProject } = get()
        
        try {
            // 如果已登录，删除云端项目
            if (isAuthenticated()) {
                await projectsApi.deleteProject(projectId)
                
                // 同步删除 LocalStorage
                StorageManager.deleteProject(projectId)
                
                const updatedProjects = get().projects.filter(p => p.id !== projectId)
                
                if (currentProject?.id === projectId) {
                    if (updatedProjects.length > 0) {
                        set({ 
                            currentProject: updatedProjects[0],
                            projects: updatedProjects
                        })
                    } else {
                        const newProject = await get().createProject('默认项目', DEFAULT_COMPONENTS)
                        set({ 
                            currentProject: newProject,
                            projects: [newProject]
                        })
                    }
                } else {
                    set({ projects: updatedProjects })
                }
                
                return true
            } else {
                // 未登录，只删除 LocalStorage
                const success = StorageManager.deleteProject(projectId)
                
                if (!success) return false

                const updatedProjects = StorageManager.getAllProjects()
                
                if (currentProject?.id === projectId) {
                    if (updatedProjects.length > 0) {
                        set({ 
                            currentProject: updatedProjects[0],
                            projects: updatedProjects
                        })
                    } else {
                        const newProject = await get().createProject('默认项目', DEFAULT_COMPONENTS)
                        set({ 
                            currentProject: newProject,
                            projects: [newProject]
                        })
                    }
                } else {
                    set({ projects: updatedProjects })
                }
                
                return true
            }
        } catch (error) {
            console.error('Failed to delete project from cloud, fallback to local:', error)
            message.error('删除云端项目失败，已删除本地缓存')
            
            // 降级到 LocalStorage
            const success = StorageManager.deleteProject(projectId)
            
            if (!success) return false

            const updatedProjects = StorageManager.getAllProjects()
            
            if (currentProject?.id === projectId) {
                if (updatedProjects.length > 0) {
                    set({ 
                        currentProject: updatedProjects[0],
                        projects: updatedProjects
                    })
                } else {
                    const newProject = await get().createProject('默认项目', DEFAULT_COMPONENTS)
                    set({ 
                        currentProject: newProject,
                        projects: [newProject]
                    })
                }
            } else {
                set({ projects: updatedProjects })
            }
            
            return true
        }
    },

    /**
     * 重命名项目（同步到云端和本地）
     */
    renameProject: async (projectId, newName) => {
        try {
            // 如果已登录，更新云端
            if (isAuthenticated()) {
                await projectsApi.updateProject(projectId, { name: newName })
                
                // 同步到 LocalStorage
                StorageManager.renameProject(projectId, newName)
                
                const projects = get().projects.map(p => 
                    p.id === projectId ? { ...p, name: newName, updatedAt: Date.now() } : p
                )
                
                const { currentProject } = get()
                const updatedCurrentProject = currentProject?.id === projectId
                    ? projects.find(p => p.id === projectId) || currentProject
                    : currentProject
                
                set({ 
                    projects,
                    currentProject: updatedCurrentProject
                })
                
                return true
            } else {
                // 未登录，只更新 LocalStorage
                const success = StorageManager.renameProject(projectId, newName)
                
                if (success) {
                    const projects = StorageManager.getAllProjects()
                    const { currentProject } = get()
                    
                    const updatedCurrentProject = currentProject?.id === projectId
                        ? projects.find(p => p.id === projectId) || currentProject
                        : currentProject
                    
                    set({ 
                        projects,
                        currentProject: updatedCurrentProject
                    })
                }
                
                return success
            }
        } catch (error) {
            console.error('Failed to rename project in cloud, fallback to local:', error)
            message.error('重命名云端项目失败，已更新本地缓存')
            
            // 降级到 LocalStorage
            const success = StorageManager.renameProject(projectId, newName)
            
            if (success) {
                const projects = StorageManager.getAllProjects()
                const { currentProject } = get()
                
                const updatedCurrentProject = currentProject?.id === projectId
                    ? projects.find(p => p.id === projectId) || currentProject
                    : currentProject
                
                set({ 
                    projects,
                    currentProject: updatedCurrentProject
                })
            }
            
            return success
        }
    },

    setCurrentProject: (project) => {
        set({
            currentProject: project,
            pages: [],
            activePageId: null,
            saveStatus: project ? 'saved' : 'idle',
            lastSavedAt: project?.updatedAt ?? null,
            lastPersistedSnapshot: project ? getStoredSnapshot(project) : '',
        })
    },

    markDirty: (snapshot) => {
        const { lastPersistedSnapshot, saveStatus } = get()
        const isDirty = shouldMarkDirty(snapshot, lastPersistedSnapshot)

        if (isDirty && saveStatus !== 'saving') {
            set({ saveStatus: 'dirty' })
            return
        }

        if (!isDirty && saveStatus !== 'saving') {
            set({ saveStatus: 'saved' })
        }
    },

    initializePages: (project) => {
        if (!project) {
            const state = get()
            if (state.pages.length === 0 && state.activePageId === null) {
                return
            }

            set({ pages: [], activePageId: null })
            return
        }

        const embeddedSnapshot = deserializeProjectSnapshot(project.components)
        const meta = embeddedSnapshot ?? loadProjectMeta(project.id)
        const pages = meta.pages.length > 0
            ? meta.pages
            : [createPage('页面 1', stripSnapshotMeta(project.components))]
        const activePage = getActivePage(pages, meta.activePageId)
        const state = get()
        const nextActivePageId = activePage?.id ?? null

        if (state.pages === pages && state.activePageId === nextActivePageId) {
            return
        }

        set({
            pages,
            activePageId: nextActivePageId,
        })
    },

    syncActivePageComponents: (components) => {
        const state = get()
        const nextPages = replaceActivePageComponents(state.pages, state.activePageId, components)

        if (nextPages === state.pages) {
            return
        }

        set({
            pages: nextPages,
        })
    },

    switchPage: (pageId, currentComponents) => {
        const { pages, activePageId } = get()
        const syncedPages = replaceActivePageComponents(pages, activePageId, currentComponents)
        const nextPage = getActivePage(syncedPages, pageId)
        if (!nextPage) {
            return null
        }

        set({
            pages: syncedPages,
            activePageId: nextPage.id,
        })
        return nextPage.components
    },

    addPage: () => {
        const page = createPage(`页面 ${get().pages.length + 1}`, DEFAULT_COMPONENTS)
        set((state) => ({
            pages: [...state.pages, page],
            activePageId: page.id,
        }))
        return page
    },

    duplicateActivePage: (currentComponents) => {
        const { pages, activePageId } = get()
        if (!activePageId) {
            return null
        }

        const syncedPages = replaceActivePageComponents(pages, activePageId, currentComponents)
        const nextPages = duplicatePage(syncedPages, activePageId)
        const duplicated = nextPages[nextPages.length - 1] ?? null
        set({
            pages: nextPages,
            activePageId: duplicated?.id ?? activePageId,
        })
        return duplicated
    },

    renamePage: (pageId, name) => {
        set((state) => ({
            pages: state.pages.map((page) => (
                page.id === pageId
                    ? { ...page, name }
                    : page
            )),
        }))
    },

    setProjectPublishUrl: (projectId, publishUrl) => {
        const now = Date.now()
        const nextProjects = get().projects.map((project) => (
            project.id === projectId
                ? { ...project, publishUrl, updatedAt: now }
                : project
        ))
        const nextCurrentProject = get().currentProject?.id === projectId
            ? { ...get().currentProject!, publishUrl, updatedAt: now }
            : get().currentProject

        const changedProject = nextProjects.find((project) => project.id === projectId)
        if (changedProject) {
            StorageManager.saveProject(changedProject)
        }

        set({
            projects: nextProjects,
            currentProject: nextCurrentProject ?? get().currentProject,
        })
    },
}))
