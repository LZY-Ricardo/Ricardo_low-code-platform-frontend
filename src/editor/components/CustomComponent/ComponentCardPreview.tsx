import { useMemo } from 'react'
import { buildMarketRuntimeHtml } from '../../materials/MarketRuntime/runtime-html'

interface ComponentCardPreviewProps {
  code: string
  defaultProps: Record<string, unknown>
}

export default function ComponentCardPreview({ code, defaultProps }: ComponentCardPreviewProps) {
  const srcDoc = useMemo(() => {
    if (!code?.trim()) return ''
    return buildMarketRuntimeHtml(code, defaultProps || {})
  }, [code, defaultProps])

  if (!code?.trim()) {
    return (
      <div className="flex h-28 items-center justify-center rounded bg-bg-primary text-xs text-text-secondary/60">
        暂无预览
      </div>
    )
  }

  return (
    <div className="h-28 overflow-hidden rounded bg-bg-secondary">
      <iframe
        title="component-preview"
        srcDoc={srcDoc}
        sandbox="allow-scripts"
        className="h-full w-full border-0"
        style={{ pointerEvents: 'none' }}
      />
    </div>
  )
}
