import { useEffect, useState } from 'react';
import { Alert, Spin } from 'antd';
import { useParams } from 'react-router-dom';
import { getPublishedPage } from '../api/publish';

export default function PublishedViewer() {
  const { publishUrl } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [html, setHtml] = useState('');

  useEffect(() => {
    const run = async () => {
      if (!publishUrl) {
        setError('发布地址无效');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const result = await getPublishedPage(publishUrl);
        document.title = result.title || '已发布页面';
        setHtml(result.html);
      } catch (err) {
        setError(err instanceof Error ? err.message : '页面加载失败');
      } finally {
        setLoading(false);
      }
    };

    void run();
  }, [publishUrl]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto flex min-h-screen max-w-3xl items-center px-6">
        <Alert type="error" message="加载失败" description={error} showIcon />
      </div>
    );
  }

  return (
    <iframe
      title={publishUrl || 'published-page'}
      srcDoc={html}
      sandbox="allow-scripts allow-forms allow-popups allow-modals"
      className="h-screen w-full border-0"
    />
  );
}
