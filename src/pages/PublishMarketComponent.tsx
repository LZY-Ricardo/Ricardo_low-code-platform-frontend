import { useState } from 'react';
import { App, Button, Card, Form, Input, Select, Space, Switch } from 'antd';
import { LeftOutlined } from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';
import { createMarketComponent } from '../api/market';
import {
  buildCreateMarketComponentPayload,
  createPublishComponentFormValues,
  type PublishComponentFormValues,
} from './publish-market-component-utils';

const CATEGORY_OPTIONS = [
  { label: '通用', value: 'custom' },
  { label: '布局', value: 'layout' },
  { label: '表单', value: 'form' },
  { label: '展示', value: 'display' },
  { label: '数据', value: 'data' },
  { label: '交互', value: 'actions' },
];

interface PublishLocationState {
  backTo?: string;
}

export default function PublishMarketComponent() {
  const navigate = useNavigate();
  const location = useLocation();
  const { message } = App.useApp();
  const [form] = Form.useForm<PublishComponentFormValues>();
  const [loading, setLoading] = useState(false);
  const state = (location.state ?? {}) as PublishLocationState;
  const backTo = state.backTo || '/market';

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload = buildCreateMarketComponentPayload(values);
      setLoading(true);
      const result = await createMarketComponent(payload);
      message.success('组件已发布');
      navigate(`/market/component/${result.id}`);
    } catch (error) {
      if (error instanceof Error && error.message) {
        message.error(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-page px-6 py-8">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">发布组件</h1>
            <p className="text-sm text-text-secondary">填写组件信息并提交到创作者市场</p>
          </div>
          <Button icon={<LeftOutlined />} onClick={() => navigate(backTo)}>
            返回
          </Button>
        </div>

        <Card className="border border-border-light bg-bg-secondary shadow-soft">
          <Form<PublishComponentFormValues>
            form={form}
            layout="vertical"
            initialValues={createPublishComponentFormValues()}
            onFinish={handleSubmit}
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Form.Item
                name="name"
                label="组件标识"
                rules={[
                  { required: true, message: '请输入组件标识' },
                  {
                    pattern: /^[A-Za-z][A-Za-z0-9_]*$/,
                    message: '仅支持字母、数字、下划线，且需字母开头',
                  },
                ]}
              >
                <Input placeholder="MyButton" />
              </Form.Item>
              <Form.Item
                name="displayName"
                label="展示名称"
                rules={[{ required: true, message: '请输入展示名称' }]}
              >
                <Input placeholder="我的按钮" />
              </Form.Item>
              <Form.Item
                name="category"
                label="分类"
                rules={[{ required: true, message: '请选择分类' }]}
              >
                <Select options={CATEGORY_OPTIONS} />
              </Form.Item>
              <Form.Item
                name="version"
                label="版本"
                rules={[{ required: true, message: '请输入版本号' }]}
              >
                <Input placeholder="1.0.0" />
              </Form.Item>
              <Form.Item name="icon" label="图标">
                <Input placeholder="rocket" />
              </Form.Item>
              <Form.Item
                name="thumbnail"
                label="缩略图地址"
                rules={[{ type: 'url', warningOnly: true, message: '建议填写合法的 URL' }]}
              >
                <Input placeholder="https://example.com/component.png" />
              </Form.Item>
            </div>

            <Form.Item name="description" label="描述">
              <Input.TextArea rows={3} placeholder="一句话概括组件能力" />
            </Form.Item>

            <Form.Item
              name="code"
              label="组件代码"
              rules={[{ required: true, message: '请输入组件代码' }]}
            >
              <Input.TextArea
                rows={14}
                className="font-mono"
                placeholder="export default function Component(props) { return null }"
              />
            </Form.Item>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <Form.Item
                name="defaultPropsText"
                label="默认属性 JSON"
                rules={[{ required: true, message: '请输入默认属性 JSON' }]}
              >
                <Input.TextArea rows={8} className="font-mono" />
              </Form.Item>
              <Form.Item
                name="setterConfigText"
                label="属性面板 JSON"
                rules={[{ required: true, message: '请输入属性面板 JSON' }]}
              >
                <Input.TextArea rows={8} className="font-mono" />
              </Form.Item>
            </div>

            <Form.Item name="isPublic" label="公开到市场" valuePropName="checked">
              <Switch checkedChildren="公开" unCheckedChildren="私有" />
            </Form.Item>

            <Space>
              <Button onClick={() => navigate(backTo)}>取消</Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                发布组件
              </Button>
            </Space>
          </Form>
        </Card>
      </div>
    </div>
  );
}
