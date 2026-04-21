import { Table as AntdTable } from 'antd'
import type { CommonComponentProps } from '../../interface'
import { buildTableColumnsFromRecords, parseTableColumns, parseTableRows } from './parser'

export default function Table({ id, columnsText, dataText, dataSource, styles }: CommonComponentProps) {
  const resolvedDataSource = Array.isArray(dataSource)
    ? dataSource
    : parseTableRows(typeof dataText === 'string' ? dataText : '')
  const columns = Array.isArray(dataSource)
    ? buildTableColumnsFromRecords(resolvedDataSource as Array<Record<string, unknown>>)
    : parseTableColumns(typeof columnsText === 'string' ? columnsText : '')

  return (
    <AntdTable
      id={id !== undefined && id !== null ? String(id) : undefined}
      columns={columns}
      dataSource={resolvedDataSource}
      pagination={false}
      size="small"
      style={styles}
    />
  )
}
