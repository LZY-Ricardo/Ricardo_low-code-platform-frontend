import { useEffect } from 'react'
import { Card, Form, Input, Typography } from 'antd'
import { useComponentsStore } from '../../stores/components'
import { useComponentConfigStore } from '../../stores/component-config'
import { useDataSourceStore } from '../../stores/data-source'
import { filterBindingValues } from './data-binding-form'

const { Text } = Typography

export default function DataBindingPanel() {
  const [form] = Form.useForm()
  const curComponent = useComponentsStore((state) => state.curComponent)
  const curComponentId = useComponentsStore((state) => state.curComponentId)
  const updateComponentBindings = useComponentsStore((state) => state.updateComponentBindings)
  const componentConfig = useComponentConfigStore((state) => state.componentConfig)
  const dataSources = useDataSourceStore((state) => state.dataSources)

  useEffect(() => {
    form.resetFields()
    form.setFieldsValue(curComponent?.bindings ?? {})
  }, [curComponent, form])

  if (!curComponent || !curComponentId) {
    return (
      <Card size="small" title="数据绑定">
        <Text type="secondary">请选择一个组件后配置绑定。</Text>
      </Card>
    )
  }

  const bindableProps = componentConfig[curComponent.name]?.bindableProps ?? []
  if (bindableProps.length === 0) {
    return (
      <Card size="small" title="数据绑定">
        <Text type="secondary">该组件暂不支持数据绑定。</Text>
      </Card>
    )
  }

  const handleValuesChange = (_: unknown, values: Record<string, string>) => {
    const nextBindings = filterBindingValues(values, bindableProps)
    updateComponentBindings(curComponentId, nextBindings)
  }

  return (
    <Card size="small" title="数据绑定">
      <div className="mb-3 space-y-1">
        <Text type="secondary">支持直接路径或模板：</Text>
        <div className="text-xs text-text-muted">`variables.keyword`</div>
        {dataSources.map((item) => (
          <div key={item.id} className="text-xs text-text-muted">{`requestResults.${item.resultKey}`}</div>
        ))}
      </div>
      <Form form={form} layout="vertical" onValuesChange={handleValuesChange}>
        {bindableProps.map((prop: string) => (
          <Form.Item key={prop} label={prop} name={prop}>
            <Input placeholder={`例如：variables.keyword 或 {{variables.keyword}}`} />
          </Form.Item>
        ))}
      </Form>
    </Card>
  )
}
