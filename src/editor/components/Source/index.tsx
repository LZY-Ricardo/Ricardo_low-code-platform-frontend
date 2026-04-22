import { Button, Space, message } from 'antd'
import MonacoEditor from '@monaco-editor/react'
import { useEffect, useState } from 'react'
import { useComponentsStore } from '../../stores/components'
import { useProjectStore } from '../../stores/project'
import { useDataSourceStore } from '../../stores/data-source'
import { useRuntimeStateStore } from '../../stores/runtime-state'
import { useSharedStylesStore } from '../../stores/shared-styles'
import { useThemeStore } from '../../../stores/theme'
import { createEditorSchema, isEditorSchema } from '../../utils/schema'

export default function Source() {
  const components = useComponentsStore((state) => state.components)
  const setComponents = useComponentsStore((state) => state.setComponents)
  const activePageId = useProjectStore((state) => state.activePageId)
  const pages = useProjectStore((state) => state.pages)
  const dataSources = useDataSourceStore((state) => state.dataSources)
  const setDataSources = useDataSourceStore((state) => state.setDataSources)
  const setVariables = useRuntimeStateStore((state) => state.setVariables)
  const variables = useRuntimeStateStore((state) => state.variables)
  const setSharedStyles = useSharedStylesStore((state) => state.setSharedStyles)
  const sharedStyles = useSharedStylesStore((state) => state.sharedStyles)
  const currentThemeId = useThemeStore((state) => state.currentThemeId)
  const hydrateTheme = useThemeStore((state) => state.hydrateTheme)
  const [schemaText, setSchemaText] = useState('')

  useEffect(() => {
    setSchemaText(JSON.stringify(createEditorSchema({
      name: 'lowcode-project',
      pages,
      activePageId,
      dataSources,
      variables,
      sharedStyles,
      themeId: currentThemeId,
    }), null, 2))
  }, [activePageId, currentThemeId, dataSources, pages, sharedStyles, variables])

  const handleApplySchema = () => {
    try {
      const parsed = JSON.parse(schemaText)
      if (!isEditorSchema(parsed)) {
        message.error('Schema 结构不合法')
        return
      }

      useProjectStore.setState({
        pages: parsed.pages,
        activePageId: parsed.activePageId,
      })
      setDataSources(parsed.dataSources)
      setVariables(parsed.variables)
      setSharedStyles(parsed.sharedStyles)
      hydrateTheme(parsed.themeId)
      const activePage = parsed.pages.find((page) => page.id === parsed.activePageId) ?? parsed.pages[0]
      setComponents(activePage?.components ?? components)
      message.success('Schema 已应用')
    } catch {
      message.error('Schema JSON 解析失败')
    }
  }

  return (
    <div className="h-full flex flex-col gap-3">
      <Space>
        <Button onClick={handleApplySchema}>应用 Schema</Button>
      </Space>
      <div className="flex-1">
        <MonacoEditor
          height={'100%'}
          language="json"
          path='editor-schema.json'
          value={schemaText}
          onChange={(value) => setSchemaText(value ?? '')}
        />
      </div>
    </div>
  )
}
