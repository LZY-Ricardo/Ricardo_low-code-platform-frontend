/**
 * 登录页面
 */
import { App as AntdApp, Form, Input, Button, Card } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/auth';
import { useEffect } from 'react';
import type { LoginRequest } from '../types/api';

export default function Login() {
  const navigate = useNavigate();
  const { message } = AntdApp.useApp();
  const { login, loading, isAuthenticated } = useAuthStore();
  const [form] = Form.useForm();

  // 如果已登录，自动跳转到项目列表
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/projects', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async (values: LoginRequest) => {
    try {
      await login(values);
      message.success('登录成功！');
      navigate('/projects');
    } catch (error) {
      // 错误已在 API 客户端拦截器中处理
      console.error('登录失败:', error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Card className="w-full max-w-md shadow-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">低代码编辑器</h1>
          <p className="text-gray-600">欢迎回来，请登录您的账户</p>
        </div>

        <Form
          form={form}
          name="login"
          onFinish={handleLogin}
          autoComplete="off"
          size="large"
        >
          <Form.Item
            name="username"
            rules={[
              { required: true, message: '请输入用户名或邮箱' },
              { min: 3, message: '用户名至少3个字符' },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="用户名或邮箱"
              autoComplete="username"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: '请输入密码' },
              { min: 6, message: '密码至少6个字符' },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="密码"
              autoComplete="current-password"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="w-full"
              loading={loading}
            >
              登录
            </Button>
          </Form.Item>

          <div className="text-center">
            <span className="text-gray-600">还没有账号？</span>
            <Link to="/register" className="ml-2 text-blue-600 hover:text-blue-700">
              立即注册
            </Link>
          </div>
        </Form>
      </Card>
    </div>
  );
}
