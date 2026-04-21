import { Button, Empty, List } from 'antd';
import type { ActionSuggestion, GenerateActionResult } from '../../api/ai';
import { formatAiSourceLabel } from '../../utils/ai-debug';
import type { DataSource } from '../../stores/data-source';
import type { Component } from '../../stores/components';
import { validateActionSuggestion } from '../../utils/suggestion-validation';

interface ActionSuggestionPanelProps {
  result: GenerateActionResult | null;
  components: Component[];
  dataSources: DataSource[];
  onApplySuggestion: (suggestion: ActionSuggestion) => void;
  onApplyAll: () => void;
  onDismiss: () => void;
}

export default function ActionSuggestionPanel({
  result,
  components,
  dataSources,
  onApplySuggestion,
  onApplyAll,
  onDismiss,
}: ActionSuggestionPanelProps) {
  if (!result) {
    return null;
  }

  return (
    <div className="rounded-lg border border-border-light bg-bg-secondary p-3 space-y-2">
      <div className="text-sm font-medium text-text-primary">{result.summary}</div>
      <div className="text-xs text-text-secondary">来源：{formatAiSourceLabel(result)}</div>
      {result.suggestions.length > 1 && (
        <div className="flex justify-end">
          <Button size="small" type="primary" onClick={onApplyAll}>
            批量应用有效动作
          </Button>
        </div>
      )}
      {result.suggestions.length > 0 ? (
        <List
          dataSource={result.suggestions}
          renderItem={(item) => {
            const validation = validateActionSuggestion(item, components, dataSources);
            return (
            <List.Item
              actions={[
                <Button
                  key={`apply-action-${item.componentId}`}
                  type="link"
                  disabled={!validation.valid}
                  onClick={() => onApplySuggestion(item)}
                >
                  应用动作
                </Button>,
              ]}
            >
              <div className="space-y-1">
                <div className="font-medium text-text-primary">
                  #{item.componentId} / {item.eventType} / {item.actionType}
                </div>
                <div className="text-xs text-text-secondary">{item.reason}</div>
                {!validation.valid && (
                  <div className="text-xs text-red-500">{validation.reason}</div>
                )}
                <pre className="text-xs text-text-secondary whitespace-pre-wrap break-all">
                  {JSON.stringify(item.actionConfig, null, 2)}
                </pre>
              </div>
            </List.Item>
          )}}
        />
      ) : (
        <Empty description="当前没有可应用的动作链建议" image={Empty.PRESENTED_IMAGE_SIMPLE} />
      )}
      <Button onClick={onDismiss}>关闭</Button>
    </div>
  );
}
