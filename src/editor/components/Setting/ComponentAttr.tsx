import { useEffect, useState } from 'react'
import { Form, Input, Select, InputNumber, Button, Modal, Space } from 'antd';
import { useComponentsStore } from '../../stores/components'
import { useComponentConfigStore } from '../../stores/component-config';
import type { ComponentSetter } from '../../stores/component-config';
import AssetPanel from '../AssetPanel';
import type { FileAsset } from '../../../api/files';
import { resolveAssetUrl } from '../../../api/files';
import { useProjectStore } from '../../stores/project';

export default function ComponentAttr() {
    const [form] = Form.useForm();
    const curComponentId = useComponentsStore((state) => state.curComponentId)
    const curComponent = useComponentsStore((state) => state.curComponent)
    const updateComponentProps = useComponentsStore((state) => state.updateComponentProps)
    const currentProject = useProjectStore((state) => state.currentProject)
    const componentConfig = useComponentConfigStore((state) => state.componentConfig)
    const [assetModalOpen, setAssetModalOpen] = useState(false)

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

    function handleSelectAsset(asset: FileAsset) {
        const nextSrc = resolveAssetUrl(asset.url)
        form.setFieldValue('src', nextSrc)
        if (curComponentId) {
            updateComponentProps(curComponentId, { src: nextSrc, alt: asset.originalName })
        }
        setAssetModalOpen(false)
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
                componentConfig[curComponent.name].setter?.map((setter: ComponentSetter) => {
                    const isImageSrcSetter = curComponent.name === 'Image' && setter.name === 'src'
                    return (
                        <Form.Item name={setter.name} label={setter.label} key={setter.name}>
                            {isImageSrcSetter ? (
                                <Space.Compact style={{ width: '100%' }}>
                                    <Input />
                                    <Button onClick={() => setAssetModalOpen(true)}>
                                        资源库选择
                                    </Button>
                                </Space.Compact>
                            ) : renderFormElement(setter)}
                        </Form.Item>
                    )
                })
            }

            <Modal
                title="选择资源"
                open={assetModalOpen}
                onCancel={() => setAssetModalOpen(false)}
                footer={null}
                width={720}
                destroyOnHidden
            >
                <div className="h-[70vh]">
                    <AssetPanel
                        selectable
                        projectId={currentProject?.id}
                        onSelect={handleSelectAsset}
                    />
                </div>
            </Modal>
        </Form>
    )
}
