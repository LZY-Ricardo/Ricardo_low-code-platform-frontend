import { beforeEach, describe, expect, it, vi } from 'vitest';

const get = vi.fn();
const post = vi.fn();

vi.mock('./client', () => ({
  apiV1Client: {
    get,
    post,
  },
}));

describe('market api', () => {
  beforeEach(() => {
    get.mockReset();
    post.mockReset();
  });

  it('creates a market component', async () => {
    post.mockResolvedValue({
      data: {
        code: 0,
        message: '创建成功',
        data: {
          id: 'cmp_1',
          name: 'MyButton',
          displayName: '我的按钮',
        },
      },
    });

    const { createMarketComponent } = await import('./market');
    const payload = {
      name: 'MyButton',
      displayName: '我的按钮',
      description: '一个按钮',
      category: 'custom',
      icon: 'rocket',
      thumbnail: null,
      code: 'export default function Component(){ return null }',
      defaultProps: { text: '按钮' },
      setterConfig: [{ name: 'text', label: '文本', type: 'input' }],
      version: '1.0.0',
      isPublic: true,
    };

    const result = await createMarketComponent(payload);

    expect(post).toHaveBeenCalledWith('/market/components', payload);
    expect(result.id).toBe('cmp_1');
    expect(result.displayName).toBe('我的按钮');
  });
});
