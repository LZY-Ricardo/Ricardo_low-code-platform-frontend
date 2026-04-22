import { describe, expect, it } from 'vitest';
import { buildTrendBars, inferFormFieldsFromComponents, analyzeProjectFormBinding, bindFormSchemaToProject } from './form-utils';
import { serializeProjectSnapshot } from '../editor/utils/project-snapshot';

describe('form utils', () => {
  it('builds non-zero trend percentages', () => {
    const result = buildTrendBars([
      { date: '2026-04-20', count: 1 },
      { date: '2026-04-21', count: 5 },
    ]);

    expect(result[0].percent).toBeGreaterThan(0);
    expect(result[1].percent).toBe(100);
  });

  it('infers form fields from editor components', () => {
    const result = inferFormFieldsFromComponents([
      { id: 2, name: 'Input', props: { placeholder: '姓名' } },
      { id: 3, name: 'Select', props: { placeholder: '类型', optionsText: '学生,老师' } },
    ]);

    expect(result).toHaveLength(2);
    expect(result[0].key).toBe('field_2');
    expect(result[1].options).toEqual(['学生', '老师']);
  });

  it('prefers a unique unbound form component for field inference and binding', () => {
    const projectComponents = [
      {
        id: 1,
        name: 'Page',
        props: {},
        desc: '页面',
        children: [
          {
            id: 10,
            name: 'Form',
            props: { collectData: false, formId: '' },
            desc: '表单',
            children: [
              { id: 11, name: 'Input', props: { placeholder: '姓名' }, desc: '输入框' },
            ],
          },
          { id: 12, name: 'Input', props: { placeholder: '页面筛选' }, desc: '输入框' },
        ],
      },
    ];

    const analysis = analyzeProjectFormBinding(projectComponents);

    expect(analysis.reason).toBe('auto-bind-ready');
    expect(analysis.targetComponentId).toBe(10);
    expect(analysis.fields).toHaveLength(1);
    expect(analysis.fields[0].key).toBe('field_11');
  });

  it('prefers the selected unbound form component when multiple forms exist', () => {
    const projectComponents = [
      {
        id: 1,
        name: 'Page',
        props: {},
        desc: '页面',
        children: [
          {
            id: 10,
            name: 'Form',
            props: { collectData: false, formId: '' },
            desc: '表单',
            children: [
              { id: 11, name: 'Input', props: { placeholder: 'A' }, desc: '输入框' },
            ],
          },
          {
            id: 20,
            name: 'Form',
            props: { collectData: false, formId: '' },
            desc: '表单',
            children: [
              { id: 21, name: 'Input', props: { placeholder: 'B' }, desc: '输入框' },
            ],
          },
        ],
      },
    ];

    const analysis = analyzeProjectFormBinding(projectComponents, {
      preferredComponentId: 20,
    });

    expect(analysis.reason).toBe('auto-bind-ready');
    expect(analysis.targetComponentId).toBe(20);
    expect(analysis.fields[0].key).toBe('field_21');
  });

  it('binds form schema id back into serialized editor snapshot', () => {
    const projectComponents = serializeProjectSnapshot({
      pages: [
        {
          id: 'page_1',
          name: '页面 1',
          components: [
            {
              id: 1,
              name: 'Page',
              props: {},
              desc: '页面',
              children: [
                {
                  id: 20,
                  name: 'Form',
                  props: { collectData: false, formId: '' },
                  desc: '表单',
                  children: [],
                },
              ],
            },
          ],
        },
      ],
      activePageId: 'page_1',
      dataSources: [],
      variables: {},
      sharedStyles: [],
      themeId: 'ocean',
    });

    const next = bindFormSchemaToProject(projectComponents, 20, 'form_123');
    const meta = (next[0].props as { __editorMeta?: { pages: Array<{ components: Array<{ children?: Array<{ props: Record<string, unknown> }> }> }> } }).__editorMeta;
    const boundForm = meta?.pages[0]?.components[0]?.children?.[0];

    expect(boundForm?.props.formId).toBe('form_123');
    expect(boundForm?.props.collectData).toBe(true);
  });
});
