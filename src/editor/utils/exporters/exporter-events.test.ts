import { describe, expect, it } from 'vitest'
import type { Component } from '@/editor/stores/components'
import { HTMLExporter } from './html-exporter'
import { ReactExporter } from './react-exporter'
import { SnippetExporter } from './snippet-exporter'
import { VueExporter } from './vue-exporter'

const components: Component[] = [
  {
    id: 1,
    name: 'Page',
    props: {},
    desc: '页面',
    children: [
      {
        id: 2,
        name: 'Button',
        props: {
          text: '跳转',
        },
        desc: '按钮',
        events: {
          onClick: {
            eventType: 'onClick',
            actionType: 'navigate',
            actionConfig: {
              url: 'https://example.com',
              openInNewTab: true,
            },
          },
        },
      },
    ],
  },
]

describe('exporter event protocol', () => {
  it('uses navigate in HTML interactive scripts', () => {
    const script = (new HTMLExporter() as unknown as { getInteractiveScripts: () => string }).getInteractiveScripts()
    expect(script).toContain("case 'navigate'")
    expect(script).not.toContain("case 'goToUrl'")
  })

  it('maps openInNewTab to _blank in React export', () => {
    const jsx = (new ReactExporter() as unknown as { renderComponentsToJSX: (components: Component[], indent: number) => string })
      .renderComponentsToJSX(components, 0)

    expect(jsx).toContain("window.open('https://example.com', '_blank')")
  })

  it('maps openInNewTab to _blank in snippet export', () => {
    const jsx = (new SnippetExporter() as unknown as { renderComponentsToJSX: (components: Component[], indent: number) => string })
      .renderComponentsToJSX(components, 0)
    const vue = (new SnippetExporter() as unknown as { renderComponentsToVue: (components: Component[], indent: number) => string })
      .renderComponentsToVue(components, 0)

    expect(jsx).toContain("window.open('https://example.com', '_blank')")
    expect(vue).toContain("window.open('https://example.com', '_blank')")
  })

  it('maps openInNewTab to _blank in Vue export', () => {
    const template = (new VueExporter() as unknown as { renderComponentsToTemplate: (components: Component[], indent: number) => string })
      .renderComponentsToTemplate(components, 0)

    expect(template).toContain("window.open('https://example.com', '_blank')")
  })

  it('supports internal page navigation and chained actions in HTML scripts', () => {
    const script = (new HTMLExporter() as unknown as { getInteractiveScripts: () => string }).getInteractiveScripts()
    expect(script).toContain("actionConfig.targetType === 'page'")
    expect(script).toContain('actionConfig.actions')
  })
})
