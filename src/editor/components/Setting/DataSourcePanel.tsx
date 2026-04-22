import { Button, Card, Form, Input, Select, Typography, message } from 'antd'
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons'
import { useEffect } from 'react'
import { useDataSourceStore } from '../../stores/data-source'
import { useRuntimeStateStore } from '../../stores/runtime-state'
import { executeDataSourceRequest } from '../../utils/request'

const { Text } = Typography

export default function DataSourcePanel() {
  const [form] = Form.useForm()
  const dataSources = useDataSourceStore((state) => state.dataSources)
  const activeDataSourceId = useDataSourceStore((state) => state.activeDataSourceId)
  const addDataSource = useDataSourceStore((state) => state.addDataSource)
  const updateDataSource = useDataSourceStore((state) => state.updateDataSource)
  const removeDataSource = useDataSourceStore((state) => state.removeDataSource)
  const setActiveDataSourceId = useDataSourceStore((state) => state.setActiveDataSourceId)
  const setRequestResult = useRuntimeStateStore((state) => state.setRequestResult)
  const [messageApi, contextHolder] = message.useMessage()

  const activeDataSource = dataSources.find((item) => item.id === activeDataSourceId) ?? null

  useEffect(() => {
    if (!activeDataSource) {
      form.resetFields()
      return
    }

    form.setFieldsValue(activeDataSource)
  }, [activeDataSource, form])

  const handleAdd = () => {
    addDataSource({
      name: `数据源 ${dataSources.length + 1}`,
      resultKey: `result${dataSources.length + 1}`,
      method: 'GET',
      url: '/api/example',
      headersText: '{\n  "Authorization": "Bearer token"\n}',
      paramsText: '{\n  "page": 1\n}',
    })
  }

  const handleValuesChange = (changedValues: Record<string, unknown>) => {
    if (!activeDataSourceId) {
      return
    }

    updateDataSource(activeDataSourceId, changedValues)
  }

  const handleExecute = async () => {
    if (!activeDataSource) {
      return
    }

    try {
      const result = await executeDataSourceRequest(activeDataSource)
      setRequestResult(activeDataSource.resultKey, result)
      messageApi.success(`已写入 requestResults.${activeDataSource.resultKey}`)
    } catch (error) {
      messageApi.error(error instanceof Error ? error.message : '请求失败')
    }
  }

  return (
    <div className="space-y-4">
      {contextHolder}
      <div className="flex items-center justify-between">
        <Text type="secondary">配置 REST API 数据源</Text>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          新增
        </Button>
      </div>

      {dataSources.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {dataSources.map((item) => (
            <Button
              key={item.id}
              type={item.id === activeDataSourceId ? 'primary' : 'default'}
              onClick={() => setActiveDataSourceId(item.id)}
            >
              {item.name}
            </Button>
          ))}
        </div>
      ) : (
        <Card size="small">
          <Text type="secondary">暂无数据源，先创建一个接口配置。</Text>
        </Card>
      )}

      {activeDataSource ? (
        <Card
          size="small"
          title={activeDataSource.name}
          extra={
            <div className="flex items-center gap-2">
              <Button size="small" onClick={handleExecute}>执行</Button>
              <Button
                danger
                type="text"
                icon={<DeleteOutlined />}
                onClick={() => removeDataSource(activeDataSource.id)}
              />
            </div>
          }
        >
          <Form
            layout="vertical"
            form={form}
            onValuesChange={(_, values) => handleValuesChange(values as Record<string, unknown>)}
          >
            <Form.Item label="名称" name="name">
              <Input />
            </Form.Item>
            <Form.Item label="结果键" name="resultKey">
              <Input placeholder="例如：userList" />
            </Form.Item>
            <Form.Item label="请求方法" name="method">
              <Select
                options={[
                  { label: 'GET', value: 'GET' },
                  { label: 'POST', value: 'POST' },
                  { label: 'PUT', value: 'PUT' },
                  { label: 'DELETE', value: 'DELETE' },
                ]}
              />
            </Form.Item>
            <Form.Item label="请求地址" name="url">
              <Input />
            </Form.Item>
            <Form.Item label="Headers JSON" name="headersText">
              <Input.TextArea rows={4} />
            </Form.Item>
            <Form.Item label="Params JSON" name="paramsText">
              <Input.TextArea rows={4} />
            </Form.Item>
          </Form>
        </Card>
      ) : null}
    </div>
  )
}
