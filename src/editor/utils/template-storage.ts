import type { Component } from '../stores/components'
import type { DataSource } from '../stores/data-source'
import type { SharedStyleDefinition } from '../stores/shared-styles'
import { createPage, type EditorPage } from './page-model'

export interface ProjectTemplate {
  id: string
  name: string
  description: string
  components: Component[]
  pages: EditorPage[]
  dataSources: DataSource[]
  variables: Record<string, unknown>
  sharedStyles: SharedStyleDefinition[]
  themeId: string | null
  builtIn: boolean
}

const STORAGE_KEY = 'lowcode_project_templates'

export function createBuiltInTemplates(): ProjectTemplate[] {
  return [
    {
      id: 'tpl_dashboard',
      name: '数据看板',
      description: '包含标题、图表和表格的看板模板',
      builtIn: true,
      dataSources: [],
      variables: {},
      sharedStyles: [],
      themeId: 'ocean',
      pages: [createPage('页面 1', [
        {
          id: 1,
          name: 'Page',
          props: {},
          desc: '页面',
          children: [
            {
              id: 2,
              name: 'Title',
              props: { text: '运营数据看板', level: 2 },
              desc: '标题',
            },
            {
              id: 3,
              name: 'Chart',
              props: {
                title: '近7日趋势',
                chartType: 'line',
                dataText: '周一,120\n周二,180\n周三,160',
              },
              desc: '图表',
            },
            {
              id: 4,
              name: 'Table',
              props: {
                columnsText: '指标,数值',
                dataText: '访问量,1200\n转化率,15',
              },
              desc: '表格',
            },
          ],
        },
      ])],
      components: [
        {
          id: 1,
          name: 'Page',
          props: {},
          desc: '页面',
          children: [
            {
              id: 2,
              name: 'Title',
              props: { text: '运营数据看板', level: 2 },
              desc: '标题',
            },
            {
              id: 3,
              name: 'Chart',
              props: {
                title: '近7日趋势',
                chartType: 'line',
                dataText: '周一,120\n周二,180\n周三,160',
              },
              desc: '图表',
            },
            {
              id: 4,
              name: 'Table',
              props: {
                columnsText: '指标,数值',
                dataText: '访问量,1200\n转化率,15',
              },
              desc: '表格',
            },
          ],
        },
      ],
    },
    {
      id: 'tpl_form',
      name: '报名表单',
      description: '包含表单、输入框、日期和提交按钮的模板',
      builtIn: true,
      dataSources: [],
      variables: {},
      sharedStyles: [],
      themeId: 'ocean',
      pages: [createPage('页面 1', [
        {
          id: 1,
          name: 'Page',
          props: {},
          desc: '页面',
          children: [
            {
              id: 2,
              name: 'Form',
              props: { title: '活动报名', layout: 'vertical' },
              desc: '表单',
              children: [
                { id: 3, name: 'Input', props: { placeholder: '请输入姓名', value: '' }, desc: '输入框', parentId: 2 },
                { id: 4, name: 'DatePicker', props: { placeholder: '请选择日期', value: '' }, desc: '日期选择', parentId: 2 },
                { id: 5, name: 'Button', props: { type: 'primary', text: '提交' }, desc: '按钮', parentId: 2 },
              ],
            },
          ],
        },
      ])],
      components: [
        {
          id: 1,
          name: 'Page',
          props: {},
          desc: '页面',
          children: [
            {
              id: 2,
              name: 'Form',
              props: { title: '活动报名', layout: 'vertical' },
              desc: '表单',
              children: [
                { id: 3, name: 'Input', props: { placeholder: '请输入姓名', value: '' }, desc: '输入框', parentId: 2 },
                { id: 4, name: 'DatePicker', props: { placeholder: '请选择日期', value: '' }, desc: '日期选择', parentId: 2 },
                { id: 5, name: 'Button', props: { type: 'primary', text: '提交' }, desc: '按钮', parentId: 2 },
              ],
            },
          ],
        },
      ],
    },
  ]
}

export function getAllTemplates(): ProjectTemplate[] {
  const stored = loadCustomTemplates()
  return [...createBuiltInTemplates(), ...stored]
}

export function saveTemplate(template: ProjectTemplate): void {
  const templates = loadCustomTemplates().filter((item) => item.id !== template.id)
  templates.unshift({ ...template, builtIn: false })
  localStorage.setItem(STORAGE_KEY, JSON.stringify(templates))
}

export function normalizeTemplatePages(template: ProjectTemplate): EditorPage[] {
  if (template.pages?.length) {
    return template.pages
  }

  return [createPage('页面 1', template.components)]
}

function loadCustomTemplates(): ProjectTemplate[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return []
    }

    const parsed = JSON.parse(raw) as ProjectTemplate[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}
