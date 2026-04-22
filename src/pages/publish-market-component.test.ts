import { describe, expect, it } from 'vitest';
import {
  buildCreateMarketComponentPayload,
  createPublishComponentFormValues,
  parseStructuredJsonInput,
} from './publish-market-component-utils';

describe('publish market component helpers', () => {
  it('provides stable default form values', () => {
    expect(createPublishComponentFormValues()).toEqual({
      name: '',
      displayName: '',
      description: '',
      category: 'custom',
      icon: '',
      thumbnail: '',
      code: '',
      defaultPropsText: '{}',
      setterConfigText: '[]',
      version: '1.0.0',
      isPublic: true,
    });
  });

  it('parses object and array json inputs', () => {
    expect(parseStructuredJsonInput('{"text":"按钮"}', 'defaultProps')).toEqual({
      text: '按钮',
    });
    expect(
      parseStructuredJsonInput(
        '[{"name":"text","label":"文本","type":"input"}]',
        'setterConfig',
      ),
    ).toEqual([{ name: 'text', label: '文本', type: 'input' }]);
  });

  it('rejects invalid shape for structured json inputs', () => {
    expect(() => parseStructuredJsonInput('[]', 'defaultProps')).toThrow(
      'defaultProps 必须是 JSON 对象',
    );
    expect(() => parseStructuredJsonInput('{"name":"text"}', 'setterConfig')).toThrow(
      'setterConfig 必须是 JSON 数组',
    );
  });

  it('builds request payload from form values', () => {
    const payload = buildCreateMarketComponentPayload({
      name: '  MyButton  ',
      displayName: '  我的按钮  ',
      description: ' 一个按钮组件 ',
      category: 'actions',
      icon: 'rocket',
      thumbnail: ' https://example.com/button.png ',
      code: ' export default function Component(){ return null } ',
      defaultPropsText: '{"text":"按钮"}',
      setterConfigText: '[{"name":"text","label":"文本","type":"input"}]',
      version: ' 2.0.0 ',
      isPublic: false,
    });

    expect(payload).toEqual({
      name: 'MyButton',
      displayName: '我的按钮',
      description: '一个按钮组件',
      category: 'actions',
      icon: 'rocket',
      thumbnail: 'https://example.com/button.png',
      code: 'export default function Component(){ return null }',
      defaultProps: { text: '按钮' },
      setterConfig: [{ name: 'text', label: '文本', type: 'input' }],
      version: '2.0.0',
      isPublic: false,
    });
  });
});
