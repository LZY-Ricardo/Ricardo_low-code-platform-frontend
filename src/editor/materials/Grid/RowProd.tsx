import { Row as AntdRow } from 'antd'
import type { CommonComponentProps } from '../../interface'

export default function RowProd({ gutter, children, styles }: CommonComponentProps) {
  return (
    <AntdRow gutter={typeof gutter === 'number' ? gutter : 16} style={styles}>
      {children}
    </AntdRow>
  )
}
