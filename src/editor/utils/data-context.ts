import type { DataSource } from '../stores/data-source';

export function summarizeDataSources(dataSources: DataSource[]): string {
  if (dataSources.length === 0) {
    return '当前没有可用数据源。';
  }

  return dataSources
    .map((item, index) => {
      const params = parseKeys(item.paramsText);
      return [
        `${index + 1}. ${item.name}`,
        `resultKey=${item.resultKey}`,
        `method=${item.method}`,
        `url=${item.url}`,
        params.length ? `params=${params.join(',')}` : 'params=无',
      ].join('；');
    })
    .join('\n');
}

function parseKeys(text?: string): string[] {
  if (!text?.trim()) {
    return [];
  }

  try {
    return Object.keys(JSON.parse(text) as Record<string, unknown>);
  } catch {
    return [];
  }
}
