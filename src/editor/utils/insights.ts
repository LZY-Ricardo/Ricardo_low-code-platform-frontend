import type { Component } from '../stores/components'

export interface PageSuggestion {
  code: string
  title: string
  description: string
  severity: 'info' | 'warning'
}

export function analyzePageSuggestions(components: Component[]): PageSuggestion[] {
  const all = flattenComponents(components)
  const suggestions: PageSuggestion[] = []

  const buttonTexts = all
    .filter((item) => item.name === 'Button')
    .filter((item) => !isInsideRepeatingLayout(item.parentId, all))
    .map((item) => typeof item.props.text === 'string' ? item.props.text : '')
    .filter(Boolean)

  const duplicateTexts = buttonTexts.filter((text, index) => buttonTexts.indexOf(text) !== index)
  if (duplicateTexts.length > 0) {
    suggestions.push({
      code: 'duplicate-button-text',
      title: '按钮文案重复',
      description: '检测到多个按钮使用相同文案，建议区分主操作和次操作。',
      severity: 'warning',
    })
  }

  const imageMissingAlt = all.some((item) => item.name === 'Image' && (
    !item.props.alt || item.props.alt === '图片'
  ))
  if (imageMissingAlt) {
    suggestions.push({
      code: 'image-missing-alt',
      title: '图片缺少说明文本',
      description: '建议为图片补充 alt 文本，提升可访问性和内容清晰度。',
      severity: 'info',
    })
  }

  const hasTitle = all.some((item) => (
    item.name === 'Title'
    || (item.name === 'Form' && typeof item.props.title === 'string' && item.props.title)
    || (item.name === 'Card' && typeof item.props.title === 'string' && item.props.title)
    || (item.name === 'Modal' && typeof item.props.title === 'string' && item.props.title)
  ))
  if (!hasTitle) {
    suggestions.push({
      code: 'missing-title',
      title: '页面缺少标题',
      description: '建议增加标题组件，帮助页面形成明确的信息层级。',
      severity: 'info',
    })
  }

  return suggestions
}

function isInsideRepeatingLayout(parentId: number | undefined, all: Component[]): boolean {
  if (!parentId) {
    return false
  }

  const parent = all.find((item) => item.id === parentId)
  return parent?.name === 'Row' || parent?.name === 'Col'
}

function flattenComponents(components: Component[]): Component[] {
  return components.flatMap((component) => [
    component,
    ...(component.children ? flattenComponents(component.children) : []),
  ])
}
