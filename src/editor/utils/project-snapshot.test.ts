import { describe, expect, it } from 'vitest'
import type { Component } from '../stores/components'
import type { DataSource } from '../stores/data-source'
import type { EditorPage } from './page-model'
import { deserializeProjectSnapshot, isEditorSnapshot, serializeProjectSnapshot } from './project-snapshot'

const pages: EditorPage[] = [
  {
    id: 'page_1',
    name: '页面 1',
    components: [{ id: 1, name: 'Page', props: {}, desc: '页面' }],
  },
  {
    id: 'page_2',
    name: '页面 2',
    components: [{ id: 1, name: 'Page', props: { title: 'B' }, desc: '页面' }],
  },
]

const dataSources: DataSource[] = [
  {
    id: 'ds_users',
    name: '用户列表',
    resultKey: 'users',
    method: 'GET',
    url: '/api/users',
  },
]

describe('project snapshot', () => {
  it('serializes editor state into components payload', () => {
    const payload = serializeProjectSnapshot({
      pages,
      activePageId: 'page_2',
      dataSources,
      variables: { keyword: 'react' },
      sharedStyles: [],
      themeId: 'ocean',
    })

    expect(payload[0].props.__editorMeta).toBeDefined()
    expect(payload[0].props.title).toBe('B')
  })

  it('deserializes editor meta from saved components', () => {
    const payload = serializeProjectSnapshot({
      pages,
      activePageId: 'page_2',
      dataSources,
      variables: { keyword: 'react' },
      sharedStyles: [],
      themeId: 'ocean',
    })

    const snapshot = deserializeProjectSnapshot(payload as Component[])
    expect(snapshot?.activePageId).toBe('page_2')
    expect(snapshot?.pages).toHaveLength(2)
    expect(snapshot?.dataSources[0].id).toBe('ds_users')
    expect(snapshot?.variables).toEqual({ keyword: 'react' })
  })

  it('rejects invalid snapshot shapes', () => {
    expect(isEditorSnapshot({
      pages: [{ id: 'page_1', name: '页面 1', components: [] }],
      activePageId: 'missing',
      dataSources: [],
      variables: {},
      sharedStyles: [],
      themeId: 'ocean',
    })).toBe(false)
  })
})
