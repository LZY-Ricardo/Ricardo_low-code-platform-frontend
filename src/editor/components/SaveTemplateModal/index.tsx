import { useState } from 'react';
import { Modal, Input, Select, Form, message } from 'antd';
import { useTemplateStore } from '../../../stores/template';
import { CATEGORY_LABELS } from '../../../api/templates';
import type { Component } from '../../stores/components';
import type { EditorPage } from '../../utils/page-model';
import type { DataSource } from '../../stores/data-source';
import type { SharedStyleDefinition } from '../../stores/shared-styles';

interface SaveTemplateModalProps {
  open: boolean;
  onCancel: () => void;
  onSuccess?: () => void;
  defaultName?: string;
  components: Component[];
  pages: EditorPage[];
  dataSources: DataSource[];
  variables: Record<string, unknown>;
  sharedStyles: SharedStyleDefinition[];
  themeId: string | null;
  thumbnail?: string | null;
}

export default function SaveTemplateModal({
  open,
  onCancel,
  onSuccess,
  defaultName = '',
  components,
  pages,
  dataSources,
  variables,
  sharedStyles,
  themeId,
  thumbnail,
}: SaveTemplateModalProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const createTemplate = useTemplateStore((s) => s.createTemplate);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      await createTemplate({
        name: values.name,
        description: values.description || '',
        category: values.category || 'general',
        thumbnail: thumbnail || undefined,
        components,
        pages,
        dataSources,
        variables,
        sharedStyles,
        themeId,
      });

      message.success('模板保存成功');
      form.resetFields();
      onSuccess?.();
    } catch (err: any) {
      if (err?.errorFields) return; // 表单验证错误
      message.error(err?.message || '模板保存失败');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title="保存为模板"
      open={open}
      onOk={handleOk}
      onCancel={handleCancel}
      okText="保存模板"
      cancelText="取消"
      confirmLoading={loading}
      width={480}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          name: defaultName,
          description: '',
          category: 'general',
        }}
      >
        <Form.Item
          name="name"
          label="模板名称"
          rules={[{ required: true, message: '请输入模板名称' }]}
        >
          <Input placeholder="请输入模板名称" maxLength={100} />
        </Form.Item>

        <Form.Item name="description" label="模板描述">
          <Input.TextArea
            placeholder="请输入模板描述（可选）"
            maxLength={500}
            rows={3}
          />
        </Form.Item>

        <Form.Item name="category" label="模板分类">
          <Select
            options={Object.entries(CATEGORY_LABELS).map(([value, label]) => ({
              value,
              label,
            }))}
          />
        </Form.Item>

        {thumbnail && (
          <Form.Item label="缩略图预览">
            <img
              src={thumbnail}
              alt="模板缩略图"
              className="max-w-full h-32 object-contain border rounded"
            />
          </Form.Item>
        )}
      </Form>
    </Modal>
  );
}
