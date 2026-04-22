import { useMemo, useState } from 'react';
import { Form, Input, Modal, Select, message } from 'antd';
import { useMarketTemplateStore } from '../stores/market-template';
import { buildMarketTemplatePayload } from '../features/market-templates/utils/build-market-template-payload';
import { CATEGORY_LABELS, type TemplateCategory } from '../api/templates';
import type { MarketTemplateSource } from '../features/market-templates/utils/load-project-market-template-source';
import type { MarketTemplateItem } from '../api/market';

interface MarketTemplateModalProps {
  open: boolean;
  defaultName?: string;
  thumbnail?: string | null;
  source: MarketTemplateSource | null;
  mode?: 'create' | 'edit';
  template?: MarketTemplateItem | null;
  onCancel: () => void;
  onSuccess?: () => void;
}

interface MarketTemplateFormValues {
  name: string;
  description?: string;
  category?: TemplateCategory;
  tags?: string[];
}

export default function MarketTemplateModal({
  open,
  defaultName = '',
  thumbnail,
  source,
  mode = 'create',
  template = null,
  onCancel,
  onSuccess,
}: MarketTemplateModalProps) {
  const [form] = Form.useForm<MarketTemplateFormValues>();
  const createTemplate = useMarketTemplateStore((state: ReturnType<typeof useMarketTemplateStore.getState>) => state.createTemplate);
  const updateTemplate = useMarketTemplateStore((state: ReturnType<typeof useMarketTemplateStore.getState>) => state.updateTemplate);
  const submitting = useMarketTemplateStore((state: ReturnType<typeof useMarketTemplateStore.getState>) => state.submitting);
  const [localSubmitting, setLocalSubmitting] = useState(false);

  const initialValues = useMemo(
    () => ({
      name: defaultName,
      description: template?.description ?? '',
      category: (template?.category as TemplateCategory | undefined) ?? 'general',
      tags: template?.tags ?? [],
    }),
    [defaultName, template],
  );

  const handleSubmit = async () => {
    if (mode === 'create' && !source) {
      message.warning('缺少可发布的模板数据');
      return;
    }

    try {
      const values = await form.validateFields();
      setLocalSubmitting(true);
      if (mode === 'edit') {
        if (!template) {
          message.warning('缺少可编辑的模板');
          return;
        }
        await updateTemplate(template.id, {
          name: values.name,
          description: values.description ?? '',
          category: values.category ?? 'general',
          tags: values.tags ?? [],
          thumbnail: thumbnail ?? template.thumbnail,
        });
        message.success('市场模板信息已更新');
      } else {
        await createTemplate(
          buildMarketTemplatePayload({
            name: values.name,
            description: values.description,
            category: values.category,
            tags: values.tags,
            thumbnail,
            source: source!,
          }),
        );
        message.success('已保存到我的市场模板');
      }
      form.resetFields();
      onSuccess?.();
    } catch (error: any) {
      if (error?.errorFields) {
        return;
      }
      message.error(error?.message || '保存到市场失败');
    } finally {
      setLocalSubmitting(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title={mode === 'edit' ? '编辑市场模板' : '保存到市场'}
      open={open}
      onOk={handleSubmit}
      onCancel={handleCancel}
      okText={mode === 'edit' ? '保存' : '保存到市场'}
      cancelText="取消"
      confirmLoading={submitting || localSubmitting}
      width={520}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={initialValues}
        key={`${mode}-${template?.id ?? defaultName}`}
      >
        <Form.Item
          name="name"
          label="模板名称"
          rules={[{ required: true, message: '请输入模板名称' }]}
        >
          <Input placeholder="请输入模板名称" maxLength={100} />
        </Form.Item>

        <Form.Item name="description" label="模板描述">
          <Input.TextArea placeholder="请输入模板描述" maxLength={500} rows={3} />
        </Form.Item>

        <Form.Item name="category" label="模板分类">
          <Select
            options={Object.entries(CATEGORY_LABELS).map(([value, label]) => ({
              value,
              label,
            }))}
          />
        </Form.Item>

        <Form.Item name="tags" label="标签">
          <Select
            mode="tags"
            tokenSeparators={[',']}
            placeholder="输入标签后回车"
            open={false}
          />
        </Form.Item>

        {thumbnail && (
          <Form.Item label="缩略图预览">
            <img
              src={thumbnail}
              alt="模板缩略图"
              className="h-32 max-w-full rounded border object-contain"
            />
          </Form.Item>
        )}
      </Form>
    </Modal>
  );
}
