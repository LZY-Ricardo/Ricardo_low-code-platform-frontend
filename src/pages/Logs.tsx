import { useCallback, useEffect, useState } from 'react';
import { Button, Card, DatePicker, Empty, Input, Space, Table, Tag, Typography } from 'antd';
import type { Dayjs } from 'dayjs';
import { useNavigate } from 'react-router-dom';
import { getLogs, type OperationLog } from '../api/logs';

const { RangePicker } = DatePicker;
const { Text } = Typography;

export default function LogsPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<OperationLog[]>([]);
  const [action, setAction] = useState('');
  const [resource, setResource] = useState('');
  const [range, setRange] = useState<[Dayjs | null, Dayjs | null] | null>(null);

  const handleRangeChange = (value: [Dayjs | null, Dayjs | null] | null) => {
    setRange(value);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getLogs({
        action: action || undefined,
        resource: resource || undefined,
        startDate: range?.[0]?.toISOString(),
        endDate: range?.[1]?.toISOString(),
      });
      setLogs(result.logs);
    } finally {
      setLoading(false);
    }
  }, [action, resource, range]);

  useEffect(() => {
    void load();
  }, [load]);

  const columns = [
    {
      title: '时间',
      key: 'createdAt',
      render: (_: unknown, record: OperationLog) =>
        new Date(record.createdAt).toLocaleString('zh-CN'),
    },
    {
      title: '操作类型',
      dataIndex: 'action',
      key: 'action',
      render: (value: string) => <Tag color="processing">{value}</Tag>,
    },
    {
      title: '资源',
      key: 'resource',
      render: (_: unknown, record: OperationLog) => (
        <div className="flex flex-col">
          <Text>{record.resource}</Text>
          <Text type="secondary">{record.resourceId || '-'}</Text>
        </div>
      ),
    },
    {
      title: '详情',
      key: 'detail',
      render: (_: unknown, record: OperationLog) => (
        <pre className="max-w-[320px] overflow-x-auto whitespace-pre-wrap text-xs text-text-secondary">
          {record.detail ? JSON.stringify(record.detail, null, 2) : '-'}
        </pre>
      ),
    },
    {
      title: 'IP',
      dataIndex: 'ip',
      key: 'ip',
      render: (value: string | null) => value || '-',
    },
    {
      title: 'UserAgent',
      dataIndex: 'userAgent',
      key: 'userAgent',
      render: (value: string | null) => (
        <div className="max-w-[260px] truncate" title={value || ''}>
          {value || '-'}
        </div>
      ),
    },
  ];

  return (
    <div className="app-page px-6 py-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">操作日志</h1>
            <p className="text-sm text-text-secondary">查看平台中的关键操作记录</p>
          </div>
          <Button onClick={() => navigate('/projects')}>返回项目</Button>
        </div>

        <Card className="border border-border-light bg-bg-secondary shadow-soft">
          <Space wrap>
            <Input
              placeholder="按操作类型筛选，例如 project.create"
              value={action}
              onChange={(e) => setAction(e.target.value)}
              style={{ width: 260 }}
            />
            <Input
              placeholder="按资源类型筛选，例如 project"
              value={resource}
              onChange={(e) => setResource(e.target.value)}
              style={{ width: 220 }}
            />
            <RangePicker
              value={range}
              onChange={(value) => handleRangeChange(value ? [value[0], value[1]] : null)}
            />
            <Button type="primary" onClick={() => void load()}>
              查询
            </Button>
          </Space>
        </Card>

        <Card className="border border-border-light bg-bg-secondary shadow-soft">
          {logs.length === 0 ? (
            <Empty description="暂无日志" />
          ) : (
            <Table<OperationLog>
              rowKey="id"
              loading={loading}
              dataSource={logs}
              columns={columns}
              pagination={false}
              scroll={{ x: true }}
            />
          )}
        </Card>
      </div>
    </div>
  );
}
