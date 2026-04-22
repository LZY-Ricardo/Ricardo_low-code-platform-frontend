import { useCallback, useEffect, useMemo, useState } from 'react';
import { App, Button, Card, Empty, Space, Switch, Table, Tabs, Tag, Typography } from 'antd';
import { saveAs } from 'file-saver';
import { useNavigate, useParams } from 'react-router-dom';
import {
  exportFormCSV,
  getForm,
  getRecords,
  getStats,
  updateForm,
  type FormRecord,
  type FormSchema,
  type FormStats,
} from '../api/forms';
import { buildTrendBars } from './form-utils';

const { Text } = Typography;

export default function FormDetail() {
  const navigate = useNavigate();
  const { message } = App.useApp();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<FormSchema | null>(null);
  const [records, setRecords] = useState<FormRecord[]>([]);
  const [stats, setStats] = useState<FormStats | null>(null);

  const load = useCallback(async () => {
    if (!id) {
      return;
    }

    setLoading(true);
    try {
      const [detail, recordsResult, statsResult] = await Promise.all([
        getForm(id),
        getRecords(id),
        getStats(id),
      ]);
      setForm(detail);
      setRecords(recordsResult.records);
      setStats(statsResult);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  const recordColumns = useMemo(() => {
    const fields = form?.fields ?? [];
    return [
      {
        title: '提交时间',
        key: 'submittedAt',
        render: (_: unknown, record: FormRecord) =>
          new Date(record.submittedAt).toLocaleString('zh-CN'),
      },
      ...fields.map((field) => ({
        title: field.label || field.key,
        key: field.key,
        render: (_: unknown, record: FormRecord) => `${record.data?.[field.key] ?? ''}`,
      })),
    ];
  }, [form]);

  const trendBars = useMemo(() => buildTrendBars(stats?.trend ?? []), [stats]);

  return (
    <div className="app-page px-6 py-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">{form?.name || '表单详情'}</h1>
            <p className="text-sm text-text-secondary">{form?.description || '查看提交记录和统计数据'}</p>
          </div>
          <Space>
            <Button onClick={() => navigate('/forms')}>返回列表</Button>
            {id && (
              <Button
                type="primary"
                onClick={async () => {
                  const blob = await exportFormCSV(id);
                  saveAs(blob, `form-${id}.csv`);
                }}
              >
                导出 CSV
              </Button>
            )}
          </Space>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <Card className="border border-border-light bg-bg-secondary shadow-soft">
            <Text type="secondary">总提交数</Text>
            <div className="mt-2 text-3xl font-semibold">{stats?.totalSubmissions ?? 0}</div>
          </Card>
          <Card className="border border-border-light bg-bg-secondary shadow-soft">
            <Text type="secondary">今日提交</Text>
            <div className="mt-2 text-3xl font-semibold">{stats?.todaySubmissions ?? 0}</div>
          </Card>
          <Card className="border border-border-light bg-bg-secondary shadow-soft">
            <Text type="secondary">字段数</Text>
            <div className="mt-2 text-3xl font-semibold">{form?.fields.length ?? 0}</div>
          </Card>
          <Card className="border border-border-light bg-bg-secondary shadow-soft">
            <Text type="secondary">数据收集</Text>
            <div className="mt-2">
              <Switch
                checked={form?.isActive ?? false}
                checkedChildren="启用"
                unCheckedChildren="停用"
                onChange={async (checked) => {
                  if (!id) return;
                  await updateForm(id, { isActive: checked });
                  message.success(checked ? '表单已启用' : '表单已停用');
                  await load();
                }}
              />
            </div>
          </Card>
        </div>

        <Tabs
          items={[
            {
              key: 'records',
              label: '提交记录',
              children: (
                <Card className="border border-border-light bg-bg-secondary shadow-soft">
                  {records.length === 0 ? (
                    <Empty description="暂无提交记录" />
                  ) : (
                    <Table<FormRecord>
                      rowKey="id"
                      loading={loading}
                      dataSource={records}
                      columns={recordColumns}
                      pagination={false}
                      scroll={{ x: true }}
                    />
                  )}
                </Card>
              ),
            },
            {
              key: 'stats',
              label: '数据统计',
              children: (
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  <Card title="提交趋势" className="border border-border-light bg-bg-secondary shadow-soft">
                    <div className="flex flex-col gap-2">
                      {trendBars.slice(-10).map((item) => (
                        <div key={item.date} className="flex items-center gap-3">
                          <div className="w-24 flex-shrink-0 text-xs text-text-secondary">
                            {item.date.slice(5)}
                          </div>
                          <div className="h-3 flex-1 rounded-full bg-bg-primary">
                            <div
                              className="h-3 rounded-full bg-accent"
                              style={{ width: `${item.percent}%` }}
                            />
                          </div>
                          <div className="w-10 text-right text-sm">{item.count}</div>
                        </div>
                      ))}
                    </div>
                  </Card>
                  <Card title="字段分布" className="border border-border-light bg-bg-secondary shadow-soft">
                    <div className="flex flex-col gap-4">
                      {stats && Object.keys(stats.fieldDistribution).length > 0 ? (
                        Object.entries(stats.fieldDistribution).map(([fieldKey, info]) => (
                          <div key={fieldKey} className="rounded-lg border border-border-light p-3">
                            <div className="mb-2 flex items-center justify-between">
                              <Text strong>{fieldKey}</Text>
                              <Tag>{form?.fields.find((field) => field.key === fieldKey)?.type || 'field'}</Tag>
                            </div>
                            <pre className="overflow-x-auto whitespace-pre-wrap text-xs text-text-secondary">
                              {JSON.stringify(info, null, 2)}
                            </pre>
                          </div>
                        ))
                      ) : (
                        <Empty description="暂无统计数据" />
                      )}
                    </div>
                  </Card>
                </div>
              ),
            },
          ]}
        />
      </div>
    </div>
  );
}
