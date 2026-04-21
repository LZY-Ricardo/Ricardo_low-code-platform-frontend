import { Tag as AntdTag } from 'antd'
import type { CommonComponentProps } from '../../interface'
import { normalizeTagColor } from './props'

export default function Tag({ text, color, styles }: CommonComponentProps) {
  return (
    <AntdTag color={normalizeTagColor(color)} style={styles}>
      {typeof text === 'string' ? text : '标签'}
    </AntdTag>
  )
}
