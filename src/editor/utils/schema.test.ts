import { describe, expect, it } from 'vitest'
import { createEditorSchema, isEditorSchema } from './schema'

const schema = createEditorSchema({
  name: 'test',
  pages: [{ id: 'page_1', name: '页面 1', components: [] }],
  activePageId: 'page_1',
  dataSources: [],
  variables: {},
  sharedStyles: [],
  themeId: 'ocean',
})

describe('editor schema', () => {
  it('accepts valid schemas', () => {
    expect(isEditorSchema(schema)).toBe(true)
  })

  it('rejects schemas with invalid active page ids', () => {
    expect(isEditorSchema({ ...schema, activePageId: 'missing' })).toBe(false)
  })

  it('rejects schemas without pages', () => {
    expect(isEditorSchema({ ...schema, pages: [] })).toBe(false)
  })

  it('rejects duplicate page ids and non-object variables', () => {
    expect(isEditorSchema({
      ...schema,
      pages: [schema.pages[0], { ...schema.pages[0] }],
    })).toBe(false)
    expect(isEditorSchema({
      ...schema,
      variables: [],
    })).toBe(false)
  })
})
