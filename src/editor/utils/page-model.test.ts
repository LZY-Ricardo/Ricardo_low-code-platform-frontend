import { describe, expect, it } from 'vitest'
import type { Component } from '../stores/components'
import {
  createPage,
  duplicatePage,
  getActivePage,
  replaceActivePageComponents,
} from './page-model'

const baseComponents: Component[] = [
  { id: 1, name: 'Page', props: {}, desc: '页面' },
]

describe('page model', () => {
  it('creates a named page with components', () => {
    const page = createPage('页面 1', baseComponents)
    expect(page.name).toBe('页面 1')
    expect(page.components).toEqual(baseComponents)
  })

  it('replaces active page components only for target page', () => {
    const pages = [
      createPage('页面 1', baseComponents),
      createPage('页面 2', [{ id: 1, name: 'Page', props: {}, desc: '页面', children: [] }]),
    ]

    const next = replaceActivePageComponents(pages, pages[1].id, [{ id: 1, name: 'Page', props: { title: 'A' }, desc: '页面' }])
    expect(next[1].components[0].props).toEqual({ title: 'A' })
    expect(next[0].components).toEqual(baseComponents)
  })

  it('keeps the same pages reference when active page components are unchanged', () => {
    const activeComponents = [{ id: 1, name: 'Page', props: { title: 'A' }, desc: '页面' }]
    const pages = [
      createPage('页面 1', baseComponents),
      createPage('页面 2', activeComponents),
    ]

    const next = replaceActivePageComponents(pages, pages[1].id, activeComponents)
    expect(next).toBe(pages)
  })

  it('duplicates a page with a new id and copied name suffix', () => {
    const pages = [createPage('首页', baseComponents)]
    const next = duplicatePage(pages, pages[0].id)
    expect(next).toHaveLength(2)
    expect(next[1].name).toContain('副本')
    expect(next[1].id).not.toBe(pages[0].id)
  })

  it('gets active page by id', () => {
    const pages = [createPage('首页', baseComponents)]
    expect(getActivePage(pages, pages[0].id)?.name).toBe('首页')
  })
})
