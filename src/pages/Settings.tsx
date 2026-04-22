import { useEffect, useMemo, useState } from 'react';
import {
  Avatar,
  Button,
  Card,
  Form,
  Input,
  Upload,
  message,
} from 'antd';
import {
  CameraOutlined,
  LockOutlined,
  MailOutlined,
  SaveOutlined,
  UploadOutlined,
  UserOutlined,
} from '@ant-design/icons';
import WorkspaceHeader from '../components/WorkspaceHeader';
import { useAuthStore } from '../stores/auth';
import * as authApi from '../api/auth';
import { resolveAssetUrl, uploadFile } from '../api/files';

function resolveErrorMessage(error: unknown, fallback: string) {
  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof error.message === 'string'
  ) {
    return error.message;
  }
  return fallback;
}

function hasFormErrors(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'errorFields' in error;
}

export default function Settings() {
  const { user, setUser } = useAuthStore();
  const [profileForm] = Form.useForm<{ username: string }>();
  const [passwordForm] = Form.useForm<{
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }>();
  const [profileSaving, setProfileSaving] = useState(false);
  const [avatarSaving, setAvatarSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);

  useEffect(() => {
    if (user) {
      profileForm.setFieldsValue({
        username: user.username,
      });
    }
  }, [profileForm, user]);

  const avatarUrl = useMemo(() => {
    if (!user?.avatarUrl) {
      return undefined;
    }

    return resolveAssetUrl(user.avatarUrl);
  }, [user?.avatarUrl]);

  const joinedAt = useMemo(() => {
    if (!user?.createdAt) {
      return '最近加入';
    }

    return new Date(user.createdAt).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }, [user?.createdAt]);

  const handleProfileSave = async () => {
    try {
      const values = await profileForm.validateFields();
      setProfileSaving(true);
      const nextUser = await authApi.updateProfile({
        username: values.username,
      });
      setUser(nextUser);
      message.success('账户资料已更新');
    } catch (error: unknown) {
      if (hasFormErrors(error)) {
        return;
      }
      message.error(resolveErrorMessage(error, '账户资料更新失败'));
    } finally {
      setProfileSaving(false);
    }
  };

  const handleAvatarUpload = async (file: File) => {
    try {
      setAvatarSaving(true);
      const uploaded = await uploadFile(file);
      const nextUser = await authApi.updateProfile({
        avatarUrl: uploaded.url,
      });
      setUser(nextUser);
      message.success('头像已更新');
    } catch (error: unknown) {
      message.error(resolveErrorMessage(error, '头像上传失败'));
    } finally {
      setAvatarSaving(false);
    }

    return false;
  };

  const handlePasswordSave = async () => {
    try {
      const values = await passwordForm.validateFields();
      setPasswordSaving(true);
      await authApi.changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      passwordForm.resetFields();
      message.success('密码修改成功');
    } catch (error: unknown) {
      if (hasFormErrors(error)) {
        return;
      }
      message.error(resolveErrorMessage(error, '密码修改失败'));
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary" style={{ backgroundImage: 'var(--surface-page)' }}>
      <WorkspaceHeader active="settings" />

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[36px] border border-border-light px-8 py-9 shadow-[0_28px_100px_rgba(15,23,42,0.10)] backdrop-blur-2xl" style={{ backgroundImage: 'var(--surface-muted)' }}>
          <div className="pointer-events-none absolute -left-12 top-[-54px] h-40 w-40 rounded-full blur-3xl" style={{ backgroundColor: 'var(--theme-primary-soft)' }} />
          <div className="pointer-events-none absolute right-10 top-[-32px] h-32 w-32 rounded-full blur-3xl" style={{ backgroundColor: 'var(--theme-primary-muted)' }} />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-28" style={{ background: 'linear-gradient(90deg, var(--theme-primary-muted), transparent)' }} />
          <div className="pointer-events-none absolute inset-x-10 bottom-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, var(--theme-primary-muted), transparent)' }} />

          <div className="relative flex flex-col gap-5">
            <span className="w-fit rounded-full border border-border-light bg-bg-secondary/85 px-3 py-1 text-xs font-medium tracking-[0.18em] text-accent shadow-soft">
              ACCOUNT CENTER
            </span>
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h2 className="text-3xl font-semibold tracking-tight text-text-primary sm:text-[2.35rem]">
                  个人设置
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-text-secondary">
                  管理头像、账户资料与安全信息。页面视觉已升级为账户中心布局，让概览、设置和身份信息形成统一层级。
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:w-auto">
                <div className="rounded-2xl border border-border-light bg-bg-secondary/70 px-4 py-3 shadow-soft backdrop-blur">
                  <div className="text-[11px] uppercase tracking-[0.16em] text-text-secondary/70">
                    资料模块
                  </div>
                  <div className="mt-2 text-sm font-semibold text-text-primary">账户资料</div>
                </div>
                <div className="rounded-2xl border border-border-light bg-bg-secondary/70 px-4 py-3 shadow-soft backdrop-blur">
                  <div className="text-[11px] uppercase tracking-[0.16em] text-text-secondary/70">
                    安全模块
                  </div>
                  <div className="mt-2 text-sm font-semibold text-text-primary">密码管理</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
          <div className="space-y-6">
            <Card
              bordered={false}
              className="overflow-hidden rounded-[32px] border border-border-light bg-bg-secondary/75 shadow-[0_24px_72px_rgba(15,23,42,0.09)] backdrop-blur-xl"
            >
              <div className="relative overflow-hidden rounded-[28px] p-6" style={{ backgroundImage: 'var(--surface-hero)' }}>
                <div className="pointer-events-none absolute -left-12 top-[-42px] h-36 w-36 rounded-full blur-3xl" style={{ backgroundColor: 'var(--theme-primary-soft)' }} />
                <div className="pointer-events-none absolute -right-10 top-6 h-28 w-28 rounded-full blur-3xl" style={{ backgroundColor: 'var(--theme-primary-muted)' }} />
                <div className="pointer-events-none absolute inset-x-6 top-0 h-24 rounded-b-[28px]" style={{ background: 'linear-gradient(90deg, var(--theme-primary-soft), transparent)' }} />

                <div className="relative flex flex-col items-center text-center">
                  <span className="mb-5 rounded-full border border-border-light bg-bg-secondary/90 px-3 py-1 text-[11px] font-medium tracking-[0.18em] text-text-secondary shadow-soft">
                    PROFILE OVERVIEW
                  </span>
                  <div className="relative">
                    <Avatar
                      size={112}
                      src={avatarUrl}
                      className="text-3xl font-semibold text-white shadow-[0_26px_56px_rgba(15,23,42,0.18)] ring-4 ring-white"
                      style={{ backgroundImage: 'linear-gradient(135deg, rgb(var(--color-primary)), rgb(var(--color-primary-hover)))' }}
                    >
                      {user?.username?.trim().charAt(0).toUpperCase() || 'U'}
                    </Avatar>
                    <div className="pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.35),transparent_42%)]" />
                    <div className="absolute -bottom-2 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full border border-border-light bg-bg-secondary/90 px-3 py-1 text-[11px] font-medium text-text-secondary shadow-soft">
                      <CameraOutlined />
                      头像
                    </div>
                  </div>

                  <div className="mt-9">
                    <h3 className="text-[30px] font-semibold tracking-tight text-text-primary">
                      {user?.username ?? '未登录用户'}
                    </h3>
                    <p className="mt-2 text-sm text-text-secondary">{user?.email ?? '暂无邮箱'}</p>
                    <div className="mx-auto mt-4 h-px w-20" style={{ background: 'linear-gradient(90deg, transparent, var(--theme-primary-muted), transparent)' }} />
                  </div>

                  <div className="mt-6 grid w-full grid-cols-2 gap-3 text-left">
                    <div className="rounded-2xl border border-border-light bg-bg-secondary/70 px-4 py-3 shadow-soft">
                      <div className="text-[11px] uppercase tracking-[0.16em] text-text-secondary/70">
                        账户状态
                      </div>
                      <div className="mt-2 text-sm font-medium text-text-primary">已登录</div>
                    </div>
                    <div className="rounded-2xl border border-border-light bg-bg-secondary/70 px-4 py-3 shadow-soft">
                      <div className="text-[11px] uppercase tracking-[0.16em] text-text-secondary/70">
                        加入时间
                      </div>
                      <div className="mt-2 text-sm font-medium text-text-primary">{joinedAt}</div>
                    </div>
                  </div>

                  <Upload
                    showUploadList={false}
                    accept="image/png,image/jpeg,image/gif,image/svg+xml,image/webp"
                    beforeUpload={handleAvatarUpload}
                    className="mt-6 w-full"
                  >
                    <Button
                      icon={<UploadOutlined />}
                      loading={avatarSaving}
                      className="h-10 w-full rounded-2xl border-border-light bg-bg-secondary/90 px-4 font-medium text-text-primary shadow-soft hover:!border-border-light hover:!text-accent"
                    >
                      上传新头像
                    </Button>
                  </Upload>

                  <div className="mt-4 flex w-full items-center justify-between rounded-2xl border border-border-light bg-bg-secondary/75 px-4 py-3 text-left shadow-soft">
                    <div>
                      <div className="text-xs font-medium text-text-primary">头像上传规范</div>
                      <div className="mt-1 text-[11px] text-text-secondary/70">
                        JPG、PNG、WEBP、GIF、SVG，最大 5MB
                      </div>
                    </div>
                    <div className="rounded-full px-2.5 py-1 text-[11px] font-medium text-accent" style={{ backgroundColor: 'var(--theme-primary-soft)' }}>
                      实时更新
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card
              bordered={false}
              className="rounded-[28px] border border-border-light bg-bg-secondary/78 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl"
            >
              <div className="mb-6 flex items-start gap-4 border-b border-border-light pb-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl text-accent shadow-inner" style={{ backgroundColor: 'var(--theme-primary-soft)' }}>
                  <UserOutlined />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-text-primary">账户资料</h3>
                  <p className="mt-1 text-sm leading-6 text-text-secondary">
                    管理你的公开身份信息。邮箱当前仅用于展示，用户名可随时更新。
                  </p>
                </div>
              </div>

              <Form form={profileForm} layout="vertical" className="[&_.ant-form-item-label>label]:font-medium [&_.ant-form-item-label>label]:text-text-primary">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Form.Item
                    name="username"
                    label="用户名"
                    rules={[
                      { required: true, message: '请输入用户名' },
                      { min: 4, message: '用户名至少需要4个字符' },
                      { max: 20, message: '用户名最多20个字符' },
                    ]}
                  >
                    <Input
                      placeholder="请输入用户名"
                      className="h-10 rounded-2xl border-border-light bg-bg-primary/70 px-4 shadow-none hover:border-border-light focus:border-accent"
                    />
                  </Form.Item>

                  <Form.Item label="邮箱">
                    <Input
                      value={user?.email ?? ''}
                      readOnly
                      prefix={<MailOutlined className="text-text-secondary/70" />}
                      className="h-10 rounded-2xl border-border-light bg-bg-primary/70 px-4 shadow-none"
                    />
                  </Form.Item>
                </div>

                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  loading={profileSaving}
                  onClick={() => void handleProfileSave()}
                  className="mt-2 h-10 rounded-2xl border-0 px-5 font-medium text-white shadow-[0_10px_22px_rgba(15,23,42,0.18)] hover:!text-white"
                  style={{ background: 'linear-gradient(135deg, rgb(var(--color-primary)), rgb(var(--color-primary-hover)))' }}
                >
                  保存资料
                </Button>
              </Form>
            </Card>

            <Card
              bordered={false}
              className="rounded-[28px] border border-border-light bg-bg-secondary/78 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl"
            >
              <div className="mb-6 flex items-start gap-4 border-b border-border-light pb-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl text-success shadow-inner" style={{ backgroundColor: 'var(--theme-success-soft)' }}>
                  <LockOutlined />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-text-primary">安全设置</h3>
                  <p className="mt-1 text-sm leading-6 text-text-secondary">
                    修改密码前需要校验当前密码，建议使用更强的新密码以提升账户安全性。
                  </p>
                </div>
              </div>

              <Form form={passwordForm} layout="vertical" className="[&_.ant-form-item-label>label]:font-medium [&_.ant-form-item-label>label]:text-text-primary">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Form.Item
                    name="currentPassword"
                    label="当前密码"
                    rules={[{ required: true, message: '请输入当前密码' }]}
                  >
                    <Input.Password
                      placeholder="请输入当前密码"
                      className="h-10 rounded-2xl border-border-light bg-bg-primary/70 px-4 shadow-none hover:border-border-light focus:border-accent"
                    />
                  </Form.Item>

                  <div className="hidden md:block" />

                  <Form.Item
                    name="newPassword"
                    label="新密码"
                    rules={[
                      { required: true, message: '请输入新密码' },
                      { min: 8, message: '密码至少需要8位字符' },
                    ]}
                  >
                    <Input.Password
                      placeholder="请输入新密码"
                      className="h-10 rounded-2xl border-border-light bg-bg-primary/70 px-4 shadow-none hover:border-border-light focus:border-accent"
                    />
                  </Form.Item>

                  <Form.Item
                    name="confirmPassword"
                    label="确认新密码"
                    dependencies={['newPassword']}
                    rules={[
                      { required: true, message: '请再次输入新密码' },
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          if (!value || getFieldValue('newPassword') === value) {
                            return Promise.resolve();
                          }
                          return Promise.reject(new Error('两次输入的密码不一致'));
                        },
                      }),
                    ]}
                  >
                    <Input.Password
                      placeholder="请再次输入新密码"
                      className="h-10 rounded-2xl border-border-light bg-bg-primary/70 px-4 shadow-none hover:border-border-light focus:border-accent"
                    />
                  </Form.Item>
                </div>

                <Button
                  type="primary"
                  icon={<LockOutlined />}
                  loading={passwordSaving}
                  onClick={() => void handlePasswordSave()}
                  className="mt-2 h-10 rounded-2xl border-0 px-5 font-medium text-white shadow-[0_10px_22px_rgba(15,23,42,0.18)] hover:!text-white"
                  style={{ background: 'linear-gradient(135deg, rgb(var(--color-primary)), rgb(var(--color-primary-hover)))' }}
                >
                  更新密码
                </Button>
              </Form>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
