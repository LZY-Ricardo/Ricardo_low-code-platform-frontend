import { beforeEach, describe, expect, it } from 'vitest';
import { useAiSessionStore } from './ai-session';

beforeEach(() => {
  useAiSessionStore.setState({
    turns: [],
    summary: '',
  });
});

describe('ai session store', () => {
  it('keeps recent turns and updates summary', () => {
    const store = useAiSessionStore.getState();
    store.pushTurn({ mode: 'generate-page', prompt: '生成看板', summary: '已生成看板' });
    store.pushTurn({ mode: 'edit-selection', prompt: '改成表单', summary: '已改成表单' });

    const next = useAiSessionStore.getState();
    expect(next.turns).toHaveLength(2);
    expect(next.summary).toContain('生成看板');
    expect(next.summary).toContain('改成表单');
  });
});
