import { Divider as AntdDivider } from 'antd'
import type { CommonComponentProps } from '../../interface'
import { normalizeDividerOrientation } from './props'

export default function Divider({ text, orientation, styles }: CommonComponentProps) {
  return (
    <AntdDivider orientation={normalizeDividerOrientation(orientation)} style={styles}>
      {typeof text === 'string' ? text : '分割线'}
    </AntdDivider>
  )
}
