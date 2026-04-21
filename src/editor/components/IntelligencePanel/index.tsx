import { Button, Card, Empty, Input, List, Typography, message } from 'antd'
import { useMemo, useState } from 'react'
import { useComponentsStore } from '../../stores/components'
import { analyzePageSuggestions } from '../../utils/insights'
import { findReusableStructures } from '../../utils/reuse-detector'
import { generateComponentsFromPrompt } from '../../utils/ai-generator'
import { saveTemplate } from '../../utils/template-storage'
import { useDataSourceStore } from '../../stores/data-source'
import { useRuntimeStateStore } from '../../stores/runtime-state'
import { useSharedStylesStore } from '../../stores/shared-styles'
import { useThemeStore } from '../../../stores/theme'
import { useProjectStore } from '../../stores/project'
import { buildTemplatePageFromSubtree } from '../../utils/reusable-template'

const { Text } = Typography

export default function IntelligencePanel() {
  const [prompt, setPrompt] = useState('')
  const { components, setComponents } = useComponentsStore()
  const { dataSources } = useDataSourceStore()
  const { variables } = useRuntimeStateStore()
  const { sharedStyles } = useSharedStylesStore()
  const { currentThemeId } = useThemeStore()
  const { currentProject } = useProjectStore()

  const suggestions = useMemo(() => analyzePageSuggestions(components), [components])
  const reusableItems = useMemo(() => findReusableStructures(components), [components])

  const handleGenerate = () => {
    if (!prompt.trim()) {
      message.warning('请输入页面描述')
      return
    }

    const generated = generateComponentsFromPrompt(prompt)
    setComponents(generated)
    message.success('已生成页面骨架')
  }

  const handleSaveReusable = (index: number) => {
    const item = reusableItems[index]
    if (!item || !currentProject) {
      return
    }

    saveTemplate({
      id: `tpl_reuse_${Date.now()}`,
      name: `${currentProject.name} 复用片段 ${index + 1}`,
      description: '由重复结构自动提取',
      components: buildTemplatePageFromSubtree(item.sample),
      pages: [{
        id: `page_tpl_${Date.now()}`,
        name: '页面 1',
        components: buildTemplatePageFromSubtree(item.sample),
      }],
      dataSources,
      variables,
      sharedStyles,
      themeId: currentThemeId,
      builtIn: false,
    })
    message.success('已提取为模板')
  }

  return (
    <div className="space-y-4">
      <Card size="small" title="AI 页面骨架生成">
        <div className="space-y-3">
          <Input.TextArea
            rows={4}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="例如：生成一个运营数据看板 / 生成一个活动报名表单"
          />
          <Button type="primary" onClick={handleGenerate}>
            生成到当前页面
          </Button>
        </div>
      </Card>

      <Card size="small" title="页面优化建议">
        {suggestions.length > 0 ? (
          <List
            dataSource={suggestions}
            renderItem={(item) => (
              <List.Item>
                <div>
                  <div className="font-medium text-text-primary">{item.title}</div>
                  <div className="text-sm text-text-secondary">{item.description}</div>
                </div>
              </List.Item>
            )}
          />
        ) : (
          <Empty description="当前页面没有明显问题" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        )}
      </Card>

      <Card size="small" title="复用结构识别">
        {reusableItems.length > 0 ? (
          <List
            dataSource={reusableItems}
            renderItem={(item, index) => (
              <List.Item
                actions={[
                  <Button key="save" type="link" onClick={() => handleSaveReusable(index)}>
                    提取为模板
                  </Button>,
                ]}
              >
                <div>
                  <div className="font-medium text-text-primary">{item.sample.name}</div>
                  <Text type="secondary">{`重复出现 ${item.occurrenceIds.length} 次`}</Text>
                </div>
              </List.Item>
            )}
          />
        ) : (
          <Empty description="未发现可复用结构" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        )}
      </Card>
    </div>
  )
}
