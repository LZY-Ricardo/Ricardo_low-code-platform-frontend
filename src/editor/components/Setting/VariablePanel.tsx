import { Button, Card, Input, Space, Typography } from 'antd'
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons'
import { useRuntimeStateStore } from '../../stores/runtime-state'

const { Text } = Typography

export default function VariablePanel() {
  const { variables, removeVariable, setVariable } = useRuntimeStateStore()
  const entries = Object.entries(variables)

  const handleAdd = () => {
    const key = `var_${entries.length + 1}`
    setVariable(key, '')
  }

  return (
    <Card
      size="small"
      title="页面变量"
      extra={
        <Button type="primary" size="small" icon={<PlusOutlined />} onClick={handleAdd}>
          新增
        </Button>
      }
    >
      {entries.length === 0 ? (
        <Text type="secondary">暂无变量，创建后可在绑定中使用 `variables.xxx`。</Text>
      ) : (
        <div className="space-y-3">
          {entries.map(([key, value]) => (
            <Space key={key} align="start" className="w-full">
              <Input value={key} disabled className="w-36" />
              <Input
                value={typeof value === 'string' ? value : JSON.stringify(value)}
                onChange={(e) => setVariable(key, e.target.value)}
                placeholder="变量值"
              />
              <Button
                danger
                type="text"
                icon={<DeleteOutlined />}
                onClick={() => removeVariable(key)}
              />
            </Space>
          ))}
        </div>
      )}
    </Card>
  )
}
