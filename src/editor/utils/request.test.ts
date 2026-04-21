import { describe, expect, it } from 'vitest'
import { buildRequestFromDataSource, executeDataSourceRequest, parseJsonText } from './request'

describe('request utils', () => {
  it('parses JSON text safely', () => {
    expect(parseJsonText('{\n  "page": 1\n}')).toEqual({ page: 1 })
    expect(parseJsonText('')).toEqual({})
  })

  it('builds GET request with query params and headers', () => {
    const result = buildRequestFromDataSource({
      method: 'GET',
      url: '/api/users',
      headersText: '{ "Authorization": "Bearer token" }',
      paramsText: '{ "page": 1 }',
    })

    expect(result.url).toContain('/api/users?page=1')
    expect(result.options.method).toBe('GET')
    expect(result.options.headers).toMatchObject({
      'Content-Type': 'application/json',
      Authorization: 'Bearer token',
    })
  })

  it('builds POST request with json body', () => {
    const result = buildRequestFromDataSource({
      method: 'POST',
      url: '/api/users/search',
      paramsText: '{ "keyword": "react" }',
    })

    expect(result.url).toBe('/api/users/search')
    expect(result.options.method).toBe('POST')
    expect(result.options.body).toBe('{"keyword":"react"}')
  })

  it('executes data source requests and returns response json', async () => {
    const data = await executeDataSourceRequest(
      {
        method: 'GET',
        url: '/api/users',
      },
      (async () => ({
        ok: true,
        json: async () => [{ id: 1, name: '张三' }],
      })) as unknown as typeof fetch,
    )

    expect(data).toEqual([{ id: 1, name: '张三' }])
  })
})
