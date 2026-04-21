import { describe, expect, it } from 'vitest';
import { formatAiSourceLabel, stringifyAiResult } from './ai-debug';

describe('ai debug utils', () => {
  it('formats openrouter source labels', () => {
    expect(
      formatAiSourceLabel({
        taskType: 'generate-page',
        summary: 'x',
        patches: [],
        warnings: [],
        confidence: 0.8,
        source: 'openrouter',
        sourceModel: 'nvidia/demo',
      }),
    ).toContain('在线模型');
  });

  it('formats fallback source labels', () => {
    expect(
      formatAiSourceLabel({
        taskType: 'generate-page',
        summary: 'x',
        patches: [],
        warnings: [],
        confidence: 0.8,
        source: 'fallback',
        fallbackReason: 'frontend_request_failed',
      }),
    ).toContain('本地回退');
  });

  it('stringifies ai result with indentation', () => {
    const content = stringifyAiResult({
      taskType: 'generate-page',
      summary: 'x',
      patches: [],
      warnings: [],
      confidence: 0.8,
      source: 'fallback',
      fallbackReason: 'frontend_request_failed',
    });

    expect(content).toContain('"taskType": "generate-page"');
  });
});
