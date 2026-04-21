import { Tag as AntdTag } from 'antd'
import type { CommonComponentProps } from '../../interface'
import { normalizeTagColor } from './props'

export default function Tag({ id, text, color, styles }: CommonComponentProps) {
  return (
    <div data-component-id={id} style={styles}>
      <AntdTag color={normalizeTagColor(color)}>
        {typeof text === 'string' ? text : '标签'}
      </AntdTag>
    </div>
  )
}
