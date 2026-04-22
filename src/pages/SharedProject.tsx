import { createElement, useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { Alert, App, Button, Card, Input, Segmented, Spin } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { accessSharedProject } from '../api/share';
import { createProject } from '../api/projects';
import { useComponentConfigStore } from '../editor/stores/component-config';
import { useAuthStore } from '../stores/auth';
import type { Component } from '../editor/stores/components';

interface SharedProjectRecord {
  id?: string;
  userId?: string;
  name?: string;
  components?: Component[];
  [key: string]: unknown;
}

export default function SharedProject() {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const { token } = useParams();
  const { componentConfig } = useComponentConfigStore();
  const user = useAuthStore((s) => s.user);
  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [permission, setPermission] = useState<'view' | 'edit' | null>(null);
  const [project, setProject] = useState<SharedProjectRecord | null>(null);
  const [name, setName] = useState('');
  const [componentsJson, setComponentsJson] = useState('[]');
  const [saving, setSaving] = useState(false);
  const [mode, setMode] = useState<'preview' | 'source'>('preview');
  const isOwner = project?.userId != null && user?.id === project.userId;

  const previewComponents = useMemo(() => {
    try {
      return JSON.parse(componentsJson) as Component[];
    } catch {
      return [];
    }
  }, [componentsJson]);

  const renderPreview = (components: Component[]): ReactNode =>
    components.map((component) => {
      const config = componentConfig[component.name];
      if (!config?.prod) {
        return null;
      }

      const props = {
        key: component.id,
        id: component.id,
        name: component.name,
        styles: component.styles,
        ...config.defaultProps,
        ...(component.props || {}),
      };

      if (config.allowChildren && Array.isArray(component.children) && component.children.length > 0) {
        return createElement(config.prod, props, renderPreview(component.children));
      }

      return createElement(config.prod, props);
    });

  const load = useCallback(async (sharePassword?: string) => {
    if (!token) {
      setError('分享链接无效');
      setLoading(false);
      return false;
    }

    setLoading(true);
    setError(null);
    try {
      const result = await accessSharedProject(token, sharePassword);
      setPermission(result.permission);
      setProject(result.project);
      setName(typeof result.project?.name === 'string' ? result.project.name : '');
      setComponentsJson(JSON.stringify(result.project?.components ?? [], null, 2));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : '访问失败');
      return false;
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto flex min-h-screen max-w-xl items-center px-6">
        <Card className="w-full">
          <div className="flex flex-col gap-4">
            <Alert type="error" message="访问失败" description={error} showIcon />
            <Input.Password
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="如果该分享设置了密码，请输入后重试"
            />
            <Button
              type="primary"
              onClick={async () => {
                const ok = await load(password);
                if (ok) {
                  message.success('访问成功');
                }
              }}
            >
              重试访问
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="app-page px-6 py-8">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <Card className="border border-border-light bg-bg-secondary shadow-soft">
          <div className="mb-2 flex items-center gap-3">
            <h1 className="text-2xl font-bold text-text-primary">
              {project?.name ?? '共享项目'}
            </h1>
            <span
              className={`rounded-full px-3 py-1 text-xs ${
                permission === 'edit'
                  ? 'bg-success/10 text-success'
                  : 'bg-accent/10 text-accent'
              }`}
            >
              {permission === 'edit' ? '可编辑' : '只读模式'}
            </span>
          </div>
          {permission === 'edit' ? (
            <div className="flex flex-col gap-4">
              <Segmented
                value={mode}
                options={[
                  { label: '预览', value: 'preview' },
                  { label: '源码', value: 'source' },
                ]}
                onChange={(value) => setMode(value as 'preview' | 'source')}
              />
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="项目名称" />
              {mode === 'source' ? (
                <Input.TextArea
                  rows={18}
                  value={componentsJson}
                  onChange={(e) => setComponentsJson(e.target.value)}
                  placeholder="组件 JSON"
                />
              ) : (
                <div className="rounded-lg border border-border-light bg-bg-secondary p-4">
                  {previewComponents.length > 0 ? renderPreview(previewComponents) : '暂无可预览内容'}
                </div>
              )}
              {isOwner ? (
                <Alert type="info" message="这是你自己的项目，无需重复保存" showIcon />
              ) : (
                <Button
                  type="primary"
                  loading={saving}
                  onClick={async () => {
                    setSaving(true);
                    try {
                      const parsed = JSON.parse(componentsJson);
                      const newProject = await createProject({
                        name: name || '未命名项目',
                        components: parsed,
                      });
                      message.success('已保存到我的项目');
                      navigate(`/editor/${newProject.id}`);
                    } catch (err) {
                      if (!localStorage.getItem('lowcode_token')) {
                        message.warning('请先登录后再保存');
                        navigate('/login');
                      } else {
                        message.error(err instanceof Error ? err.message : '保存失败');
                      }
                    } finally {
                      setSaving(false);
                    }
                  }}
                >
                  保存到我的项目
                </Button>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <pre className="overflow-x-auto whitespace-pre-wrap rounded-lg bg-text-primary p-4 text-sm text-white">
                {JSON.stringify(project, null, 2)}
              </pre>
              {isOwner ? (
                <Alert type="info" message="这是你自己的项目，无需重复保存" showIcon />
              ) : (
                <Button
                  type="primary"
                  loading={saving}
                  onClick={async () => {
                    setSaving(true);
                    try {
                      const parsed = JSON.parse(componentsJson);
                      const newProject = await createProject({
                        name: name || '未命名项目',
                        components: parsed,
                      });
                      message.success('已保存到我的项目');
                      navigate(`/editor/${newProject.id}`);
                    } catch (err) {
                      if (!localStorage.getItem('lowcode_token')) {
                        message.warning('请先登录后再保存');
                        navigate('/login');
                      } else {
                        message.error(err instanceof Error ? err.message : '保存失败');
                      }
                    } finally {
                      setSaving(false);
                    }
                  }}
                >
                  保存到我的项目
                </Button>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
