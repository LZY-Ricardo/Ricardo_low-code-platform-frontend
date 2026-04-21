import type {
  BindDataResult,
  EditSelectionResult,
  GenerateActionResult,
  GeneratePageResult,
} from '../api/ai';

type AiDebugResult =
  | GeneratePageResult
  | EditSelectionResult
  | BindDataResult
  | GenerateActionResult;

export function formatAiSourceLabel(result: AiDebugResult): string {
  if (result.source === 'openrouter') {
    return `在线模型${result.sourceModel ? ` (${result.sourceModel})` : ''}`;
  }

  return `本地回退${result.fallbackReason ? ` (${result.fallbackReason})` : ''}`;
}

export function stringifyAiResult(result: AiDebugResult): string {
  return JSON.stringify(result, null, 2);
}
