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
          className="rounded-lg border p-3 text-sm"
          style={
            item.role === 'user'
              ? {
                  borderColor: 'var(--theme-primary-muted)',
                  backgroundColor: 'var(--theme-primary-soft)',
                }
              : item.role === 'assistant'
                ? {
                    borderColor: 'rgba(var(--color-success), 0.22)',
                    backgroundColor: 'var(--theme-success-soft)',
                  }
                : undefined
          }
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
