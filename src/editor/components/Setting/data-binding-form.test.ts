import { describe, expect, it } from 'vitest'
import { filterBindingValues } from './data-binding-form'

describe('data binding form helper', () => {
  it('filters out stale fields from other components', () => {
    expect(filterBindingValues(
      {
        text: 'variables.keyword',
        dataSource: 'requestResults.userList',
      },
      ['text'],
    )).toEqual({
      text: 'variables.keyword',
    })
  })

  it('removes empty values', () => {
    expect(filterBindingValues(
      {
        text: '',
        title: 'variables.title',
      },
      ['text', 'title'],
    )).toEqual({
      title: 'variables.title',
    })
  })
})
