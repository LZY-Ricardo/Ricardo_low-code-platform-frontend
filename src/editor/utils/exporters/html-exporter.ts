import { BaseExporter } from './base-exporter'
import { ExportFormat, type ExportOptions } from './types'
import type { Component } from '@/editor/stores/components'

/**
 * HTML 静态页面导出器
 * 将组件树导出为单个 HTML 文件
 */
export class HTMLExporter extends BaseExporter {
  format = ExportFormat.HTML

  protected async generate(
    components: Component[],
    options: ExportOptions
  ): Promise<string> {
    const { projectName, includeAntdCDN = true } = options

    const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${this.escapeHtml(projectName)}</title>
  ${includeAntdCDN ? this.getAntdCDN() : ''}
  <style>
${this.getBaseStyles(options.themeColors)}
  </style>
</head>
<body>
${this.renderComponents(components, 1)}

  <script>
${this.getInteractiveScripts()}
  </script>
</body>
</html>`

    return options.minifyHTML ? this.minify(html) : html
  }

  /**
   * 渲染组件树为 HTML
   */
  private renderComponents(components: Component[], level = 0): string {
    const indent = '  '.repeat(level)

    return components.map(component => {
      const { name, props, styles, children, events } = component

      // 获取 HTML 标签
      const tag = this.getHTMLTag(name, props)

      // 处理属性
      const attrs = this.getHTMLAttributes(name, props)

      // 处理样式
      const style = styles ? this.styleObjectToString(styles as Record<string, unknown>) : ''

      // 处理事件
      const eventAttrs = events ? this.getEventAttributes(events) : ''

      // 构建属性字符串
      let attrStr = ''
      if (attrs) attrStr += ' ' + attrs
      if (style) attrStr += ` style="${style}"`
      if (eventAttrs) attrStr += ' ' + eventAttrs

      // 自闭合标签
      if (this.isSelfClosing(name)) {
        return `${indent}<${tag}${attrStr} />`
      }

      // 渲染开标签
      let html = `${indent}<${tag}${attrStr}>`

      // 渲染内容
      if (children && children.length > 0) {
        html += '\n' + this.renderComponents(children, level + 1) + '\n' + indent
      } else {
        const text = this.getStringProp(props, 'text')
        if (text) {
          html += this.escapeHtml(text)
        }
      }

      // 渲染闭标签
      html += `</${tag}>`

      return html
    }).join('\n')
  }

  /**
   * 组件名映射为 HTML 标签
   */
  private getHTMLTag(componentName: string, props: Record<string, unknown>): string {
    const tagMap: Record<string, string> = {
      'Page': 'div',
      'Container': 'div',
      'Button': 'button',
      'Input': 'input',
      'Text': 'span',
      'Image': 'img',
      'Card': 'div'
    }

    // Title 需要根据 level 动态处理
    if (componentName === 'Title') {
      const level = this.getNumberProp(props, 'level') ?? 1
      return `h${Math.min(Math.max(level, 1), 6)}`
    }

    return tagMap[componentName] || 'div'
  }

  /**
   * 生成 HTML 属性
   */
  private getHTMLAttributes(componentName: string, props: Record<string, unknown>): string {
    const attrs: string[] = []

    // 添加 class
    const className = this.getClassName(componentName, props)
    if (className) {
      attrs.push(`class="${className}"`)
    }

    // 根据不同组件类型处理属性
    switch (componentName) {
      case 'Button':
        if (props?.type) {
          // type 已经在 className 中处理
        }
        break

      case 'Input':
      {
        attrs.push('type="text"')
        const placeholder = this.getStringProp(props, 'placeholder')
        if (placeholder) {
          attrs.push(`placeholder="${this.escapeHtml(placeholder)}"`)
        }
        const value = this.getStringProp(props, 'value')
        if (value) {
          attrs.push(`value="${this.escapeHtml(value)}"`)
        }
        break
      }

      case 'Image':
      {
        const src = this.getStringProp(props, 'src')
        if (src) {
          attrs.push(`src="${this.escapeHtml(src)}"`)
        }
        const alt = this.getStringProp(props, 'alt')
        if (alt) {
          attrs.push(`alt="${this.escapeHtml(alt)}"`)
        }
        const width = this.getNumberProp(props, 'width')
        if (width) {
          attrs.push(`width="${width}"`)
        }
        const height = this.getNumberProp(props, 'height')
        if (height) {
          attrs.push(`height="${height}"`)
        }
        break
      }

      case 'Card':
        if (props?.title) {
          // Card 标题会在子元素中处理
        }
        break
    }

    return attrs.join(' ')
  }

  /**
   * 获取组件的 CSS 类名
   */
  private getClassName(componentName: string, props: Record<string, unknown>): string {
    const classes: string[] = []

    switch (componentName) {
      case 'Page':
        classes.push('page')
        break
      case 'Container':
        classes.push('container')
        break
      case 'Button':
        classes.push('btn')
        if (props?.type) {
          classes.push(`btn-${props.type}`)
        }
        break
      case 'Card':
        classes.push('card')
        break
    }

    return classes.join(' ')
  }

  /**
   * 判断是否为自闭合标签
   */
  private isSelfClosing(componentName: string): boolean {
    return componentName === 'Input' || componentName === 'Image'
  }

  /**
   * 样式对象转字符串
   */
  private styleObjectToString(styles: Record<string, unknown>): string {
    return Object.entries(styles)
      .map(([key, value]) => {
        // 将驼峰命名转换为短横线命名
        const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase()
        // 处理数值类型（自动添加 px 单位，除了特定属性）
        const cssValue = typeof value === 'number' && !['opacity', 'zIndex', 'fontWeight'].includes(key)
          ? `${value}px`
          : value
        return `${cssKey}: ${cssValue}`
      })
      .join('; ')
  }

  /**
   * 处理事件属性
   */
  private getEventAttributes(events: Record<string, unknown>): string {
    const attrs: string[] = []

    // 将事件配置序列化为 data 属性
    if (Object.keys(events).length > 0) {
      attrs.push(`data-events='${JSON.stringify(events)}'`)
    }

    return attrs.join(' ')
  }

  /**
   * HTML 转义
   */
  private escapeHtml(text: string): string {
    const div = document.createElement('div')
    div.textContent = text
    return div.innerHTML
  }

  /**
   * 获取 Ant Design CDN
   */
  private getAntdCDN(): string {
    return `  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/antd@5/dist/reset.css" />`
  }

  /**
   * 获取基础样式
   */
  private getBaseStyles(themeColors?: { primary: string; primaryHover: string }): string {
    const primary = themeColors?.primary || '#1677ff'
    const primaryHover = themeColors?.primaryHover || '#4096ff'

    return `    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
        'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }

    .page {
      min-height: 100vh;
    }

    .container {
      padding: 20px;
    }

    .btn {
      padding: 4px 15px;
      font-size: 14px;
      border-radius: 6px;
      border: 1px solid transparent;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-primary {
      background-color: ${primary};
      color: white;
      border-color: ${primary};
    }

    .btn-primary:hover {
      background-color: ${primaryHover};
      border-color: ${primaryHover};
    }

    .btn-default {
      background-color: white;
      color: rgba(0, 0, 0, 0.88);
      border-color: #d9d9d9;
    }

    .btn-default:hover {
      color: ${primaryHover};
      border-color: ${primaryHover};
    }

    .card {
      background: white;
      border-radius: 8px;
      border: 1px solid #f0f0f0;
      padding: 16px;
      box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.03);
    }

    input[type="text"] {
      padding: 4px 11px;
      font-size: 14px;
      line-height: 1.5715;
      border: 1px solid #d9d9d9;
      border-radius: 6px;
      transition: all 0.2s;
    }

    input[type="text"]:hover {
      border-color: ${primaryHover};
    }

    input[type="text"]:focus {
      border-color: ${primaryHover};
      outline: 0;
      box-shadow: 0 0 0 2px ${primary}1a;
    }`
  }

  /**
   * 获取交互脚本
   */
  private getInteractiveScripts(): string {
    return `    // 处理组件事件
    document.addEventListener('DOMContentLoaded', function() {
      // 查找所有有事件的元素
      const elements = document.querySelectorAll('[data-events]')

      elements.forEach(function(el) {
        try {
          const events = JSON.parse(el.getAttribute('data-events'))

          // 处理点击事件
          if (events.onClick) {
            el.addEventListener('click', function(e) {
              handleEvent(events.onClick)
            })
          }
        } catch (err) {
          console.error('事件解析失败:', err)
        }
      })

      // 事件处理函数
      function handleEvent(eventConfig) {
        const { actionType, actionConfig } = eventConfig

        switch (actionType) {
          case 'showMessage':
            if (actionConfig && actionConfig.content) {
              alert(actionConfig.content)
            }
            break

          case 'navigate':
            if (actionConfig && actionConfig.targetType === 'page' && actionConfig.pageId) {
              window.location.hash = actionConfig.pageId
            } else if (actionConfig && actionConfig.url) {
              if (actionConfig.openInNewTab) {
                window.open(actionConfig.url)
              } else {
                window.location.href = actionConfig.url
              }
            }
            break

          case 'callAPI':
            if (actionConfig && actionConfig.url) {
              fetch(actionConfig.url, { method: actionConfig.method || 'GET' })
            }
            break

          default:
            console.log('未知事件类型:', actionType)
        }

        if (Array.isArray(actionConfig.actions)) {
          actionConfig.actions.forEach(handleEvent)
        }
      }
    })`
  }

  /**
   * 压缩 HTML
   */
  private minify(html: string): string {
    return html
      .replace(/\n\s+/g, '\n')
      .replace(/\n+/g, '\n')
      .replace(/>\s+</g, '><')
      .trim()
  }

  private getStringProp(props: Record<string, unknown>, key: string): string | null {
    const value = props[key]
    return typeof value === 'string' ? value : null
  }

  private getNumberProp(props: Record<string, unknown>, key: string): number | null {
    const value = props[key]
    return typeof value === 'number' ? value : null
  }
}
