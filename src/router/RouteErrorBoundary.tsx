import { Button, Result } from 'antd';
import { useMemo } from 'react';
import { isRouteErrorResponse, useNavigate, useRouteError } from 'react-router-dom';

export default function RouteErrorBoundary() {
  const error = useRouteError();
  const navigate = useNavigate();

  const message = useMemo(() => {
    if (isRouteErrorResponse(error)) {
      return error.statusText || '页面发生异常';
    }

    if (error instanceof Error) {
      return error.message;
    }

    return '页面发生异常';
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <Result
        status="error"
        title="页面加载失败"
        subTitle={message}
        extra={[
          <Button key="projects" type="primary" onClick={() => navigate('/projects')}>
            返回项目列表
          </Button>,
          <Button key="reload" onClick={() => window.location.reload()}>
            重新加载
          </Button>,
        ]}
      />
    </div>
  );
}
