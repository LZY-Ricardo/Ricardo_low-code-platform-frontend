import { describe, expect, it } from 'vitest';
import { previewBindingSuggestion } from './data-preview';
import type { DataSource } from '../stores/data-source';

const dataSources: DataSource[] = [
  {
    id: 'ds_users',
    name: '用户列表',
    resultKey: 'userList',
    method: 'GET',
    url: '/api/users',
  },
];

describe('data preview', () => {
  it('executes preview request for the suggested data source', async () => {
    const result = await previewBindingSuggestion(
      {
        componentId: 2,
        componentName: 'Table',
        bindings: { dataSource: 'requestResults.userList' },
        dataSourceId: 'ds_users',
        resultKey: 'userList',
        stateSuggestions: [],
      },
      dataSources,
      (async () =>
        ({
          ok: true,
          json: async () => [{ id: 1, name: '张三' }],
        } as Response)) as unknown as typeof fetch,
    );

    expect(result.resultKey).toBe('userList');
    expect(result.data).toEqual([{ id: 1, name: '张三' }]);
  });
});
