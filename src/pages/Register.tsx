/**
 * 注册页面
 */
import { App as AntdApp, Form, Input, Button, Card } from 'antd';
import { UserOutlined, MailOutlined, LockOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/auth';
import { useEffect } from 'react';
import type { RegisterRequest } from '../types/api';

interface RegisterFormValues extends RegisterRequest {
  confirmPassword: string;
}

export default function Register() {
  const navigate = useNavigate();
  const { message } = AntdApp.useApp();
  const { register, loading, isAuthenticated } = useAuthStore();
  const [form] = Form.useForm();

  // 如果已登录，自动跳转到项目列表
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/projects', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleRegister = async (values: RegisterFormValues) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { confirmPassword, ...registerData } = values;
      await register(registerData);
      message.success('注册成功！请登录');
      navigate('/login');
    } catch (error) {
      // 错误已在 API 客户端拦截器中处理
      console.error('注册失败:', error);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4" style={{ backgroundImage: 'var(--surface-page)' }}>
      <Card className="w-full max-w-md border border-border-light bg-bg-secondary shadow-lg">
        <div className="text-center mb-8">
          <h1 className="mb-2 text-3xl font-bold text-text-primary">创建账户</h1>
          <p className="text-text-secondary">欢迎加入低代码编辑器</p>
        </div>

        <Form
          form={form}
          name="register"
          onFinish={handleRegister}
          autoComplete="off"
          size="large"
          scrollToFirstError
        >
          <Form.Item
            name="username"
            rules={[
              { required: true, message: '请输入用户名' },
              { min: 4, max: 20, message: '用户名长度4-20个字符' },
              {
                pattern: /^[a-zA-Z0-9_]+$/,
                message: '用户名只能包含字母、数字和下划线',
              },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="用户名（4-20个字符）"
              autoComplete="username"
            />
          </Form.Item>

          <Form.Item
            name="email"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入有效的邮箱地址' },
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="邮箱"
              autoComplete="email"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: '请输入密码' },
              { min: 8, max: 20, message: '密码长度8-20个字符' },
              {
                pattern: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]+$/,
                message: '密码必须包含字母和数字',
              },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="密码（8-20个字符，字母+数字）"
              autoComplete="new-password"
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            dependencies={['password']}
            rules={[
              { required: true, message: '请确认密码' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('两次输入的密码不一致'));
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="确认密码"
              autoComplete="new-password"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="w-full"
              loading={loading}
            >
              注册
            </Button>
          </Form.Item>

          <div className="text-center">
            <span className="text-text-secondary">已有账号？</span>
            <Link to="/login" className="ml-2 text-accent hover:text-accent-hover">
              去登录
            </Link>
          </div>
        </Form>
      </Card>
    </div>
  );
}
