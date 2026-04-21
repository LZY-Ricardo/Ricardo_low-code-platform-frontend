import type { Component } from '@/editor/stores/components'

/**
 * 导出格式枚举
 */
export const ExportFormat = {
  JSON: 'json',
  HTML: 'html',
  REACT: 'react',
  VUE: 'vue',
  SNIPPET: 'snippet',
} as const

export type ExportFormat = typeof ExportFormat[keyof typeof ExportFormat]

/**
 * 导出选项
 */
export interface ExportOptions {
  // 通用选项
  projectName: string
  format: ExportFormat
  includeComments?: boolean
  indentSize?: 2 | 4
  indentType?: 'space' | 'tab'

  // HTML 特有选项
  minifyHTML?: boolean
  inlineCSS?: boolean
  includeAntdCDN?: boolean

  // 项目导出特有选项 (Phase 2)
  packageManager?: 'npm' | 'pnpm' | 'yarn'
  includeTypeScript?: boolean
  includeESLint?: boolean
  includePrettier?: boolean

  // 代码片段选项 (Phase 3)
  snippetType?: 'jsx' | 'vue'
  schemaData?: unknown

  // 主题颜色
  themeColors?: {
    primary: string
    primaryHover: string
  }
}

/**
 * 导出结果
 */
export interface ExportResult {
  success: boolean
  format: ExportFormat
  fileName: string
  fileSize?: number
  message?: string
  error?: Error
}

/**
 * 导出器接口
 */
export interface IExporter {
  format: ExportFormat
  validate(components: Component[]): boolean
  export(components: Component[], options: ExportOptions): Promise<ExportResult>
}
