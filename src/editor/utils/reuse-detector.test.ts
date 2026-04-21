import { describe, expect, it } from 'vitest'
import { findReusableStructures } from './reuse-detector'
import type { Component } from '../stores/components'

const components: Component[] = [
  {
    id: 1,
    name: 'Page',
    props: {},
    desc: '页面',
    children: [
      {
        id: 2,
        name: 'Card',
        props: { title: '统计' },
        desc: '卡片',
        children: [{ id: 3, name: 'Text', props: { text: 'A' }, desc: '文本' }],
      },
      {
        id: 4,
        name: 'Card',
        props: { title: '统计' },
        desc: '卡片',
        children: [{ id: 5, name: 'Text', props: { text: 'A' }, desc: '文本' }],
      },
    ],
  },
]

describe('reuse detector', () => {
  it('finds duplicate subtrees', () => {
    const items = findReusableStructures(components)
    expect(items[0]?.occurrenceIds).toEqual([2, 4])
  })

  it('ignores duplicated leaf nodes', () => {
    const leafItems = findReusableStructures([
      {
        id: 1,
        name: 'Page',
        props: {},
        desc: '页面',
        children: [
          { id: 2, name: 'Button', props: { text: '提交' }, desc: '按钮' },
          { id: 3, name: 'Button', props: { text: '提交' }, desc: '按钮' },
        ],
      },
    ])
    expect(leafItems).toHaveLength(0)
  })
})
