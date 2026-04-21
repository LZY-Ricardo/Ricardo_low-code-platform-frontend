import { BaseExporter } from './base-exporter'
import { ExportFormat, type ExportOptions } from './types'
import type { Component } from '@/editor/stores/components'
import { createEditorSchema } from '../schema'
import { useProjectStore } from '../../stores/project'
import { useDataSourceStore } from '../../stores/data-source'
import { useRuntimeStateStore } from '../../stores/runtime-state'
import { useSharedStylesStore } from '../../stores/shared-styles'
import { useThemeStore } from '../../../stores/theme'

/**
 * JSON 配置导出器
 * 将组件树导出为 JSON 配置文件
 */
export class JSONExporter extends BaseExporter {
  format = ExportFormat.JSON

  protected async generate(
    components: Component[],
    options: ExportOptions
  ): Promise<string> {
    const data = this.prepare(components, options)
    const projectStore = useProjectStore.getState()
    const dataSources = useDataSourceStore.getState().dataSources
    const variables = useRuntimeStateStore.getState().variables
    const sharedStyles = useSharedStylesStore.getState().sharedStyles
    const themeId = useThemeStore.getState().currentThemeId

    // 构建导出数据
    const exportData = createEditorSchema({
      name: data.projectName,
      pages: projectStore.pages.length > 0 ? projectStore.pages : [{ id: 'page_1', name: '页面 1', components: this.sanitizeComponents(components) }],
      activePageId: projectStore.activePageId,
      dataSources,
      variables,
      sharedStyles,
      themeId,
    })

    // 格式化 JSON
    const indent = options.indentType === 'tab'
      ? '\t'
      : ' '.repeat(options.indentSize || 2)

    return JSON.stringify(exportData, null, indent)
  }

  /**
   * 清理组件数据（移除循环引用等）
   */
  private sanitizeComponents(components: Component[]): Component[] {
    // 使用 JSON 序列化/反序列化来深拷贝并移除函数等不可序列化的内容
    return JSON.parse(JSON.stringify(components))
  }
}
