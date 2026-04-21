import { beforeEach, describe, expect, it, vi } from 'vitest';

const post = vi.fn();

vi.mock('../../api/client', () => ({
  aiClient: {
    post,
  },
}));

describe('editor ai api', () => {
  beforeEach(() => {
    post.mockReset();
  });

  it('maps generate page response payload', async () => {
    post.mockResolvedValue({
      data: {
        code: 0,
        message: '生成成功',
        data: {
          taskType: 'generate-page',
          summary: '生成了页面',
          patches: [{ id: 1, name: 'Page', props: {}, desc: '页面' }],
          warnings: [],
          confidence: 0.88,
          source: 'openrouter',
          sourceModel: 'nvidia/demo',
        },
      },
    });

    const { generatePage } = await import('./ai');
    const result = await generatePage({
      prompt: '生成一个活动报名页',
      components: [],
      currentThemeId: 'ocean',
    });

    expect(post).toHaveBeenCalledWith('/ai/generate-page', {
      prompt: '生成一个活动报名页',
      components: [],
      currentThemeId: 'ocean',
    });
    expect(result.taskType).toBe('generate-page');
    expect(result.patches[0]?.name).toBe('Page');
    expect(result.source).toBe('openrouter');
  });

  it('maps edit selection response payload', async () => {
    post.mockResolvedValue({
      data: {
        code: 0,
        message: '修改成功',
        data: {
          taskType: 'edit-selection',
          summary: '已修改选区',
          targetComponentId: 2,
          operation: 'replace',
          patch: { id: 9, name: 'Form', props: {}, desc: '表单' },
          warnings: [],
          confidence: 0.77,
          source: 'openrouter',
          sourceModel: 'nvidia/demo',
        },
      },
    });

    const { editSelection } = await import('./ai');
    const result = await editSelection({
      prompt: '把这个区块改成表单',
      components: [],
      selectedComponentId: 2,
      currentThemeId: 'ocean',
      selectionSummary: '当前选中 Button',
      conversationSummary: '上一轮已生成页面',
    });

    expect(post).toHaveBeenCalledWith('/ai/edit-selection', {
      prompt: '把这个区块改成表单',
      components: [],
      selectedComponentId: 2,
      currentThemeId: 'ocean',
      selectionSummary: '当前选中 Button',
      conversationSummary: '上一轮已生成页面',
    });
    expect(result.taskType).toBe('edit-selection');
    expect(result.targetComponentId).toBe(2);
  });

  it('maps bind data response payload', async () => {
    post.mockResolvedValue({
      data: {
        code: 0,
        message: '绑定建议生成成功',
        data: {
          taskType: 'bind-data',
          summary: '已生成绑定建议',
          suggestions: [
            {
              componentId: 3,
              componentName: 'Table',
              bindings: { dataSource: 'requestResults.userList' },
              stateSuggestions: ['建议补充空状态'],
            },
          ],
          warnings: [],
          confidence: 0.8,
          source: 'fallback',
          fallbackReason: 'openrouter_not_configured',
        },
      },
    });

    const { bindData } = await import('./ai');
    const result = await bindData({
      components: [],
      dataSources: [],
      currentThemeId: 'ocean',
    });

    expect(result.taskType).toBe('bind-data');
    expect(result.suggestions[0]?.componentName).toBe('Table');
  });

  it('maps generate action response payload', async () => {
    post.mockResolvedValue({
      data: {
        code: 0,
        message: '动作建议生成成功',
        data: {
          taskType: 'generate-action',
          summary: '已生成动作建议',
          suggestions: [
            {
              componentId: 6,
              eventType: 'onClick',
              actionType: 'callAPI',
              actionConfig: { dataSourceId: 'ds_1' },
              reason: '点击后请求接口',
            },
          ],
          warnings: [],
          confidence: 0.79,
          source: 'fallback',
          fallbackReason: 'openrouter_not_configured',
        },
      },
    });

    const { generateAction } = await import('./ai');
    const result = await generateAction({
      components: [],
      dataSources: [],
      currentThemeId: 'ocean',
    });

    expect(result.taskType).toBe('generate-action');
    expect(result.suggestions[0]?.actionType).toBe('callAPI');
  });
});
