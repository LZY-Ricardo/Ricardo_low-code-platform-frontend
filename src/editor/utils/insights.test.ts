import { describe, expect, it } from 'vitest'
import { analyzePageSuggestions } from './insights'
import type { Component } from '../stores/components'

const page: Component[] = [
  {
    id: 1,
    name: 'Page',
    props: {},
    desc: '页面',
    children: [
      { id: 2, name: 'Button', props: { text: '提交' }, desc: '按钮' },
      { id: 3, name: 'Button', props: { text: '提交' }, desc: '按钮' },
      { id: 4, name: 'Image', props: { src: 'x', alt: '' }, desc: '图片' },
    ],
  },
]

describe('page insights', () => {
  it('finds duplicate button labels and missing image alt', () => {
    const suggestions = analyzePageSuggestions(page)
    expect(suggestions.some((item) => item.code === 'duplicate-button-text')).toBe(true)
    expect(suggestions.some((item) => item.code === 'image-missing-alt')).toBe(true)
  })

  it('does not report missing title when form title exists', () => {
    const suggestions = analyzePageSuggestions([
      {
        id: 1,
        name: 'Page',
        props: {},
        desc: '页面',
        children: [
          { id: 2, name: 'Form', props: { title: '活动报名' }, desc: '表单' },
        ],
      },
    ])
    expect(suggestions.some((item) => item.code === 'missing-title')).toBe(false)
  })

  it('does not report duplicate button text for repeated row actions', () => {
    const suggestions = analyzePageSuggestions([
      {
        id: 1,
        name: 'Page',
        props: {},
        desc: '页面',
        children: [
          {
            id: 2,
            name: 'Row',
            props: {},
            desc: '行布局',
            children: [
              { id: 3, name: 'Button', props: { text: '编辑' }, desc: '按钮', parentId: 2 },
              { id: 4, name: 'Button', props: { text: '编辑' }, desc: '按钮', parentId: 2 },
            ],
          },
        ],
      },
    ])
    expect(suggestions.some((item) => item.code === 'duplicate-button-text')).toBe(false)
  })
})
