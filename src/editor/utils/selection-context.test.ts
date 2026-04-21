import { describe, expect, it } from 'vitest';
import { buildSelectionContext } from './selection-context';
import type { Component } from '../stores/components';

const components: Component[] = [
  {
    id: 1,
    name: 'Page',
    props: {},
    desc: '页面',
    children: [
      {
        id: 2,
        name: 'Container',
        props: {},
        desc: '容器',
        parentId: 1,
        children: [
          {
            id: 3,
            name: 'Button',
            props: { text: '提交' },
            desc: '按钮',
            parentId: 2,
          },
          {
            id: 4,
            name: 'Text',
            props: { text: '说明' },
            desc: '文本',
            parentId: 2,
          },
        ],
      },
    ],
  },
];

describe('selection context', () => {
  it('builds current, parent and sibling context for selected component', () => {
    const context = buildSelectionContext(components, 3);

    expect(context.selected?.id).toBe(3);
    expect(context.parent?.id).toBe(2);
    expect(context.siblings.map((item) => item.id)).toEqual([4]);
    expect(context.summary).toContain('当前选中');
    expect(context.summary).toContain('Button');
    expect(context.summary).toContain('兄弟');
  });
});
