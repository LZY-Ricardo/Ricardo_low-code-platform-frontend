import type { Component } from '../stores/components'

export function generateComponentsFromPrompt(prompt: string): Component[] {
  const normalized = prompt.toLowerCase()

  if (normalized.includes('表单') || normalized.includes('报名')) {
    return buildFormPage()
  }

  if (normalized.includes('看板') || normalized.includes('dashboard') || normalized.includes('数据')) {
    return buildDashboardPage()
  }

  return buildLandingPage()
}

function buildDashboardPage(): Component[] {
  return [{
    id: 1,
    name: 'Page',
    props: {},
    desc: '页面',
    children: [
      { id: 2, name: 'Title', props: { text: '运营数据看板', level: 2 }, desc: '标题', parentId: 1 },
      { id: 3, name: 'Chart', props: { title: '核心趋势', chartType: 'line', dataText: '周一,120\n周二,180\n周三,160' }, desc: '图表', parentId: 1 },
      { id: 4, name: 'Table', props: { columnsText: '指标,数值', dataText: '访问量,1200\n转化率,15' }, desc: '表格', parentId: 1 },
    ],
  }]
}

function buildFormPage(): Component[] {
  return [{
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
        parentId: 1,
        children: [
          { id: 3, name: 'Input', props: { placeholder: '请输入姓名', value: '' }, desc: '输入框', parentId: 2 },
          { id: 4, name: 'Select', props: { placeholder: '请选择类型', optionsText: '学生,教师,访客', value: '' }, desc: '下拉框', parentId: 2 },
          { id: 5, name: 'DatePicker', props: { placeholder: '请选择日期', value: '' }, desc: '日期选择', parentId: 2 },
          { id: 6, name: 'Button', props: { type: 'primary', text: '提交' }, desc: '按钮', parentId: 2 },
        ],
      },
    ],
  }]
}

function buildLandingPage(): Component[] {
  return [{
    id: 1,
    name: 'Page',
    props: {},
    desc: '页面',
    children: [
      { id: 2, name: 'Title', props: { text: '智能生成页面', level: 2 }, desc: '标题', parentId: 1 },
      { id: 3, name: 'Text', props: { text: '这是根据描述生成的页面骨架。' }, desc: '文本', parentId: 1 },
      { id: 4, name: 'Button', props: { type: 'primary', text: '开始使用' }, desc: '按钮', parentId: 1 },
    ],
  }]
}
