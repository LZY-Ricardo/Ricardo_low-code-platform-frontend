import { useCallback, useEffect, useMemo, useState } from 'react';
import { App, Button, Card, Empty, Form, Input, Modal, Select, Space, Switch, Table, Tag, Typography } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import { createForm, deleteForm, getForms, updateForm, type FormSchema } from '../api/forms';
import { useProjectStore } from '../editor/stores/project';
import { analyzeProjectFormBinding, bindFormSchemaToProject } from './form-utils';

const { Text } = Typography;

type FormManagerLocationState = {
  projectId?: string;
  selectedFormComponentId?: number;
  source?: 'editor';
};

export default function FormManager() {
  const navigate = useNavigate();
  const location = useLocation();
  const { message, modal } = App.useApp();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [forms, setForms] = useState<FormSchema[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const { projects, loadProjects, persistProjectComponents } = useProjectStore();
  const routeState = (location.state ?? null) as FormManagerLocationState | null;
  const preferredProjectId = routeState?.projectId;
  const preferredFormComponentId = routeState?.selectedFormComponentId ?? null;
  const returnToEditor = routeState?.source === 'editor' && preferredProjectId;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getForms();
      setForms(result.forms);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    void loadProjects();
  }, [load, loadProjects]);

  useEffect(() => {
    if (!preferredProjectId) {
      return;
    }

    setCreateOpen(true);
    form.setFieldsValue({
      projectId: preferredProjectId,
    });
  }, [form, preferredProjectId]);

  const summary = useMemo(() => {
    const totalSubmissions = forms.reduce((sum, form) => sum + form.submissions, 0);
    const activeCount = forms.filter((form) => form.isActive).length;
    return {
      totalForms: forms.length,
      totalSubmissions,
      activeCount,
    };
  }, [forms]);

  const columns = [
    {
      title: '表单名称',
      dataIndex: 'name',
      key: 'name',
      render: (_: string, record: FormSchema) => (
        <div className="flex flex-col">
          <Text strong>{record.name}</Text>
          <Text type="secondary">{record.description || '无描述'}</Text>
        </div>
      ),
    },
    {
      title: '字段数',
      key: 'fieldCount',
      render: (_: unknown, record: FormSchema) => record.fields.length,
    },
    {
      title: '提交数',
      dataIndex: 'submissions',
      key: 'submissions',
    },
    {
      title: '状态',
      key: 'isActive',
      render: (_: unknown, record: FormSchema) => (
        <Switch
          checked={record.isActive}
          checkedChildren="启用"
          unCheckedChildren="停用"
          onChange={async (checked) => {
            await updateForm(record.id, { isActive: checked });
            message.success(checked ? '表单已启用' : '表单已停用');
            await load();
          }}
        />
      ),
    },
    {
      title: '操作',
      key: 'actions',
      render: (_: unknown, record: FormSchema) => (
        <Space>
          <Button size="small" onClick={() => navigate(`/forms/${record.id}`)}>
            查看数据
          </Button>
          <Button
            size="small"
            danger
            onClick={async () => {
              await deleteForm(record.id);
              message.success('表单已删除');
              await load();
            }}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  const showCreateResult = (
    feedback: string,
    projectId: string,
    hasPublishedPage: boolean,
  ) => {
    if (!returnToEditor && !hasPublishedPage) {
      message.success(feedback);
      return;
    }

    const title = hasPublishedPage ? '表单已创建，需要重新发布' : '表单已创建';
    const content = hasPublishedPage
      ? `${feedback}。当前项目已有发布链接，公开页要重新发布后才会生效。`
      : `${feedback}。可以返回编辑器继续调整。`;

    modal.confirm({
      title,
      content,
      okText: hasPublishedPage ? '返回编辑器并发布' : '返回编辑器',
      cancelText: '留在这里',
      onOk: () => navigate(`/editor/${projectId}`, {
        state: hasPublishedPage ? { openPublishDialog: true } : null,
      }),
    });
  };

  return (
    <div className="app-page px-6 py-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">表单数据</h1>
            <p className="text-sm text-text-secondary">管理数据收集、提交记录和导出</p>
          </div>
          <Space>
            <Button
              type="primary"
              onClick={() => setCreateOpen(true)}
            >
              新建表单
            </Button>
            <Button onClick={() => navigate(returnToEditor ? `/editor/${preferredProjectId}` : '/projects')}>
              {returnToEditor ? '返回编辑器' : '返回项目'}
            </Button>
          </Space>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card className="border border-border-light bg-bg-secondary shadow-soft">
            <Text type="secondary">表单数量</Text>
            <div className="mt-2 text-3xl font-semibold">{summary.totalForms}</div>
          </Card>
          <Card className="border border-border-light bg-bg-secondary shadow-soft">
            <Text type="secondary">总提交数</Text>
            <div className="mt-2 text-3xl font-semibold">{summary.totalSubmissions}</div>
          </Card>
          <Card className="border border-border-light bg-bg-secondary shadow-soft">
            <Text type="secondary">启用中</Text>
            <div className="mt-2 flex items-center gap-3">
              <div className="text-3xl font-semibold">{summary.activeCount}</div>
              <Tag color="green">活跃</Tag>
            </div>
          </Card>
        </div>

        <Card className="border border-border-light bg-bg-secondary shadow-soft">
          {forms.length === 0 ? (
            <Empty description="暂无表单" />
          ) : (
            <Table<FormSchema>
              rowKey="id"
              loading={loading}
              columns={columns}
              dataSource={forms}
              pagination={false}
            />
          )}
        </Card>

        <Modal
          title="新建表单"
          open={createOpen}
          onCancel={() => {
            setCreateOpen(false);
            form.resetFields();
          }}
          onOk={async () => {
            const values = await form.validateFields();
            const project = projects.find((item) => item.id === values.projectId);
            if (!project) {
              message.warning('请选择项目');
              return;
            }

            const analysis = analyzeProjectFormBinding(project.components, {
              preferredComponentId:
                project.id === preferredProjectId ? preferredFormComponentId : null,
            });
            const fields = analysis.fields;
            if (fields.length === 0) {
              message.warning('当前项目中未识别到可收集字段');
              return;
            }

            const createdForm = await createForm({
              name: values.name,
              description: values.description,
              projectId: values.projectId,
              fields,
              isActive: true,
            });

            let feedback = '表单已创建';
            if (analysis.targetComponentId !== null) {
              const nextComponents = bindFormSchemaToProject(
                project.components,
                analysis.targetComponentId,
                createdForm.id,
              );
              const persisted = await persistProjectComponents(project.id, nextComponents);
              feedback = persisted ? '表单已创建并自动绑定' : '表单已创建，自动绑定失败';
            } else if (analysis.reason === 'multiple-unbound-forms') {
              feedback = '表单已创建，请到编辑器手动填写 formId';
            } else if (analysis.reason === 'all-forms-already-bound') {
              feedback = '表单已创建，项目中的表单组件已存在绑定';
            } else if (analysis.reason === 'no-form-component') {
              feedback = '表单已创建，项目中暂无可绑定的表单组件';
            }

            setCreateOpen(false);
            form.resetFields();
            await loadProjects();
            await load();
            showCreateResult(feedback, project.id, Boolean(project.publishUrl));
          }}
        >
          <Form form={form} layout="vertical">
            <Form.Item
              name="name"
              label="表单名称"
              rules={[{ required: true, message: '请输入表单名称' }]}
            >
              <Input placeholder="例如：活动报名表" />
            </Form.Item>
            <Form.Item name="description" label="描述">
              <Input.TextArea rows={3} placeholder="可选" />
            </Form.Item>
            <Form.Item
              name="projectId"
              label="关联项目"
              rules={[{ required: true, message: '请选择项目' }]}
            >
              <Select
                options={projects.map((project) => ({
                  label: project.name,
                  value: project.id,
                }))}
                placeholder="选择要抽取字段的项目"
              />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </div>
  );
}
