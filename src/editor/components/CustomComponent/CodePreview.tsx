import { useMemo } from 'react'
import { buildMarketRuntimeHtml } from '../../materials/MarketRuntime/runtime-html'

interface CodePreviewProps {
  code: string
  props: Record<string, unknown>
}

export default function CodePreview({ code, props }: CodePreviewProps) {
  const srcDoc = useMemo(() => {
    if (!code.trim()) return ''
    return buildMarketRuntimeHtml(code, props)
  }, [code, props])

  if (!code.trim()) {
    return (
      <div className="flex h-32 items-center justify-center rounded border border-dashed border-border-light bg-bg-primary text-sm text-text-secondary">
        输入代码后预览
      </div>
    )
  }

  return (
    <iframe
      title="component-preview"
      srcDoc={srcDoc}
      sandbox="allow-scripts"
      className="h-40 w-full rounded border border-border-light bg-bg-secondary"
    />
  )
}
