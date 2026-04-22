import { describe, expect, it } from 'vitest';
import { getAssetPreviewMeta } from './index';

describe('AssetPanel helpers', () => {
  it('returns image preview meta for image assets', () => {
    const result = getAssetPreviewMeta({
      type: 'image',
      url: '/uploads/demo.png',
      originalName: 'demo.png',
    });

    expect(result.mode).toBe('image');
    expect(result.src).toContain('/uploads/demo.png');
  });

  it('returns text preview meta for document assets', () => {
    const result = getAssetPreviewMeta({
      type: 'document',
      url: '/uploads/demo.pdf',
      originalName: 'demo.pdf',
    });

    expect(result.mode).toBe('text');
    expect(result.text).toBe('文档资源');
  });
});
