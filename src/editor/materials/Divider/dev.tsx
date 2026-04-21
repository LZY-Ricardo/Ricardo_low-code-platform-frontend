import { Divider as AntdDivider } from 'antd'
import type { CommonComponentProps } from '../../interface'
import { normalizeDividerOrientation } from './props'

export default function Divider({ id, text, orientation, styles }: CommonComponentProps) {
  return (
    <div data-component-id={id} style={styles}>
      <AntdDivider orientation={normalizeDividerOrientation(orientation)}>
        {typeof text === 'string' ? text : '分割线'}
      </AntdDivider>
    </div>
  )
}
