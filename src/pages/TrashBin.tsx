import { useEffect, useState } from 'react';
import { App, Button, Card, Empty, Popconfirm, Space, Table, Tag, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import {
  getTrash,
  permanentDeleteProject,
  restoreProject,
  type TrashProject,
} from '../api/trash';

const { Text } = Typography;

export default function TrashBin() {
  const navigate = useNavigate();
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<TrashProject[]>([]);

  const load = async () => {
    setLoading(true);
    try {
      const result = await getTrash();
      setProjects(result.projects);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const columns = [
    {
      title: '项目',
      key: 'name',
      render: (_: unknown, record: TrashProject) => (
        <div className="flex flex-col">
          <Text strong>{record.name}</Text>
          <Text type="secondary">{new Date(record.updatedAt).toLocaleString('zh-CN')}</Text>
        </div>
      ),
    },
    {
      title: '删除时间',
      dataIndex: 'deletedAt',
      key: 'deletedAt',
      render: (value: string) => new Date(value).toLocaleString('zh-CN'),
    },
    {
      title: '状态',
      key: 'status',
      render: () => <Tag color="red">已删除</Tag>,
    },
    {
      title: '操作',
      key: 'actions',
      render: (_: unknown, record: TrashProject) => (
        <Space>
          <Button
            size="small"
            onClick={async () => {
              await restoreProject(record.id);
              message.success('项目已恢复');
              await load();
            }}
          >
            恢复
          </Button>
          <Popconfirm
            title="确认永久删除该项目吗？"
            description="删除后不可恢复"
            okText="永久删除"
            cancelText="取消"
            onConfirm={async () => {
              await permanentDeleteProject(record.id);
              message.success('项目已永久删除');
              await load();
            }}
          >
            <Button size="small" danger>
              永久删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="app-page px-6 py-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">回收站</h1>
            <p className="text-sm text-text-secondary">已删除项目将在 30 天后自动清理</p>
          </div>
          <Button onClick={() => navigate('/projects')}>返回项目</Button>
        </div>

        <Card className="border border-border-light bg-bg-secondary shadow-soft">
          {projects.length === 0 ? (
            <Empty description="回收站是空的" />
          ) : (
            <Table<TrashProject>
              rowKey="id"
              loading={loading}
              dataSource={projects}
              columns={columns}
              pagination={false}
            />
          )}
        </Card>
      </div>
    </div>
  );
}
