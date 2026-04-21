import { executeDataSourceRequest } from './request';
import type { BindDataSuggestion } from '../api/ai';
import type { DataSource } from '../stores/data-source';

export async function previewBindingSuggestion(
  suggestion: BindDataSuggestion,
  dataSources: DataSource[],
  fetcher?: typeof fetch,
): Promise<{ resultKey: string; data: unknown }> {
  const targetDataSource = suggestion.dataSourceId
    ? dataSources.find((item) => item.id === suggestion.dataSourceId)
    : dataSources.find((item) => item.resultKey === suggestion.resultKey);

  if (!targetDataSource) {
    throw new Error('未找到建议对应的数据源');
  }

  const data = await executeDataSourceRequest(targetDataSource, fetcher);
  return {
    resultKey: targetDataSource.resultKey,
    data,
  };
}
