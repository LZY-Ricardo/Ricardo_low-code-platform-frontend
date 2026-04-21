import { Col as AntdCol } from 'antd'
import type { CommonComponentProps } from '../../interface'
import { normalizeGridSpan } from './props'

export default function ColProd({ span, children, styles }: CommonComponentProps) {
  return (
    <AntdCol span={normalizeGridSpan(span)} style={styles}>
      {children}
    </AntdCol>
  )
}
