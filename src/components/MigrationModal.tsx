/**
 * LocalStorage 数据迁移提示弹窗
 */
import { useState } from 'react';
import { Modal, Button, message, Progress, Alert } from 'antd';
import { CloudUploadOutlined, CloseOutlined } from '@ant-design/icons';
import {
  isMigrated,
  hasLocalProjects,
  getLocalProjectCount,
  migrateLocalProjects,
} from '../utils/migration';

interface MigrationModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function MigrationModal({
  visible,
  onClose,
  onSuccess,
}: MigrationModalProps) {
  const [migrating, setMigrating] = useState(false);
  const [progress, setProgress] = useState(0);

  // 检查是否需要显示迁移提示
  const shouldShowMigration = !isMigrated() && hasLocalProjects();
  const projectCount = getLocalProjectCount();

  // 执行迁移
  const handleMigrate = async () => {
    setMigrating(true);
    setProgress(30);

    try {
      const result = await migrateLocalProjects();
      setProgress(100);

      if (result.success) {
        message.success(
          `成功迁移 ${result.imported} 个项目${
            result.failed > 0 ? `，${result.failed} 个失败` : ''
          }`
        );
        onSuccess?.();
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        message.error(`迁移失败：${result.error || '未知错误'}`);
        setMigrating(false);
        setProgress(0);
      }
    } catch {
      message.error('迁移过程出错，请稍后重试');
      setMigrating(false);
      setProgress(0);
    }
  };

  // 稍后迁移
  const handleSkip = () => {
    onClose();
  };

  if (!shouldShowMigration) {
    return null;
  }

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <CloudUploadOutlined className="text-accent" />
          <span>检测到本地项目</span>
        </div>
      }
      open={visible}
      footer={null}
      closable={!migrating}
      onCancel={handleSkip}
      maskClosable={!migrating}
    >
      <div className="py-4">
        <Alert
          message={`检测到 ${projectCount} 个本地项目`}
          description="为了能够跨设备访问和保护您的数据，建议将本地项目迁移到云端。迁移后您可以在任何设备上访问这些项目。"
          type="info"
          showIcon
          className="mb-4"
        />

        {migrating && (
          <div className="mb-4">
            <Progress percent={progress} status="active" />
            <p className="mt-2 text-center text-sm text-text-secondary">
              正在迁移项目到云端...
            </p>
          </div>
        )}

        <div className="flex gap-2 justify-end">
          <Button
            icon={<CloseOutlined />}
            onClick={handleSkip}
            disabled={migrating}
          >
            稍后迁移
          </Button>
          <Button
            type="primary"
            icon={<CloudUploadOutlined />}
            onClick={handleMigrate}
            loading={migrating}
          >
            {migrating ? '迁移中...' : '立即迁移'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
