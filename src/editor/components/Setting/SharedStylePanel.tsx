import { Button, Card, Input, Select, Space, Typography } from 'antd'
import { useMemo, useState } from 'react'
import { useComponentsStore } from '../../stores/components'
import { useSharedStylesStore } from '../../stores/shared-styles'

const { Text } = Typography

export default function SharedStylePanel() {
  const { curComponent, curComponentId, updateComponentSharedStyle } = useComponentsStore()
  const { addSharedStyle, removeSharedStyle, sharedStyles } = useSharedStylesStore()
  const [styleName, setStyleName] = useState('')

  const options = useMemo(() => sharedStyles.map((item) => ({
    label: item.name,
    value: item.id,
  })), [sharedStyles])

  if (!curComponent || !curComponentId) {
    return null
  }

  const handleSaveCurrentStyle = () => {
    const name = styleName.trim() || `${curComponent.desc}样式`
    const shared = addSharedStyle(name, curComponent.styles ?? {})
    updateComponentSharedStyle(curComponentId, shared.id)
    setStyleName('')
  }

  return (
    <Card size="small" title="共享样式">
      <div className="space-y-3">
        <Select
          allowClear
          value={curComponent.sharedStyleId}
          onChange={(value) => updateComponentSharedStyle(curComponentId, value)}
          placeholder="选择共享样式"
          options={options}
        />
        <Space.Compact className="w-full">
          <Input
            value={styleName}
            onChange={(e) => setStyleName(e.target.value)}
            placeholder="样式名称"
          />
          <Button onClick={handleSaveCurrentStyle}>保存当前样式</Button>
        </Space.Compact>
        {sharedStyles.length > 0 ? (
          <div className="space-y-2">
            {sharedStyles.map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded border border-border-light px-3 py-2">
                <div>
                  <div className="text-sm font-medium text-text-primary">{item.name}</div>
                  <div className="text-xs text-text-secondary">{Object.keys(item.styles).length} 个样式属性</div>
                </div>
                <Button danger type="text" onClick={() => removeSharedStyle(item.id)}>
                  删除
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <Text type="secondary">暂无共享样式。</Text>
        )}
      </div>
    </Card>
  )
}
