import { describe, expect, it } from 'vitest'
import { buildTemplatePageFromSubtree } from './reusable-template'
import type { Component } from '../stores/components'

describe('reusable template builder', () => {
  it('wraps subtree in a Page root and rewrites parent ids', () => {
    const subtree: Component = {
      id: 20,
      name: 'Card',
      props: { title: '统计' },
      desc: '卡片',
      children: [
        { id: 21, name: 'Text', props: { text: 'A' }, desc: '文本', parentId: 20 },
      ],
    }

    const page = buildTemplatePageFromSubtree(subtree)
    expect(page[0].name).toBe('Page')
    expect(page[0].id).toBe(1)
    expect(page[0].children?.[0].name).toBe('Card')
    expect(page[0].children?.[0].parentId).toBe(1)
    expect(page[0].children?.[0].children?.[0].parentId).toBe(page[0].children?.[0].id)
  })
})
