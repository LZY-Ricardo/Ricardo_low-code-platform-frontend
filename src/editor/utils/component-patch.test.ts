import { describe, expect, it } from 'vitest';
import { applyReplacePatch } from './component-patch';
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
        ],
      },
    ],
  },
];

describe('component patch', () => {
  it('replaces a subtree while keeping the target root id', () => {
    const next = applyReplacePatch(components, 2, {
      id: 99,
      name: 'Form',
      props: { layout: 'vertical' },
      desc: '表单',
      children: [
        {
          id: 100,
          name: 'Input',
          props: { placeholder: '姓名' },
          desc: '输入框',
        },
      ],
    });

    const replaced = next[0].children?.[0];
    expect(replaced?.id).toBe(2);
    expect(replaced?.name).toBe('Form');
    expect(replaced?.children?.[0]?.id).not.toBe(100);
    expect(replaced?.children?.[0]?.parentId).toBe(2);
  });
});
