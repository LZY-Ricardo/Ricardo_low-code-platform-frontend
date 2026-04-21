import { Empty } from 'antd';
import type { AiConversationItem } from '../../stores/ai-workbench';

interface ConversationPanelProps {
  items: AiConversationItem[];
}

export default function ConversationPanel({ items }: ConversationPanelProps) {
  if (items.length === 0) {
    return <Empty description="当前会话还没有消息" image={Empty.PRESENTED_IMAGE_SIMPLE} />;
  }

  return (
    <div className="space-y-2">
      {items.map((item, index) => (
        <div
          key={`${item.role}-${index}`}
          className={`rounded-lg border p-3 text-sm ${
            item.role === 'user'
              ? 'border-blue-200 bg-blue-50'
              : item.role === 'assistant'
                ? 'border-emerald-200 bg-emerald-50'
                : 'border-border-light bg-bg-secondary'
          }`}
        >
          <div className="mb-1 text-xs text-text-secondary">
            {item.role}
            {item.taskType ? ` / ${item.taskType}` : ''}
          </div>
          <div className="whitespace-pre-wrap break-all text-text-primary">{item.content}</div>
        </div>
      ))}
    </div>
  );
}
