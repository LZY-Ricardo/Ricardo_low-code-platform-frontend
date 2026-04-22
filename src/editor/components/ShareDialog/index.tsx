import { useEffect, useState } from 'react';
import {
  App,
  Button,
  Form,
  Input,
  List,
  Modal,
  QRCode,
  Select,
  Space,
  Tag,
  Typography,
} from 'antd';
import { CopyOutlined, ShareAltOutlined, UserAddOutlined } from '@ant-design/icons';
import {
  addCollaborator,
  buildShareUrl,
  createShare,
  getCollaborators,
  getShares,
  removeCollaborator,
  revokeShare,
  updateCollaboratorRole,
  type Collaborator,
  type ProjectShare,
} from '../../../api/share';

const { Text } = Typography;

interface ShareDialogProps {
  open: boolean;
  projectId?: string;
  onCancel: () => void;
}

export default function ShareDialog({ open, projectId, onCancel }: ShareDialogProps) {
  const { message } = App.useApp();
  const [shareForm] = Form.useForm();
  const [collaboratorForm] = Form.useForm();
  const [shares, setShares] = useState<ProjectShare[]>([]);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  const load = async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      const [shareList, collaboratorList] = await Promise.all([
        getShares(projectId),
        getCollaborators(projectId),
      ]);
      setShares(shareList);
      setCollaborators(collaboratorList);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      void load();
    }
  }, [open, projectId]);

  const latestShare = shares[0] ?? null;

  return (
    <Modal
      title="分享与协作"
      open={open}
      onCancel={onCancel}
      footer={null}
      width={860}
    >
      <div className="flex flex-col gap-6">
        <div className="rounded-lg border border-border-light bg-bg-secondary p-4">
          <div className="mb-3 flex items-center justify-between">
            <Text strong>分享链接</Text>
            {latestShare ? <Tag color="green">已生成</Tag> : <Tag>未生成</Tag>}
          </div>
          {latestShare ? (
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div className="min-w-0 flex-1">
                <div className="mb-2 break-all text-sm text-text-secondary">
                  {buildShareUrl(latestShare.shareToken)}
                </div>
                <Space wrap>
                  <Button
                    icon={<CopyOutlined />}
                    onClick={async () => {
                      await navigator.clipboard.writeText(buildShareUrl(latestShare.shareToken));
                      message.success('分享链接已复制');
                    }}
                  >
                    复制链接
                  </Button>
                  <Button href={buildShareUrl(latestShare.shareToken)} target="_blank">
                    打开链接
                  </Button>
                </Space>
              </div>
              <QRCode value={buildShareUrl(latestShare.shareToken)} size={120} />
            </div>
          ) : (
            <Text type="secondary">创建分享后会在这里显示分享链接和二维码。</Text>
          )}
        </div>

        <Form
          form={shareForm}
          layout="vertical"
          initialValues={{ permission: 'view', expiresIn: 7 }}
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Form.Item name="permission" label="权限">
              <Select
                options={[
                  { label: '只读查看', value: 'view' },
                  { label: '可编辑', value: 'edit' },
                ]}
              />
            </Form.Item>
            <Form.Item name="expiresIn" label="有效期（天）">
              <Select
                options={[
                  { label: '1 天', value: 1 },
                  { label: '7 天', value: 7 },
                  { label: '30 天', value: 30 },
                ]}
              />
            </Form.Item>
            <Form.Item name="password" label="访问密码">
              <Input.Password placeholder="可选" />
            </Form.Item>
          </div>
          <Button
            type="primary"
            icon={<ShareAltOutlined />}
            loading={creating}
            onClick={async () => {
              if (!projectId) return;
              const values = await shareForm.validateFields();
              setCreating(true);
              try {
                await createShare(projectId, values);
                message.success('分享链接已生成');
                await load();
              } finally {
                setCreating(false);
              }
            }}
          >
            生成链接
          </Button>
        </Form>

        <div>
          <div className="mb-3 flex items-center justify-between">
            <Text strong>已创建的分享</Text>
            <Text type="secondary">{shares.length} 条</Text>
          </div>
          <List
            bordered
            loading={loading}
            dataSource={shares}
            locale={{ emptyText: '暂无分享记录' }}
            renderItem={(share) => (
              <List.Item
                actions={[
                  <Button
                    key="copy"
                    size="small"
                    onClick={async () => {
                      await navigator.clipboard.writeText(buildShareUrl(share.shareToken));
                      message.success('分享链接已复制');
                    }}
                  >
                    复制
                  </Button>,
                  <Button
                    key="revoke"
                    size="small"
                    danger
                    onClick={async () => {
                      if (!projectId) return;
                      await revokeShare(projectId, share.id);
                      message.success('分享已取消');
                      await load();
                    }}
                  >
                    取消分享
                  </Button>,
                ]}
              >
                <List.Item.Meta
                  title={
                    <Space wrap>
                      <Tag color={share.permission === 'edit' ? 'gold' : 'blue'}>
                        {share.permission}
                      </Tag>
                      {share.hasPassword ? <Tag>已设密码</Tag> : <Tag>无密码</Tag>}
                      <Text type="secondary">{share.expiresAt || '永不过期'}</Text>
                    </Space>
                  }
                  description={buildShareUrl(share.shareToken)}
                />
              </List.Item>
            )}
          />
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between">
            <Text strong>协作者</Text>
            <Text type="secondary">{collaborators.length} 人</Text>
          </div>
          <Form
            form={collaboratorForm}
            layout="inline"
            initialValues={{ role: 'editor' }}
            className="mb-4"
          >
            <Form.Item name="username" rules={[{ required: true, message: '请输入用户名' }]}>
              <Input placeholder="用户名" />
            </Form.Item>
            <Form.Item name="role">
              <Select
                style={{ width: 140 }}
                options={[
                  { label: '编辑者', value: 'editor' },
                  { label: '查看者', value: 'viewer' },
                ]}
              />
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                icon={<UserAddOutlined />}
                onClick={async () => {
                  if (!projectId) return;
                  const values = await collaboratorForm.validateFields();
                  await addCollaborator(projectId, values);
                  collaboratorForm.resetFields();
                  message.success('协作者已添加');
                  await load();
                }}
              >
                添加协作者
              </Button>
            </Form.Item>
          </Form>
          <List
            bordered
            loading={loading}
            dataSource={collaborators}
            locale={{ emptyText: '暂无协作者' }}
            renderItem={(item) => (
              <List.Item
                actions={[
                  <Select
                    key="role"
                    value={item.role}
                    style={{ width: 120 }}
                    options={[
                      { label: '编辑者', value: 'editor' },
                      { label: '查看者', value: 'viewer' },
                    ]}
                    onChange={async (role) => {
                      if (!projectId) return;
                      await updateCollaboratorRole(projectId, item.userId, role);
                      message.success('协作者角色已更新');
                      await load();
                    }}
                  />,
                  <Button
                    key="remove"
                    size="small"
                    danger
                    onClick={async () => {
                      if (!projectId) return;
                      await removeCollaborator(projectId, item.userId);
                      message.success('协作者已移除');
                      await load();
                    }}
                  >
                    移除
                  </Button>,
                ]}
              >
                <List.Item.Meta
                  title={item.user?.username || item.userId}
                  description={item.user?.email || item.role}
                />
              </List.Item>
            )}
          />
        </div>
      </div>
    </Modal>
  );
}
