import { Button, Empty, List } from 'antd';
import type { AiSuggestionItem } from '../../stores/ai-workbench';

interface SuggestionListProps {
  items: AiSuggestionItem[];
  onRemove: (id: string) => void;
  onClearAll?: () => void;
}

export default function SuggestionList({ items, onRemove, onClearAll }: SuggestionListProps) {
  if (items.length === 0) {
    return <Empty description="当前没有待处理建议" image={Empty.PRESENTED_IMAGE_SIMPLE} />;
  }

  return (
    <div className="space-y-2">
      {onClearAll && (
        <div className="flex justify-end">
          <Button size="small" onClick={onClearAll}>
            清空建议
          </Button>
        </div>
      )}
      <List
        dataSource={items}
        renderItem={(item) => (
          <List.Item
            actions={[
              <Button key={`dismiss-${item.id}`} type="link" onClick={() => onRemove(item.id)}>
                忽略
              </Button>,
            ]}
          >
            <div className="space-y-1">
              <div className="font-medium text-text-primary">{item.title}</div>
              <div className="text-xs text-text-secondary">{item.kind}</div>
              {item.description && (
                <div className="text-sm text-text-secondary">{item.description}</div>
              )}
            </div>
          </List.Item>
        )}
      />
    </div>
  );
}
