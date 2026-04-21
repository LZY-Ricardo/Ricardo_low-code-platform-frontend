import { beforeEach, describe, expect, it } from 'vitest';
import { useAiWorkbenchStore } from './ai-workbench';

beforeEach(() => {
  const storage = new Map<string, string>();
  Object.defineProperty(globalThis, 'localStorage', {
    value: {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => void storage.set(key, value),
      removeItem: (key: string) => void storage.delete(key),
    },
    configurable: true,
  });
});

beforeEach(() => {
  useAiWorkbenchStore.setState({
    activeTaskType: 'generate-page',
    status: 'idle',
    prompt: '',
    conversation: [],
    suggestions: [],
    history: [],
    lastError: null,
  });
});

describe('ai workbench store', () => {
  it('pushes conversation and history entries', () => {
    const store = useAiWorkbenchStore.getState();
    store.setPrompt('生成一个数据看板');
    store.pushConversation({ role: 'user', content: '生成一个数据看板' });
    store.pushConversation({ role: 'assistant', content: '已生成页面草稿' });
    store.pushHistory({ taskType: 'generate-page', summary: '已生成页面草稿' });

    const next = useAiWorkbenchStore.getState();
    expect(next.prompt).toBe('生成一个数据看板');
    expect(next.conversation).toHaveLength(2);
    expect(next.history).toHaveLength(1);
  });

  it('replaces suggestions and tracks status', () => {
    const store = useAiWorkbenchStore.getState();
    store.setStatus('running');
    store.setSuggestions([{ id: 's1', kind: 'generate-page', title: '页面草稿' }]);

    const next = useAiWorkbenchStore.getState();
    expect(next.status).toBe('running');
    expect(next.suggestions[0]?.title).toBe('页面草稿');
  });

  it('persists and hydrates workbench snapshot', () => {
    const store = useAiWorkbenchStore.getState();
    store.setPrompt('生成一个表单');
    store.pushHistory({ taskType: 'generate-page', summary: '已生成表单' });
    store.pushApplyLog({ kind: 'generate-page', title: '应用页面草稿' });
    store.persistSnapshot();

    useAiWorkbenchStore.setState({
      activeTaskType: 'generate-action',
      status: 'error',
      prompt: '',
      conversation: [],
      suggestions: [],
      history: [],
      applyLog: [],
      lastError: 'x',
    });

    useAiWorkbenchStore.getState().hydrateSnapshot();
    const next = useAiWorkbenchStore.getState();
    expect(next.prompt).toBe('生成一个表单');
    expect(next.history).toHaveLength(1);
    expect(next.applyLog).toHaveLength(1);
  });
});
