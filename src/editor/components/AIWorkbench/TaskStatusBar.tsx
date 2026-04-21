import { Alert, Button, Tag } from 'antd';
import type { AiWorkbenchStatus } from '../../stores/ai-workbench';

interface TaskStatusBarProps {
  status: AiWorkbenchStatus;
  activeTaskLabel: string;
  lastError: string | null;
  onClearSession: () => void;
}

export default function TaskStatusBar({
  status,
  activeTaskLabel,
  lastError,
  onClearSession,
}: TaskStatusBarProps) {
  const color =
    status === 'running'
      ? 'processing'
      : status === 'success'
        ? 'success'
        : status === 'error'
          ? 'error'
          : 'default';

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Tag color={color}>{activeTaskLabel}</Tag>
          <span className="text-xs text-text-secondary">状态：{status}</span>
        </div>
        <Button size="small" onClick={onClearSession}>
          清空会话
        </Button>
      </div>
      {lastError && (
        <Alert
          type="error"
          showIcon
          message="最近一次任务失败"
          description={lastError}
        />
      )}
    </div>
  );
}
