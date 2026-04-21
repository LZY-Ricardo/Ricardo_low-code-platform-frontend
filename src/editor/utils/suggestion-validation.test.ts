import { describe, expect, it } from 'vitest';
import { validateActionSuggestion, validateBindDataSuggestion } from './suggestion-validation';
import type { Component } from '../stores/components';
import type { DataSource } from '../stores/data-source';

const components: Component[] = [
  {
    id: 1,
    name: 'Page',
    props: {},
    desc: '页面',
    children: [
      { id: 2, name: 'Table', props: {}, desc: '表格', parentId: 1 },
      { id: 3, name: 'Button', props: {}, desc: '按钮', parentId: 1 },
      { id: 4, name: 'Modal', props: {}, desc: '弹窗', parentId: 1 },
    ],
  },
];

const dataSources: DataSource[] = [
  {
    id: 'ds_users',
    name: '用户列表',
    resultKey: 'userList',
    method: 'GET',
    url: '/api/users',
  },
];

describe('suggestion validation', () => {
  it('validates bind-data suggestions against component and data source', () => {
    expect(validateBindDataSuggestion({
      componentId: 2,
      componentName: 'Table',
      bindings: { dataSource: 'requestResults.userList' },
      dataSourceId: 'ds_users',
      resultKey: 'userList',
      stateSuggestions: [],
    }, components, dataSources).valid).toBe(true);
  });

  it('flags invalid action targets', () => {
    const result = validateActionSuggestion({
      componentId: 3,
      eventType: 'onClick',
      actionType: 'setState',
      actionConfig: { componentId: 999, props: { open: true } },
      reason: '打开弹窗',
    }, components, dataSources);

    expect(result.valid).toBe(false);
  });
});
