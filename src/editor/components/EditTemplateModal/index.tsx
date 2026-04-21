import { useEffect } from 'react';
import { Modal, Input, Select, Form, message } from 'antd';
import { useTemplateStore } from '../../../stores/template';
import type { TemplateItem } from '../../../api/templates';
import { CATEGORY_LABELS } from '../../../api/templates';

interface EditTemplateModalProps {
  open: boolean;
  template: TemplateItem | null;
  onCancel: () => void;
  onSuccess?: () => void;
}

export default function EditTemplateModal({
  open,
  template,
  onCancel,
  onSuccess,
}: EditTemplateModalProps) {
  const [form] = Form.useForm();
  const updateTemplate = useTemplateStore((s) => s.updateTemplate);

  useEffect(() => {
    if (open && template) {
      form.setFieldsValue({
        name: template.name,
        description: template.description,
        category: template.category,
      });
    }
  }, [open, template, form]);

  const handleOk = async () => {
    if (!template) return;
    try {
      const values = await form.validateFields();
      await updateTemplate(template.id, {
        name: values.name,
        description: values.description,
        category: values.category,
      });
      message.success('模板更新成功');
      form.resetFields();
      onSuccess?.();
    } catch (err: any) {
      if (err?.errorFields) return;
      message.error(err?.message || '模板更新失败');
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title="编辑模板信息"
      open={open}
      onOk={handleOk}
      onCancel={handleCancel}
      okText="保存"
      cancelText="取消"
    >
      <Form form={form} layout="vertical">
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
      </Form>
    </Modal>
  );
}
