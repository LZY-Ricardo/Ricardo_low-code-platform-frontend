import { describe, expect, it } from 'vitest'
import { resolveBindingExpression, resolveBindingsMap } from './binding'

const runtime = {
  variables: {
    keyword: 'react',
  },
  requestResults: {
    userList: [
      { name: '张三', status: '正常' },
      { name: '李四', status: '请假' },
    ],
  },
}

describe('binding utils', () => {
  it('resolves plain path bindings', () => {
    expect(resolveBindingExpression('variables.keyword', runtime)).toBe('react')
    expect(resolveBindingExpression('requestResults.userList', runtime)).toEqual(runtime.requestResults.userList)
  })

  it('resolves template bindings', () => {
    expect(resolveBindingExpression('当前关键字：{{variables.keyword}}', runtime)).toBe('当前关键字：react')
  })

  it('merges bindings into props', () => {
    expect(resolveBindingsMap(
      { text: '默认文案' },
      { text: '当前关键字：{{variables.keyword}}' },
      runtime,
    )).toEqual({ text: '当前关键字：react' })
  })
})
