import { describe, expect, it } from 'vitest'
import { buildTableColumnsFromRecords, parseTableColumns, parseTableRows } from './parser'

describe('table parser', () => {
  it('parses comma-separated columns into table definitions', () => {
    expect(parseTableColumns('姓名,年级,状态')).toEqual([
      { title: '姓名', dataIndex: 'col_0', key: 'col_0' },
      { title: '年级', dataIndex: 'col_1', key: 'col_1' },
      { title: '状态', dataIndex: 'col_2', key: 'col_2' },
    ])
  })

  it('parses newline-separated rows into record objects', () => {
    expect(parseTableRows('张三,大一,正常\n李四,大二,请假')).toEqual([
      { key: 'row_0', col_0: '张三', col_1: '大一', col_2: '正常' },
      { key: 'row_1', col_0: '李四', col_1: '大二', col_2: '请假' },
    ])
  })

  it('ignores empty rows and empty columns', () => {
    expect(parseTableColumns('姓名, ,状态')).toEqual([
      { title: '姓名', dataIndex: 'col_0', key: 'col_0' },
      { title: '状态', dataIndex: 'col_1', key: 'col_1' },
    ])
    expect(parseTableRows('张三,正常\n\n李四,请假')).toEqual([
      { key: 'row_0', col_0: '张三', col_1: '正常' },
      { key: 'row_1', col_0: '李四', col_1: '请假' },
    ])
  })

  it('builds columns from bound record arrays', () => {
    expect(buildTableColumnsFromRecords([
      { name: '张三', status: '正常' },
    ])).toEqual([
      { title: 'name', dataIndex: 'name', key: 'name' },
      { title: 'status', dataIndex: 'status', key: 'status' },
    ])
  })
})
