import { useEffect } from 'react'
import { Form, Input, Select, InputNumber } from 'antd';
import { useComponentsStore } from '../../stores/components'
import { useComponentConfigStore } from '../../stores/component-config';
import type { ComponentSetter } from '../../stores/component-config';

export default function ComponentAttr() {
    const [form] = Form.useForm();
    const { curComponentId, curComponent, updateComponentProps } = useComponentsStore()
    const { componentConfig } = useComponentConfigStore()

    // 回显
    useEffect(() => {
        const data = form.getFieldsValue()
        form.setFieldsValue({ ...data, ...curComponent?.props })
    }, [curComponent, form])

    if (!curComponent || !curComponentId) {
        return (
            <div className="text-center text-text-secondary py-8">
                请先选择一个组件
            </div>
        )
    }

    function renderFormElement(setter: ComponentSetter) {
        const { type, options } = setter
        if (type === 'select') { // 下拉框
            return <Select options={options} />
        } else if (type === 'input') {
            return <Input />
        } else if (type === 'textarea') {
            return <Input.TextArea rows={4} />
        } else if (type === 'inputNumber') {
            return <InputNumber />
        }
        return null
    }




    const valueChange = (values: Record<string, unknown>) => {
        if (curComponentId) {
            updateComponentProps(curComponentId, values)
        }
    }

    return (
        <Form form={form} onValuesChange={valueChange} labelCol={{ span: 8 }} wrapperCol={{ span: 14 }}>
            <Form.Item label="组件id">
                <Input disabled value={curComponentId} />
            </Form.Item>

            <Form.Item label="组件名称">
                <Input disabled value={curComponent.name} />
            </Form.Item>

            <Form.Item label="组件描述">
                <Input disabled value={curComponent.desc} />
            </Form.Item>

            {/* 当前被选中的组件，允许修改的属性 */}
            {
                componentConfig[curComponent.name].setter?.map(setter => {
                    return (
                        <Form.Item name={setter.name} label={setter.label} key={setter.name}>
                            {renderFormElement(setter)}
                        </Form.Item>
                    )
                })
            }
        </Form>
    )
}
