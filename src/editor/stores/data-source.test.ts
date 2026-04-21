import { beforeEach, describe, expect, it } from 'vitest'
import { useDataSourceStore } from './data-source'

beforeEach(() => {
  useDataSourceStore.setState({
    dataSources: [],
    activeDataSourceId: null,
  })
})

describe('data source store', () => {
  it('adds a data source and marks it active', () => {
    useDataSourceStore.getState().addDataSource({
      name: '用户列表',
      resultKey: 'userList',
      method: 'GET',
      url: '/api/users',
    })

    const state = useDataSourceStore.getState()
    expect(state.dataSources).toHaveLength(1)
    expect(state.activeDataSourceId).toBe(state.dataSources[0].id)
  })

  it('updates an existing data source', () => {
    useDataSourceStore.getState().addDataSource({
      name: '用户列表',
      resultKey: 'userList',
      method: 'GET',
      url: '/api/users',
    })
    const id = useDataSourceStore.getState().dataSources[0].id

    useDataSourceStore.getState().updateDataSource(id, {
      method: 'POST',
      url: '/api/users/search',
    })

    const updated = useDataSourceStore.getState().dataSources[0]
    expect(updated.method).toBe('POST')
    expect(updated.url).toBe('/api/users/search')
  })

  it('removes a data source and clears active selection when needed', () => {
    useDataSourceStore.getState().addDataSource({
      name: '用户列表',
      resultKey: 'userList',
      method: 'GET',
      url: '/api/users',
    })
    const id = useDataSourceStore.getState().dataSources[0].id

    useDataSourceStore.getState().removeDataSource(id)

    expect(useDataSourceStore.getState().dataSources).toHaveLength(0)
    expect(useDataSourceStore.getState().activeDataSourceId).toBeNull()
  })
})
