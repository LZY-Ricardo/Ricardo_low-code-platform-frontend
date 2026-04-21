import type { Component } from '../stores/components'

export interface Project {
    id: string
    name: string
    components: Component[]
    createdAt: number
    updatedAt: number
}

const STORAGE_PREFIX = 'lowcode_'
const PROJECTS_KEY = `${STORAGE_PREFIX}projects`
const LAST_PROJECT_KEY = `${STORAGE_PREFIX}last_project_id`

export class StorageManager {
    private static isStorageAvailable(): boolean {
        try {
            const test = '__storage_test__'
            localStorage.setItem(test, test)
            localStorage.removeItem(test)
            return true
        } catch {
            return false
        }
    }

    static saveProject(project: Project): boolean {
        if (!this.isStorageAvailable()) {
            console.warn('LocalStorage is not available')
            return false
        }

        try {
            const projects = this.getAllProjects()
            const existingIndex = projects.findIndex(p => p.id === project.id)
            
            project.updatedAt = Date.now()
            
            if (existingIndex >= 0) {
                projects[existingIndex] = project
            } else {
                projects.push(project)
            }

            localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects))
            this.setLastProjectId(project.id)
            return true
        } catch (error) {
            if (error instanceof DOMException && error.name === 'QuotaExceededError') {
                console.error('LocalStorage quota exceeded')
                alert('存储空间不足，请删除一些旧项目或导出数据')
            } else {
                console.error('Failed to save project:', error)
            }
            return false
        }
    }

    static getAllProjects(): Project[] {
        if (!this.isStorageAvailable()) {
            return []
        }

        try {
            const data = localStorage.getItem(PROJECTS_KEY)
            if (!data) return []
            
            const projects = JSON.parse(data) as Project[]
            return projects.filter(p => this.validateProject(p))
        } catch (error) {
            console.error('Failed to load projects:', error)
            return []
        }
    }

    static getProject(id: string): Project | null {
        const projects = this.getAllProjects()
        return projects.find(p => p.id === id) || null
    }

    static deleteProject(id: string): boolean {
        if (!this.isStorageAvailable()) {
            return false
        }

        try {
            const projects = this.getAllProjects()
            const filtered = projects.filter(p => p.id !== id)
            localStorage.setItem(PROJECTS_KEY, JSON.stringify(filtered))
            
            if (this.getLastProjectId() === id) {
                const newLastProject = filtered[0]
                if (newLastProject) {
                    this.setLastProjectId(newLastProject.id)
                } else {
                    localStorage.removeItem(LAST_PROJECT_KEY)
                }
            }
            
            return true
        } catch (error) {
            console.error('Failed to delete project:', error)
            return false
        }
    }

    static renameProject(id: string, newName: string): boolean {
        const project = this.getProject(id)
        if (!project) return false

        project.name = newName
        project.updatedAt = Date.now()
        return this.saveProject(project)
    }

    static createProject(name: string, components: Component[]): Project {
        return {
            id: this.generateId(),
            name,
            components,
            createdAt: Date.now(),
            updatedAt: Date.now()
        }
    }

    static setLastProjectId(id: string): void {
        if (!this.isStorageAvailable()) return
        localStorage.setItem(LAST_PROJECT_KEY, id)
    }

    static getLastProjectId(): string | null {
        if (!this.isStorageAvailable()) return null
        return localStorage.getItem(LAST_PROJECT_KEY)
    }

    private static validateProject(project: unknown): project is Project {
        if (typeof project !== 'object' || project === null) {
            return false
        }

        const candidate = project as Partial<Project>
        return (
            typeof candidate.id === 'string' &&
            typeof candidate.name === 'string' &&
            Array.isArray(candidate.components) &&
            typeof candidate.createdAt === 'number' &&
            typeof candidate.updatedAt === 'number'
        )
    }

    private static generateId(): string {
        return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }

    static clearAllProjects(): void {
        if (!this.isStorageAvailable()) return
        localStorage.removeItem(PROJECTS_KEY)
        localStorage.removeItem(LAST_PROJECT_KEY)
    }
}
