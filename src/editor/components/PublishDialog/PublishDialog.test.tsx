import { describe, expect, it } from 'vitest';
import {
  buildPublishAccessHint,
  getPublishStatusText,
  normalizePublishRequest,
} from './publish-dialog-utils';

describe('PublishDialog helpers', () => {
  it('returns unpublished label when no result provided', () => {
    expect(getPublishStatusText(null)).toBe('未发布');
  });

  it('returns version label for published result', () => {
    expect(
      getPublishStatusText({
        id: 'pub_1',
        version: 3,
        publishUrl: 'demo',
        status: 'active',
        publishedBy: 'user_1',
        createdAt: '2026-04-21T10:00:00.000Z',
        url: '/p/demo',
      }),
    ).toBe('已发布 · v3');
  });

  it('normalizes blank slug before submit', () => {
    expect(
      normalizePublishRequest({
        slug: '   ',
        title: '系统设置',
        description: '描述',
      }),
    ).toEqual({
      title: '系统设置',
      description: '描述',
    });
  });

  it('keeps chinese slug when provided', () => {
    expect(
      normalizePublishRequest({
        slug: '系统设置',
        title: '系统设置',
      }),
    ).toEqual({
      slug: '系统设置',
      title: '系统设置',
    });
  });

  it('shows localhost access hint', () => {
    expect(
      buildPublishAccessHint('http://localhost:3333/p/system-settings'),
    ).toBe('当前链接使用本地地址，二维码仅当前设备可用。跨设备访问请改用局域网地址或配置公网域名。');
  });

  it('does not show access hint for public url', () => {
    expect(
      buildPublishAccessHint('https://app.example.com/p/system-settings'),
    ).toBe('');
  });
});
