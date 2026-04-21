import { Button, Empty, List } from 'antd';
import type { BindDataResult } from '../../api/ai';
import { formatAiSourceLabel } from '../../utils/ai-debug';
import type { DataSource } from '../../stores/data-source';
import type { Component } from '../../stores/components';
import { validateBindDataSuggestion } from '../../utils/suggestion-validation';

interface DataBindingSuggestionPanelProps {
  result: BindDataResult | null;
  components: Component[];
  dataSources: DataSource[];
  onApplySuggestion: (componentId: number, bindings: Record<string, string>) => void;
  onApplyAll: () => void;
  onPreviewSuggestion: (index: number) => void;
  onDismiss: () => void;
}

export default function DataBindingSuggestionPanel({
  result,
  components,
  dataSources,
  onApplySuggestion,
  onApplyAll,
  onPreviewSuggestion,
  onDismiss,
}: DataBindingSuggestionPanelProps) {
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
            批量应用有效绑定
          </Button>
        </div>
      )}
      {result.suggestions.length > 0 ? (
        <List
          dataSource={result.suggestions}
          renderItem={(item, index) => {
            const validation = validateBindDataSuggestion(item, components, dataSources);
            return (
            <List.Item
              actions={[
                <Button
                  key={`apply-binding-${item.componentId}`}
                  type="link"
                  disabled={!validation.valid}
                  onClick={() => onApplySuggestion(item.componentId, item.bindings)}
                >
                  应用绑定
                </Button>,
                <Button
                  key={`preview-binding-${item.componentId}`}
                  type="link"
                  disabled={!validation.valid}
                  onClick={() => onPreviewSuggestion(index)}
                >
                  验证并预览
                </Button>,
              ]}
            >
              <div className="space-y-1">
                <div className="font-medium text-text-primary">
                  #{item.componentId} {item.componentName}
                </div>
                <div className="text-xs text-text-secondary">
                  {Object.entries(item.bindings).map(([key, value]) => `${key} -> ${value}`).join('；')}
                </div>
                {!validation.valid && (
                  <div className="text-xs text-red-500">{validation.reason}</div>
                )}
                {item.stateSuggestions.length > 0 && (
                  <ul className="list-disc pl-5 text-xs text-text-secondary">
                    {item.stateSuggestions.map((suggestion) => (
                      <li key={suggestion}>{suggestion}</li>
                    ))}
                  </ul>
                )}
              </div>
            </List.Item>
          )}}
        />
      ) : (
        <Empty description="当前没有可应用的数据绑定建议" image={Empty.PRESENTED_IMAGE_SIMPLE} />
      )}
      <Button onClick={onDismiss}>关闭</Button>
    </div>
  );
}
