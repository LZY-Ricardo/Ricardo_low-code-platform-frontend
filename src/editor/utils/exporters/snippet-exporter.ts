import { BaseExporter } from './base-exporter'
import { ExportFormat, type ExportOptions } from './types'
import type { Component } from '@/editor/stores/components'
import { buildJsActionSnippets } from '../action-runtime'

export class SnippetExporter extends BaseExporter {
  format = ExportFormat.SNIPPET

  protected async generate(
    components: Component[],
    options: ExportOptions
  ): Promise<string> {
    const { snippetType = 'jsx' } = options

    if (snippetType === 'jsx') {
      return this.generateJSXSnippet(components)
    } else {
      return this.generateVueSnippet(components)
    }
  }

  private generateJSXSnippet(components: Component[]): string {
    return this.renderComponentsToJSX(components, 0)
  }

  private renderComponentsToJSX(components: Component[], indent: number): string {
    const indentStr = '  '.repeat(indent)
    
    return components.map(comp => {
      if (comp.name === 'Page') {
        return comp.children 
          ? this.renderComponentsToJSX(comp.children, indent)
          : ''
      }

      const { name, props, styles, children, events } = comp
      const tag = name === 'Container' ? 'div' : name

      const attrs: string[] = []
      
      if (styles && Object.keys(styles).length > 0) {
        const styleStr = JSON.stringify(styles)
        attrs.push(`style={${styleStr}}`)
      }

      if (props) {
        Object.entries(props).forEach(([key, value]) => {
          if (key === 'text') return
          if (typeof value === 'string') {
            attrs.push(`${key}="${this.escapeJSX(value)}"`)
          } else if (typeof value === 'boolean') {
            attrs.push(value ? key : '')
          } else {
            attrs.push(`${key}={${JSON.stringify(value)}}`)
          }
        })
      }

      if (events && events.onClick) {
        const { actionType, actionConfig } = events.onClick
        const snippets = buildJsActionSnippets(actionType, actionConfig, (text) => this.escapeJSX(text))
        if (snippets.length > 0) {
          attrs.push(`onClick={() => { ${snippets.join('; ')} }}`)
        }
      }

      const attrsStr = attrs.filter(a => a).length > 0 ? ' ' + attrs.filter(a => a).join(' ') : ''

      if (children && children.length > 0) {
        return `${indentStr}<${tag}${attrsStr}>
${this.renderComponentsToJSX(children, indent + 1)}
${indentStr}</${tag}>`
      } else {
        const text = typeof props?.text === 'string' ? props.text : null
        if (text) {
          return `${indentStr}<${tag}${attrsStr}>${this.escapeJSX(text)}</${tag}>`
        }
      }
      if (this.isSelfClosing(name)) {
        return `${indentStr}<${tag}${attrsStr} />`
      } else {
        return `${indentStr}<${tag}${attrsStr}></${tag}>`
      }
    }).join('\n')
  }

  private generateVueSnippet(components: Component[]): string {
    return this.renderComponentsToVue(components, 0)
  }

  private renderComponentsToVue(components: Component[], indent: number): string {
    const indentStr = '  '.repeat(indent)
    
    return components.map(comp => {
      if (comp.name === 'Page') {
        return comp.children 
          ? this.renderComponentsToVue(comp.children, indent)
          : ''
      }

      const { name, props, styles, children, events } = comp
      const tag = name === 'Container' ? 'div' : name

      const attrs: string[] = []
      
      if (styles && Object.keys(styles).length > 0) {
        const styleStr = this.styleObjectToString(styles as Record<string, unknown>)
        attrs.push(`:style="{ ${styleStr} }"`)
      }

      if (props) {
        Object.entries(props).forEach(([key, value]) => {
          if (key === 'text') return
          if (typeof value === 'string') {
            attrs.push(`${key}="${this.escapeHTML(value)}"`)
          } else {
            attrs.push(`:${key}="${JSON.stringify(value)}"`)
          }
        })
      }

      if (events && events.onClick) {
        const { actionType, actionConfig } = events.onClick
        const snippets = buildJsActionSnippets(actionType, actionConfig, (text) => this.escapeHTML(text))
        if (snippets.length > 0) {
          attrs.push(`@click="() => { ${snippets.join('; ')} }"`)
        }
      }

      const attrsStr = attrs.length > 0 ? ' ' + attrs.join(' ') : ''

      if (children && children.length > 0) {
        return `${indentStr}<${tag}${attrsStr}>
${this.renderComponentsToVue(children, indent + 1)}
${indentStr}</${tag}>`
      } else {
        const text = typeof props?.text === 'string' ? props.text : null
        if (text) {
          return `${indentStr}<${tag}${attrsStr}>${this.escapeHTML(text)}</${tag}>`
        }
      }
      if (this.isSelfClosing(name)) {
        return `${indentStr}<${tag}${attrsStr} />`
      } else {
        return `${indentStr}<${tag}${attrsStr}></${tag}>`
      }
    }).join('\n')
  }

  private isSelfClosing(componentName: string): boolean {
    return componentName === 'Input' || componentName === 'Image'
  }

  private styleObjectToString(styles: Record<string, unknown>): string {
    return Object.entries(styles)
      .map(([key, value]) => {
        const vueValue = typeof value === 'string' ? `'${value}'` : value
        return `${key}: ${vueValue}`
      })
      .join(', ')
  }

  private escapeJSX(text: string): string {
    return text
      .replace(/\\/g, '\\\\')
      .replace(/'/g, "\\'")
      .replace(/"/g, '\\"')
      .replace(/\n/g, '\\n')
  }

  private escapeHTML(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;')
  }
}
