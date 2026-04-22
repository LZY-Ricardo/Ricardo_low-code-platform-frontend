import { useCallback, useEffect, useRef, useState } from 'react'
import { App, Form, Input, Modal } from 'antd'
import { useCustomComponentStore } from '../../stores/custom-component'
import { useComponentConfigStore } from '../../stores/component-config'
import CodePreview from './CodePreview'

interface CreateCustomComponentModalProps {
  open: boolean
  onCancel: () => void
  onSuccess: () => void
  editId?: string | null
}

interface FormValues {
  name: string
  displayName: string
  description: string
  code: string
  defaultPropsText: string
  setterConfigText: string
}

export default function CreateCustomComponentModal({
  open,
  onCancel,
  onSuccess,
  editId,
}: CreateCustomComponentModalProps) {
  const { message } = App.useApp()
  const [form] = Form.useForm<FormValues>()
  const [loading, setLoading] = useState(false)
  const [previewCode, setPreviewCode] = useState('')
  const [previewProps, setPreviewProps] = useState<Record<string, unknown>>({})
  const customComponentStore = useCustomComponentStore()
  const componentConfigStore = useComponentConfigStore()
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const isEdit = !!editId
  const editDef = isEdit ? customComponentStore.getById(editId!) : null
  const isEditingMarketComponent = editDef?.source === 'market'

  // Debounced preview update
  const schedulePreview = useCallback((code: string, propsText: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setPreviewCode(code)
      try { setPreviewProps(JSON.parse(propsText || '{}')) } catch { /* ignore */ }
    }, 500)
  }, [])

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  const handleOpen = (visible: boolean) => {
    if (visible && isEdit && editDef) {
      form.setFieldsValue({
        name: editDef.name,
        displayName: editDef.displayName,
        description: editDef.description,
        code: editDef.code,
        defaultPropsText: JSON.stringify(editDef.defaultProps, null, 2),
        setterConfigText: JSON.stringify(editDef.setterConfig, null, 2),
      })
      setPreviewCode(editDef.code)
      setPreviewProps(editDef.defaultProps)
    } else if (visible) {
      form.resetFields()
      setPreviewCode('')
      setPreviewProps({})
    }
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()

      // Check name collision
      const configName = `Custom_${values.name}`
      const hasUserNameConflict = customComponentStore.components.some(
        (component) =>
          component.id !== editId &&
          component.source === 'user' &&
          component.name === values.name,
      )

      if ((!isEdit && componentConfigStore.componentConfig[configName]) || hasUserNameConflict) {
        message.error('组件标识已存在')
        return
      }

      let defaultProps: Record<string, unknown> = {}
      try {
        defaultProps = JSON.parse(values.defaultPropsText || '{}')
      } catch {
        message.error('默认属性不是合法 JSON')
        return
      }

      let setterConfig: Array<Record<string, unknown>> = []
      try {
        setterConfig = JSON.parse(values.setterConfigText || '[]')
      } catch {
        message.error('属性面板配置不是合法 JSON')
        return
      }

      setLoading(true)

      if (isEdit) {
        const payload = {
          displayName: values.displayName,
          description: values.description,
          code: values.code,
          defaultProps,
          setterConfig,
        }
        const result = isEditingMarketComponent
          ? customComponentStore.promoteMarketToUser(editId!, payload)
          : customComponentStore.update(editId!, payload)
        if (!result) {
          message.error('保存失败，存储空间不足')
          return
        }
        message.success(isEditingMarketComponent ? '市场组件已转为自定义组件' : '组件已更新')
      } else {
        const result = customComponentStore.create({
          name: values.name,
          displayName: values.displayName,
          description: values.description,
          code: values.code,
          defaultProps,
          setterConfig,
        })
        if (!result) {
          message.error('创建失败，存储空间不足')
          return
        }
        message.success('组件已创建')
      }

      onSuccess()
    } catch {
      // form validation error
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      title={isEdit ? (isEditingMarketComponent ? '编辑市场组件' : '编辑自定义组件') : '创建自定义组件'}
      open={open}
      onCancel={onCancel}
      afterOpenChange={handleOpen}
      width={720}
      confirmLoading={loading}
      onOk={handleSubmit}
      okText={isEdit ? '保存' : '创建'}
      destroyOnClose
    >
      <Form form={form} layout="vertical" className="mt-4">
        <div className="grid grid-cols-2 gap-4">
          <Form.Item
            name="name"
            label="组件标识"
            rules={[
              { required: true, message: '请输入组件标识' },
              { pattern: /^[A-Za-z][A-Za-z0-9_]*$/, message: '字母开头，仅字母数字下划线' },
            ]}
          >
            <Input placeholder="MyButton" disabled={isEdit} />
          </Form.Item>
          <Form.Item
            name="displayName"
            label="展示名称"
            rules={[{ required: true, message: '请输入展示名称' }]}
          >
            <Input placeholder="我的按钮" />
          </Form.Item>
        </div>

        <Form.Item name="description" label="描述">
          <Input.TextArea rows={2} placeholder="一句话概括组件能力" />
        </Form.Item>

        <Form.Item
          name="code"
          label="组件代码"
          rules={[{ required: true, message: '请输入组件代码' }]}
          extra={
            <div className="mt-1">
              <button
                type="button"
                className="text-xs text-accent hover:text-accent-hover"
                onClick={() => {
                  const code = form.getFieldValue('code') || ''
                  const propsText = form.getFieldValue('defaultPropsText') || '{}'
                  setPreviewCode(code)
                  try { setPreviewProps(JSON.parse(propsText)) } catch { /* ignore */ }
                }}
              >
                刷新预览
              </button>
            </div>
          }
        >
          <Input.TextArea
            rows={10}
            className="font-mono text-xs"
            placeholder={'export default function Component(props) {\n  return <div>{props.text}</div>\n}'}
            onChange={(e) => {
              const code = e.target.value
              const propsText = form.getFieldValue('defaultPropsText') || '{}'
              schedulePreview(code, propsText)
            }}
          />
        </Form.Item>

        <div className="mb-4">
          <div className="mb-1 text-xs text-text-secondary">预览</div>
          <CodePreview code={previewCode} props={previewProps} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Form.Item
            name="defaultPropsText"
            label="默认属性 JSON"
            initialValue="{}"
          >
            <Input.TextArea rows={4} className="font-mono text-xs" />
          </Form.Item>
          <Form.Item
            name="setterConfigText"
            label="属性面板配置 JSON"
            initialValue="[]"
          >
            <Input.TextArea rows={4} className="font-mono text-xs" />
          </Form.Item>
        </div>
      </Form>
    </Modal>
  )
}
