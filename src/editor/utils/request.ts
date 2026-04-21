import type { DataSource } from '../stores/data-source'

export function parseJsonText(text?: string): Record<string, unknown> {
  if (!text?.trim()) {
    return {}
  }

  try {
    const parsed = JSON.parse(text)
    return typeof parsed === 'object' && parsed !== null ? parsed as Record<string, unknown> : {}
  } catch {
    return {}
  }
}

export function buildRequestFromDataSource(dataSource: Pick<DataSource, 'method' | 'url' | 'headersText' | 'paramsText'>) {
  const headers = {
    'Content-Type': 'application/json',
    ...parseJsonText(dataSource.headersText) as Record<string, string>,
  }
  const params = parseJsonText(dataSource.paramsText)
  const options: RequestInit = {
    method: dataSource.method,
    headers,
  }

  if (dataSource.method === 'GET') {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.set(key, String(value))
      }
    })

    const query = searchParams.toString()
    return {
      url: query ? `${dataSource.url}${dataSource.url.includes('?') ? '&' : '?'}${query}` : dataSource.url,
      options,
    }
  }

  options.body = JSON.stringify(params)
  return {
    url: dataSource.url,
    options,
  }
}

export async function executeDataSourceRequest(
  dataSource: Pick<DataSource, 'method' | 'url' | 'headersText' | 'paramsText'>,
  fetcher: typeof fetch = fetch,
): Promise<unknown> {
  const request = buildRequestFromDataSource(dataSource)
  const response = await fetcher(request.url, request.options)
  const data = await response.json()

  if (!response.ok) {
    const message = typeof data?.message === 'string' ? data.message : '请求失败'
    throw new Error(message)
  }

  return data
}
