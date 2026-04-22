import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  App,
  Button,
  Form,
  Input,
  List,
  Modal,
  Popconfirm,
  QRCode,
  Space,
  Tag,
  Typography,
} from 'antd';
import {
  CopyOutlined,
  RollbackOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import {
  archiveVersion,
  buildPublishedPageUrl,
  getVersions,
  publishProject,
  rollbackVersion,
  type PublishResult,
  type PublishedVersion,
} from '../../../api/publish';
import {
  buildPublishAccessHint,
  getPublishStatusText,
  normalizePublishRequest,
  PUBLISH_SLUG_HINT,
  PUBLISH_SLUG_PATTERN,
} from './publish-dialog-utils';

const { Text } = Typography;

interface PublishDialogProps {
  open: boolean;
  projectId?: string;
  initialPublishUrl?: string | null;
  onCancel: () => void;
  onPublished?: (result: PublishResult) => void;
}

export default function PublishDialog({
  open,
  projectId,
  initialPublishUrl,
  onCancel,
  onPublished,
}: PublishDialogProps) {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [versionsLoading, setVersionsLoading] = useState(false);
  const [versions, setVersions] = useState<PublishedVersion[]>([]);
  const [currentPublished, setCurrentPublished] = useState<PublishResult | null>(null);

  const publishedUrl = useMemo(
    () => (currentPublished?.publishUrl ? buildPublishedPageUrl(currentPublished.publishUrl) : ''),
    [currentPublished],
  );
  const publishAccessHint = useMemo(
    () => buildPublishAccessHint(publishedUrl),
    [publishedUrl],
  );

  const loadVersions = useCallback(async () => {
    if (!projectId) {
      return;
    }

    setVersionsLoading(true);
    try {
      const result = await getVersions(projectId);
      setVersions(result.versions);
      const latestActive = result.versions.find((item) => item.status === 'active');
      if (latestActive) {
        setCurrentPublished({
          id: latestActive.id,
          version: latestActive.version,
          publishUrl: latestActive.publishUrl,
          status: latestActive.status,
          publishedBy: latestActive.publishedBy,
          createdAt: latestActive.createdAt,
          url: `/p/${latestActive.publishUrl}`,
        });
        form.setFieldsValue({
          slug: latestActive.publishUrl,
          title: latestActive.title ?? undefined,
          description: latestActive.description ?? undefined,
        });
      } else if (initialPublishUrl) {
        form.setFieldValue('slug', initialPublishUrl);
      }
    } finally {
      setVersionsLoading(false);
    }
  }, [form, initialPublishUrl, projectId]);

  useEffect(() => {
    if (open) {
      void loadVersions();
    }
  }, [loadVersions, open]);

  const handlePublish = async () => {
    if (!projectId) {
      message.warning('当前没有可发布的项目');
      return;
    }

    const values = normalizePublishRequest(await form.validateFields());
    setLoading(true);
    try {
      const result = await publishProject(projectId, values);
      setCurrentPublished(result);
      onPublished?.(result);
      message.success(`发布成功，当前版本 v${result.version}`);
      await loadVersions();
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!publishedUrl) {
      return;
    }
    await navigator.clipboard.writeText(publishedUrl);
    message.success('发布链接已复制');
  };

  const handleRollback = async (version: PublishedVersion) => {
    if (!projectId) {
      return;
    }
    await rollbackVersion(projectId, version.id);
    message.success(`已回滚到 v${version.version}`);
    await loadVersions();
  };

  const handleArchive = async (version: PublishedVersion) => {
    if (!projectId) {
      return;
    }
    await archiveVersion(projectId, version.id);
    message.success(`v${version.version} 已归档`);
    await loadVersions();
  };

  return (
    <Modal
      title="发布页面"
      open={open}
      onCancel={onCancel}
      width={820}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          关闭
        </Button>,
        <Button
          key="publish"
          type="primary"
          icon={<UploadOutlined />}
          onClick={() => void handlePublish()}
          loading={loading}
        >
          一键发布
        </Button>,
      ]}
    >
      <div className="flex flex-col gap-6">
        <div className="rounded-lg border border-border-light bg-bg-secondary p-4">
          <div className="mb-3 flex items-center justify-between">
            <Text strong>{getPublishStatusText(currentPublished)}</Text>
            {currentPublished ? <Tag color="green">可访问</Tag> : <Tag>未发布</Tag>}
          </div>

          {currentPublished ? (
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div className="min-w-0 flex-1">
                <div className="mb-2 break-all text-sm text-text-secondary">{publishedUrl}</div>
                {publishAccessHint ? (
                  <div
                    className="mb-3 rounded-md border px-3 py-2 text-sm text-danger"
                    style={{
                      borderColor: 'rgba(var(--color-danger), 0.22)',
                      backgroundColor: 'var(--theme-danger-soft)',
                    }}
                  >
                    {publishAccessHint}
                  </div>
                ) : null}
                <Space wrap>
                  <Button icon={<CopyOutlined />} onClick={() => void handleCopy()}>
                    复制链接
                  </Button>
                  <Button href={publishedUrl} target="_blank">
                    打开页面
                  </Button>
                </Space>
              </div>
              <div className="flex flex-col items-center gap-2">
                <QRCode value={publishedUrl || '-'} size={120} />
                <Text type="secondary" className="text-xs">
                  {publishAccessHint ? '当前设备扫码' : '扫码访问'}
                </Text>
              </div>
            </div>
          ) : (
            <Text type="secondary">首次发布后会在这里显示公开访问链接。</Text>
          )}
        </div>

        <Form form={form} layout="vertical">
          <Form.Item
            name="slug"
            label="URL Slug"
            extra={PUBLISH_SLUG_HINT}
            rules={[
              {
                max: 255,
                message: 'slug 最多 255 个字符',
              },
              {
                validator: async (_rule, value: string | undefined) => {
                  if (!value || value.trim().length === 0) {
                    return;
                  }

                  if (!PUBLISH_SLUG_PATTERN.test(value.trim())) {
                    throw new Error('slug 只能包含中文、小写字母、数字和连字符');
                  }
                },
              },
            ]}
          >
            <Input placeholder="例如 system-settings 或 系统设置" />
          </Form.Item>
          <Form.Item name="title" label="页面标题">
            <Input placeholder="用于浏览器标题和 SEO" />
          </Form.Item>
          <Form.Item name="description" label="页面描述">
            <Input.TextArea rows={3} placeholder="用于搜索摘要和分享描述" />
          </Form.Item>
        </Form>

        <div>
          <div className="mb-3 flex items-center justify-between">
            <Text strong>版本历史</Text>
            <Text type="secondary">{versions.length} 个版本</Text>
          </div>
          <List
            bordered
            loading={versionsLoading}
            dataSource={versions}
            locale={{ emptyText: '暂无发布版本' }}
            renderItem={(item) => (
              <List.Item
                actions={[
                  <Button
                    key="rollback"
                    size="small"
                    icon={<RollbackOutlined />}
                    onClick={() => void handleRollback(item)}
                  >
                    回滚
                  </Button>,
                  <Popconfirm
                    key="archive"
                    title={`确认归档 v${item.version} 吗？`}
                    okText="归档"
                    cancelText="取消"
                    onConfirm={() => void handleArchive(item)}
                  >
                    <Button size="small" danger>
                      归档
                    </Button>
                  </Popconfirm>,
                ]}
              >
                <List.Item.Meta
                  title={
                    <Space wrap>
                      <Text strong>{`v${item.version}`}</Text>
                      <Tag color={item.status === 'active' ? 'green' : 'default'}>
                        {item.status}
                      </Tag>
                      <Text type="secondary">{new Date(item.createdAt).toLocaleString('zh-CN')}</Text>
                    </Space>
                  }
                  description={item.title || item.publishUrl}
                />
              </List.Item>
            )}
          />
        </div>
      </div>
    </Modal>
  );
}
