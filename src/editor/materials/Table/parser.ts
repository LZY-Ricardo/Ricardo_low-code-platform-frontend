export interface ParsedTableColumn {
  title: string
  dataIndex: string
  key: string
}

export interface ParsedTableRow {
  key: string
  [key: string]: string
}

export function parseTableColumns(input: string): ParsedTableColumn[] {
  return input
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
    .map((title, index) => ({
      title,
      dataIndex: `col_${index}`,
      key: `col_${index}`,
    }))
}

export function parseTableRows(input: string): ParsedTableRow[] {
  return input
    .split('\n')
    .map((row) => row.trim())
    .filter(Boolean)
    .map((row, rowIndex) => {
      const cells = row.split(',').map((item) => item.trim())
      return cells.reduce<ParsedTableRow>((record, cell, colIndex) => {
        record[`col_${colIndex}`] = cell
        return record
      }, { key: `row_${rowIndex}` })
    })
}

export function buildTableColumnsFromRecords(records: Array<Record<string, unknown>>): ParsedTableColumn[] {
  const firstRecord = records[0]
  if (!firstRecord) {
    return []
  }

  return Object.keys(firstRecord)
    .filter((key) => key !== 'key')
    .map((key) => ({
      title: key,
      dataIndex: key,
      key,
    }))
}
