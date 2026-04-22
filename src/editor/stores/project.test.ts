import { beforeEach, describe, expect, it } from 'vitest'
import { useProjectStore } from './project'
import type { Component } from './components'
import { createPage } from '../utils/page-model'

const baseComponents: Component[] = [
  { id: 1, name: 'Page', props: {}, desc: '页面' },
]

beforeEach(() => {
  const page = createPage('页面 1', baseComponents)
  useProjectStore.setState({
    currentProject: null,
    projects: [],
    collaboratedProjects: [],
    pages: [page],
    activePageId: page.id,
    loading: false,
    saveStatus: 'idle',
    lastSavedAt: null,
    lastPersistedSnapshot: '',
  })
})

describe('project store shared page sync', () => {
  it('keeps the same pages reference when syncing unchanged active page components', () => {
    const previousPages = useProjectStore.getState().pages

    useProjectStore.getState().syncActivePageComponents(baseComponents)

    expect(useProjectStore.getState().pages).toBe(previousPages)
  })
})
