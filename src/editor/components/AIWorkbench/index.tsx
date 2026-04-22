import { Button, Card, Empty, Input, List, Segmented, Typography, message } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { useAiWorkbenchStore, type AiWorkbenchTaskType } from '../../stores/ai-workbench';
import { useAiSessionStore } from '../../stores/ai-session';
import { useComponentsStore } from '../../stores/components';
import { useDataSourceStore } from '../../stores/data-source';
import { useRuntimeStateStore } from '../../stores/runtime-state';
import { useSharedStylesStore } from '../../stores/shared-styles';
import { useThemeStore } from '../../../stores/theme';
import { useProjectStore } from '../../stores/project';
import { bindData, editSelection, generateAction, generatePage, type ActionSuggestion } from '../../api/ai';
import { formatAiSourceLabel, stringifyAiResult } from '../../utils/ai-debug';
import { buildSelectionContext } from '../../utils/selection-context';
import { applyReplacePatch } from '../../utils/component-patch';
import { summarizeDataSources } from '../../utils/data-context';
import { previewBindingSuggestion } from '../../utils/data-preview';

const { Text } = Typography;
import { toComponentEvent } from '../../utils/action-draft';
import { analyzePageSuggestions } from '../../utils/insights';
import { findReusableStructures } from '../../utils/reuse-detector';
import { buildTemplatePageFromSubtree } from '../../utils/reusable-template';
import { useTemplateStore } from '../../../stores/template';
import TaskStatusBar from './TaskStatusBar';
import ConversationPanel from './ConversationPanel';
import SuggestionList from './SuggestionList';
import DataBindingSuggestionPanel from '../IntelligencePanel/DataBindingSuggestionPanel';
import ActionSuggestionPanel from '../IntelligencePanel/ActionSuggestionPanel';

const TASK_OPTIONS: Array<{ label: string; value: AiWorkbenchTaskType }> = [
  { label: '整页生成', value: 'generate-page' },
  { label: '局部修改', value: 'edit-selection' },
  { label: '数据绑定', value: 'bind-data' },
  { label: '动作建议', value: 'generate-action' },
];

export default function AIWorkbench() {
  const activeTaskType = useAiWorkbenchStore((state) => state.activeTaskType);
  const status = useAiWorkbenchStore((state) => state.status);
  const prompt = useAiWorkbenchStore((state) => state.prompt);
  const conversation = useAiWorkbenchStore((state) => state.conversation);
  const suggestions = useAiWorkbenchStore((state) => state.suggestions);
  const history = useAiWorkbenchStore((state) => state.history);
  const applyLog = useAiWorkbenchStore((state) => state.applyLog);
  const lastError = useAiWorkbenchStore((state) => state.lastError);
  const setActiveTaskType = useAiWorkbenchStore((state) => state.setActiveTaskType);
  const setStatus = useAiWorkbenchStore((state) => state.setStatus);
  const setPrompt = useAiWorkbenchStore((state) => state.setPrompt);
  const pushConversation = useAiWorkbenchStore((state) => state.pushConversation);
  const setSuggestions = useAiWorkbenchStore((state) => state.setSuggestions);
  const pushHistory = useAiWorkbenchStore((state) => state.pushHistory);
  const pushApplyLog = useAiWorkbenchStore((state) => state.pushApplyLog);
  const setLastError = useAiWorkbenchStore((state) => state.setLastError);
  const hydrateSnapshot = useAiWorkbenchStore((state) => state.hydrateSnapshot);
  const persistSnapshot = useAiWorkbenchStore((state) => state.persistSnapshot);
  const clearSession = useAiWorkbenchStore((state) => state.clearSession);
  const pushTurn = useAiSessionStore((state) => state.pushTurn);
  const conversationSummary = useAiSessionStore((state) => state.summary);
  const components = useComponentsStore((state) => state.components);
  const curComponentId = useComponentsStore((state) => state.curComponentId);
  const curComponent = useComponentsStore((state) => state.curComponent);
  const replaceComponents = useComponentsStore((state) => state.replaceComponents);
  const updateComponentBindings = useComponentsStore((state) => state.updateComponentBindings);
  const updateComponentEvents = useComponentsStore((state) => state.updateComponentEvents);
  const dataSources = useDataSourceStore((state) => state.dataSources);
  const variables = useRuntimeStateStore((state) => state.variables);
  const setRequestResult = useRuntimeStateStore((state) => state.setRequestResult);
  const sharedStyles = useSharedStylesStore((state) => state.sharedStyles);
  const currentThemeId = useThemeStore((state) => state.currentThemeId);
  const currentProject = useProjectStore((state) => state.currentProject);
  const createTemplate = useTemplateStore((state) => state.createTemplate);

  const [generateResult, setGenerateResult] = useState<Awaited<ReturnType<typeof generatePage>> | null>(null);
  const [editResult, setEditResult] = useState<Awaited<ReturnType<typeof editSelection>> | null>(null);
  const [bindResult, setBindResult] = useState<Awaited<ReturnType<typeof bindData>> | null>(null);
  const [actionResult, setActionResult] = useState<Awaited<ReturnType<typeof generateAction>> | null>(null);

  const selectionContext = useMemo(
    () => buildSelectionContext(components, curComponentId),
    [components, curComponentId],
  );
  const dataSourceSummary = useMemo(
    () => summarizeDataSources(dataSources),
    [dataSources],
  );
  const pageSuggestions = useMemo(() => analyzePageSuggestions(components), [components]);
  const reusableItems = useMemo(() => findReusableStructures(components), [components]);

  const activeTaskLabel = TASK_OPTIONS.find((item) => item.value === activeTaskType)?.label || activeTaskType;

  useEffect(() => {
    hydrateSnapshot();
  }, [hydrateSnapshot]);

  useEffect(() => {
    persistSnapshot();
  }, [prompt, conversation, suggestions, history, applyLog, persistSnapshot]);

  const syncSuggestionList = (
    generated: typeof generateResult,
    edited: typeof editResult,
    bound: typeof bindResult,
    actioned: typeof actionResult,
  ) => {
    const items = [
      generated ? { id: 'generate', kind: 'generate-page' as const, title: generated.summary } : null,
      edited ? { id: 'edit', kind: 'edit-selection' as const, title: edited.summary } : null,
      bound ? { id: 'bind', kind: 'bind-data' as const, title: bound.summary } : null,
      actioned ? { id: 'action', kind: 'generate-action' as const, title: actioned.summary } : null,
      ...pageSuggestions.map((item) => ({
        id: `insight-${item.code}`,
        kind: 'insight' as const,
        title: item.title,
        description: item.description,
      })),
      ...reusableItems.map((item, index) => ({
        id: `reuse-${index}`,
        kind: 'reuse' as const,
        title: `${item.sample.name} 重复 ${item.occurrenceIds.length} 次`,
      })),
    ].filter(Boolean);

    setSuggestions(items as any);
  };

  const runTask = async () => {
    const trimmedPrompt = prompt.trim();
    setStatus('running');
    setLastError(null);
    pushConversation({
      role: 'user',
      content: trimmedPrompt || `[${activeTaskType}]`,
      taskType: activeTaskType,
    });

    try {
      if (activeTaskType === 'generate-page') {
        if (!trimmedPrompt) {
          throw new Error('请输入页面描述');
        }
        const result = await generatePage({
          prompt: trimmedPrompt,
          components,
          currentThemeId,
          currentProjectId: currentProject?.id,
        });
        setGenerateResult(result);
        pushTurn({ mode: 'generate-page', prompt: trimmedPrompt, summary: result.summary });
        pushHistory({ taskType: 'generate-page', summary: result.summary });
        pushConversation({ role: 'assistant', content: result.summary, taskType: 'generate-page' });
        syncSuggestionList(result, editResult, bindResult, actionResult);
      } else if (activeTaskType === 'edit-selection') {
        if (!trimmedPrompt) {
          throw new Error('请输入修改需求');
        }
        if (!curComponentId || curComponentId === 1) {
          throw new Error('请先选中要修改的区块');
        }
        const result = await editSelection({
          prompt: trimmedPrompt,
          components,
          selectedComponentId: curComponentId,
          currentThemeId,
          currentProjectId: currentProject?.id,
          selectionSummary: selectionContext.summary,
          conversationSummary,
        });
        setEditResult(result);
        pushTurn({ mode: 'edit-selection', prompt: trimmedPrompt, summary: result.summary });
        pushHistory({ taskType: 'edit-selection', summary: result.summary });
        pushConversation({ role: 'assistant', content: result.summary, taskType: 'edit-selection' });
        syncSuggestionList(generateResult, result, bindResult, actionResult);
      } else if (activeTaskType === 'bind-data') {
        const result = await bindData({
          components,
          dataSources,
          prompt: trimmedPrompt || undefined,
          currentThemeId,
          currentProjectId: currentProject?.id,
          selectedComponentId: curComponentId ?? undefined,
          conversationSummary,
        });
        setBindResult(result);
        pushHistory({ taskType: 'bind-data', summary: result.summary });
        pushConversation({ role: 'assistant', content: result.summary, taskType: 'bind-data' });
        syncSuggestionList(generateResult, editResult, result, actionResult);
      } else {
        const result = await generateAction({
          components,
          dataSources,
          prompt: trimmedPrompt || undefined,
          currentThemeId,
          currentProjectId: currentProject?.id,
          selectedComponentId: curComponentId ?? undefined,
          conversationSummary,
        });
        setActionResult(result);
        pushHistory({ taskType: 'generate-action', summary: result.summary });
        pushConversation({ role: 'assistant', content: result.summary, taskType: 'generate-action' });
        syncSuggestionList(generateResult, editResult, bindResult, result);
      }

      setStatus('success');
    } catch (error) {
      const reason = error instanceof Error ? error.message : '任务执行失败';
      setStatus('error');
      setLastError(reason);
      pushConversation({ role: 'system', content: reason, taskType: activeTaskType });
      message.error(reason);
    }
  };

  const dismissSuggestion = (id: string) => {
    setSuggestions(suggestions.filter((item) => item.id !== id));
  };

  const clearSuggestions = () => {
    setSuggestions([]);
  };

  const applyGenerate = () => {
    if (!generateResult) return;
    replaceComponents(generateResult.patches);
    pushApplyLog({ kind: 'generate-page', title: '应用页面草稿' });
    message.success('已应用页面草稿');
    setGenerateResult(null);
    syncSuggestionList(null, editResult, bindResult, actionResult);
  };

  const applyEdit = () => {
    if (!editResult) return;
    replaceComponents(applyReplacePatch(components, editResult.targetComponentId, editResult.patch));
    pushApplyLog({ kind: 'edit-selection', title: `应用局部修改 #${editResult.targetComponentId}` });
    message.success('已应用局部修改');
    setEditResult(null);
    syncSuggestionList(generateResult, null, bindResult, actionResult);
  };

  const applyBinding = (componentId: number, bindings: Record<string, string>) => {
    updateComponentBindings(componentId, bindings);
    const dataSourceBinding = bindings.dataSource;
    if (typeof dataSourceBinding === 'string') {
      const resultKey = dataSourceBinding.replace('requestResults.', '');
      if (resultKey && !useRuntimeStateStore.getState().requestResults[resultKey]) {
        setRequestResult(resultKey, []);
      }
    }
    pushApplyLog({ kind: 'bind-data', title: `应用绑定 #${componentId}` });
    message.success(`已将绑定应用到组件 #${componentId}`);
  };

  const previewBinding = async (index: number) => {
    const suggestion = bindResult?.suggestions[index];
    if (!suggestion) return;
    try {
      const preview = await previewBindingSuggestion(suggestion, dataSources);
      setRequestResult(preview.resultKey, preview.data);
      message.success(`已验证 requestResults.${preview.resultKey}`);
    } catch (error) {
      message.error(error instanceof Error ? error.message : '预览失败');
    }
  };

  const applyAction = (suggestion: ActionSuggestion) => {
    updateComponentEvents(suggestion.componentId, {
      [suggestion.eventType]: toComponentEvent(suggestion),
    });
    pushApplyLog({ kind: 'generate-action', title: `应用动作 #${suggestion.componentId}/${suggestion.eventType}` });
    message.success(`已应用动作到组件 #${suggestion.componentId}`);
  };

  const applyAllBindings = () => {
    if (!bindResult) return;
    bindResult.suggestions.forEach((item) => applyBinding(item.componentId, item.bindings));
  };

  const applyAllActions = () => {
    if (!actionResult) return;
    actionResult.suggestions.forEach((item) => applyAction(item));
  };

  const saveReuse = async (index: number) => {
    const item = reusableItems[index];
    if (!item || !currentProject) return;
    const templateName = `${currentProject.name} 复用片段 ${index + 1}`;
    const templateComponents = buildTemplatePageFromSubtree(item.sample);
    const templatePages = [{
      id: `page_tpl_${Date.now()}`,
      name: '页面 1',
      components: templateComponents,
    }];

    try {
      await createTemplate({
        name: templateName,
        description: '由 AI 识别的重复结构自动提取',
        category: inferTemplateCategory(item.sample.name),
        components: templateComponents,
        pages: templatePages,
        dataSources,
        variables,
        sharedStyles,
        themeId: currentThemeId,
      });
      message.success('已提取到模板中心');
    } catch {
      message.error('模板中心保存失败，请稍后重试');
    }
  };

  return (
    <div className="space-y-4">
      <TaskStatusBar
        status={status}
        activeTaskLabel={activeTaskLabel}
        lastError={lastError}
        onClearSession={clearSession}
      />

      <Card size="small" title="AI 工作台">
        <div className="space-y-3">
          <Segmented
            value={activeTaskType}
            options={TASK_OPTIONS}
            block
            onChange={(value) => setActiveTaskType(value as AiWorkbenchTaskType)}
          />
          <Input.TextArea
            rows={4}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="输入你的页面需求或修改指令"
          />
          <div className="flex gap-2">
            <Button type="primary" loading={status === 'running'} onClick={() => void runTask()}>
              运行当前任务
            </Button>
            <Button onClick={() => setPrompt('')}>清空输入</Button>
          </div>
          <div className="rounded-lg border border-border-light bg-bg-secondary p-3 text-xs text-text-secondary">
            <div className="font-medium text-text-primary">数据源摘要</div>
            <pre className="mt-1 whitespace-pre-wrap break-all">{dataSourceSummary}</pre>
          </div>
          {curComponent && curComponentId !== 1 && (
            <div className="rounded-lg border border-border-light bg-bg-secondary p-3 text-xs text-text-secondary">
              <div className="font-medium text-text-primary">当前选中区块</div>
              <div>{selectionContext.summary}</div>
            </div>
          )}
        </div>
      </Card>

      <Card size="small" title="会话记录">
        <ConversationPanel items={conversation} />
      </Card>

      <Card size="small" title="建议列表">
        <SuggestionList items={suggestions} onRemove={dismissSuggestion} onClearAll={clearSuggestions} />
      </Card>

      {generateResult && (
        <Card size="small" title="页面草稿">
          <div className="space-y-2">
            <div className="text-sm font-medium text-text-primary">{generateResult.summary}</div>
            <div className="text-xs text-text-secondary">来源：{formatAiSourceLabel(generateResult)}</div>
            <pre className="text-xs whitespace-pre-wrap break-all">{stringifyAiResult(generateResult)}</pre>
            <div className="flex gap-2">
              <Button type="primary" onClick={applyGenerate}>应用页面草稿</Button>
              <Button onClick={() => setGenerateResult(null)}>关闭</Button>
            </div>
          </div>
        </Card>
      )}

      {editResult && (
        <Card size="small" title="局部修改草稿">
          <div className="space-y-2">
            <div className="text-sm font-medium text-text-primary">{editResult.summary}</div>
            <div className="text-xs text-text-secondary">来源：{formatAiSourceLabel(editResult)}</div>
            <pre className="text-xs whitespace-pre-wrap break-all">{stringifyAiResult(editResult)}</pre>
            <div className="flex gap-2">
              <Button type="primary" onClick={applyEdit}>应用局部修改</Button>
              <Button onClick={() => setEditResult(null)}>关闭</Button>
            </div>
          </div>
        </Card>
      )}

      <DataBindingSuggestionPanel
        result={bindResult}
        components={components}
        dataSources={dataSources}
        onApplySuggestion={applyBinding}
        onApplyAll={applyAllBindings}
        onPreviewSuggestion={previewBinding}
        onDismiss={() => setBindResult(null)}
      />

      <ActionSuggestionPanel
        result={actionResult}
        components={components}
        dataSources={dataSources}
        onApplySuggestion={applyAction}
        onApplyAll={applyAllActions}
        onDismiss={() => setActionResult(null)}
      />

      <Card size="small" title="历史任务">
        {history.length > 0 ? (
          <List
            dataSource={[...history].reverse()}
            renderItem={(item: typeof history[number]) => (
              <List.Item>
                <div>
                  <div className="font-medium text-text-primary">{item.taskType}</div>
                  <div className="text-sm text-text-secondary">{item.summary}</div>
                </div>
              </List.Item>
            )}
          />
        ) : (
          <Empty description="当前没有历史任务" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        )}
      </Card>

      <Card size="small" title="应用日志">
        {applyLog.length > 0 ? (
          <List
            dataSource={[...applyLog].reverse()}
            renderItem={(item: typeof applyLog[number]) => (
              <List.Item>
                <div>
                  <div className="font-medium text-text-primary">{item.kind}</div>
                  <div className="text-sm text-text-secondary">{item.title}</div>
                </div>
              </List.Item>
            )}
          />
        ) : (
          <Empty description="当前没有应用日志" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        )}
      </Card>

      <Card size="small" title="页面优化建议">
        {pageSuggestions.length > 0 ? (
          <List
            dataSource={pageSuggestions}
            renderItem={(item: typeof pageSuggestions[number]) => (
              <List.Item>
                <div>
                  <div className="font-medium text-text-primary">{item.title}</div>
                  <div className="text-sm text-text-secondary">{item.description}</div>
                </div>
              </List.Item>
            )}
          />
        ) : (
          <Empty description="当前页面没有明显问题" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        )}
      </Card>

      <Card size="small" title="复用结构识别">
        {reusableItems.length > 0 ? (
          <List
            dataSource={reusableItems}
            renderItem={(item: typeof reusableItems[number], index: number) => (
              <List.Item
                actions={[
                  <Button key="save" type="link" onClick={() => void saveReuse(index)}>
                    提取为模板
                  </Button>,
                ]}
              >
                <div>
                  <div className="font-medium text-text-primary">{item.sample.name}</div>
                  <Text type="secondary">{`重复出现 ${item.occurrenceIds.length} 次`}</Text>
                </div>
              </List.Item>
            )}
          />
        ) : (
          <Empty description="未发现可复用结构" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        )}
      </Card>
    </div>
  );
}

function inferTemplateCategory(componentName: string): 'general' | 'form' | 'dashboard' | 'landing' | 'layout' {
  if (componentName === 'Form') {
    return 'form';
  }

  if (componentName === 'Chart' || componentName === 'Table') {
    return 'dashboard';
  }

  if (componentName === 'Container') {
    return 'layout';
  }

  return 'general';
}
